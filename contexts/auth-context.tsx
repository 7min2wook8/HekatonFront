"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  username: string
  email: string
  phone_number?: string 
}

interface Profile {
    //userId: string
    fullName?: string
    bio?: string
    profileImageUrl?: string
    education?: string
    experience?: string
    portfolioUrl?: string
}

interface AuthContextType {
  user: User | null 
  profile: Profile | null 
  isLoading: boolean
  isAuthenticated: boolean
  viewProfile: () => Promise<{ success: boolean; message?: string; } | null >
  saveProfile: () => Promise<{ success: boolean; message?: string } | null>
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  signUp: (email: string, password: string, username: string, phone: string) => Promise<{ success: boolean; message: string }>
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  updateUser: (userData: Partial<User>) => void

}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_SERVER_URL = 'http://localhost:60000'; // auth-server 직접 호출
const API_GATEWAY_URL = 'http://localhost:8080'; // api-gateway 호출

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)  
  const [profile, setProfile] = useState<Profile | null>(null)  
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // 컴포넌트 마운트 시 저장된 세션 확인
  useEffect(() => {
    const checkSession = () => {
      try {
        const savedUser = localStorage.getItem("EqualLocal_user")
        const sessionExpiry = localStorage.getItem("EqualLocal_session_expiry")

        if (savedUser && sessionExpiry) {
          const expiryTime = Number.parseInt(sessionExpiry)
          const currentTime = Date.now()

          if (currentTime < expiryTime) {
            // 세션이 유효한 경우
            setUser(JSON.parse(savedUser))
          } else {
            // 세션이 만료된 경우
            localStorage.removeItem("EqualLocal_user")
            localStorage.removeItem("EqualLocal_session_expiry")
          }
        }
      } catch (error) {
        console.error("세션 확인 중 오류:", error)
        localStorage.removeItem("EqualLocal_user")
        localStorage.removeItem("EqualLocal_session_expiry")
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  // 자동 로그아웃 타이머 설정
  useEffect(() => {
    if (user) {
      const sessionExpiry = localStorage.getItem("EqualLocal_session_expiry")
      if (sessionExpiry) {
        const expiryTime = Number.parseInt(sessionExpiry)
        const currentTime = Date.now()
        const timeUntilExpiry = expiryTime - currentTime

        if (timeUntilExpiry > 0) {
          const timer = setTimeout(() => {
            logout()
            alert("세션이 만료되어 자동으로 로그아웃되었습니다.")
            router.push('/')
          }, timeUntilExpiry)

          return () => clearTimeout(timer)
        }
      }
    }
  }, [user])

  const signUp = async (email: string, password: string, username: string, phone: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true)
    try {
      const response = await fetch(`${AUTH_SERVER_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // 쿠키 포함
                    body: JSON.stringify({
                        username: username,
                        email: email,
                        password: password
                    })
                });

      if (response.ok) {

        console.log("회원가입 성공:")

        const msRes = await login(username, password)
        if(!msRes.success){
          return msRes
        }else
        {
           console.log("자동 로그인 실행")
        }

        setIsLoading(false)

        return { success: true, message: "회원가입에 성공했습니다." }
      } else {
        const msg = await response.text()
        setIsLoading(false)
        return { success: false, message: msg || "회원가입에 실패했습니다." }
      }
    } catch (error) {
      setIsLoading(false)
      return { success: false, message: "회원가입 중 오류가 발생했습니다." }
    }
  }
  
  // 로그인 함수
  // 이메일과 비밀번호를 받아서 로그인 처리
  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true)

    
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    try {
      // 로그인 확인
      const response = await fetch(`${AUTH_SERVER_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // 쿠키 포함
                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                });
      
      if (response.ok) {
        // 로그인 성공 시 사용자 정보 받아오기 (예: /api/users/me)
        const meRes = await fetch(`${API_GATEWAY_URL}/api/users/me`, {
                    method: 'GET',
                    credentials: 'include' // JWT 쿠키 포함
        });

        if (!meRes.ok) {
          setIsLoading(false)
          return { success: false, message: "사용자 정보를 불러오지 못했습니다." }
        }
        const userData = await meRes.json()
        const sessionExpiry = Date.now() + 6 *(10 * 60 * 1000)// 10분 * 1분 * 1초 : 10분으로 설정

        // 로컬 스토리지에 사용자 정보와 세션 만료 시간 저장
        localStorage.setItem("EqualLocal_user", JSON.stringify(userData))
        localStorage.setItem("EqualLocal_session_expiry", sessionExpiry.toString())

        setUser(await userData)
        setIsLoading(false)
        console.log(userData)
        return { success: true, message: "로그인에 성공했습니다." }
      } else {
        const msg = await response.text()
        setIsLoading(false)
        return { success: false, message: msg +  "이메일 또는 비밀번호가 올바르지 않습니다." || "이메일 또는 비밀번호가 올바르지 않습니다." }
      }

    } catch (error) {
      setIsLoading(false)
      return { success: false, message: "로그인 중 오류가 발생했습니다." }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("EqualLocal_user")
    localStorage.removeItem("EqualLocal_session_expiry")
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem("EqualLocal_user", JSON.stringify(updatedUser))
    }
  }

  //userid만 profile 데이터 저장
  const FallbackProfile = (user: User): Profile => ({  
    fullName: "user",
    bio: "",
    profileImageUrl: "/placeholder.svg",
    education: "",
    experience: "",
    portfolioUrl: "",
  });

          
  const viewProfile = async () => {
    console.log("getProfile 실행")
    if (!user){   
       return null
    } 
     
    try {
      //데이터 요청
      const response = await fetch(`${API_GATEWAY_URL}/api/users/me/profile`, {
                    method: 'GET',
                    credentials: 'include'
      });

      //데이터가 없으면
      if (!response.ok) {
         const parsedProfile: Profile = {         
          fullName: "user",
          bio: "",
          profileImageUrl: "/placeholder.svg",
          education: "",
          experience:  "",
          portfolioUrl: "",
        };

        //profile 데이터 저장
        setProfile(parsedProfile)

        return {
          success: false,
          message: "사용자 정보를 불러오지 못했습니다.",          
        }        
      }

      const profileData = await response.json()     
      //console.log("profileData : " + profileData.portfolioUrl)
      if (profileData) { 

        const parsedProfile: Profile = {
          fullName: profileData.fullName || "user",
          bio: profileData.bio || "",
          profileImageUrl: profileData.profileImageUrl || "/placeholder.svg",
          education: profileData.education || "",
          experience: profileData.experience || "",
          portfolioUrl: profileData.portfolioUrl || "",
        };
        //profile 데이터 저장
        setProfile(parsedProfile)
        
        return {
          success: true,
          message: "프로필 불러오기 성공",            
        }

      }
      else{

          setProfile(FallbackProfile(user));
         
          return {
            success: false,
            message: "받은 데이터 정보가 없습니다.",            
          }
        }

    } catch (error) {

      console.error("프로필 불러오기 오류:", error)

        return {
        success: false,
        message: "프로필 불러오기 오류",        
      }

    }

  }

  const saveProfile = async (): Promise<{ success: boolean; message?: string } | null> => {
    if (!user) return null
    
    try {         

                       console.log("userId:" + user.id) 
                       console.log ("fullName:"+ profile?.fullName),
                       console.log ("bio:"+ profile?.bio),
                       console.log ("profileImageUrl: "+profile?.profileImageUrl), //| 'https://example.com/profile.jpg',
                       console.log ("education:"+ profile?.education),
                       console.log ("experience:" +profile?.experience),
                       console.log ("portfolioUrl:" +profile?.portfolioUrl) //'https://example.com/portfolio'

      const response = await fetch(`${API_GATEWAY_URL}/api/users/me/profile`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        userId: user.id,
                        fullName: profile?.fullName,
                        bio: profile?.bio,
                        profileImageUrl: profile?.profileImageUrl, //| 'https://example.com/profile.jpg',
                        education: profile?.education,
                        experience: profile?.experience,
                        portfolioUrl: profile?.portfolioUrl //'https://example.com/portfolio'
                    })
                });

      if (!response.ok) {
        const msg = await response.text()
        return { success: false, message: msg || "프로필 업데이트에 실패했습니다." }
      }
      // Optionally update user state here if needed
      return { success: true, message: "프로필이 성공적으로 업데이트되었습니다." }
    } catch (error) {
      console.error("프로필 업데이트 오류:", error)
      return { success: false, message: "프로필 업데이트 중 오류가 발생했습니다." }
    }

    
  }

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    viewProfile,
    saveProfile,
    setProfile,
    login,
    logout,
    updateUser,
    
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
