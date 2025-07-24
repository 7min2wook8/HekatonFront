"use client"

import { createContext, SetStateAction, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { List } from "postcss/lib/list"

interface User {
  id: string
  username: string
  email: string
  phoneNumber: string 
}

export interface Profile {    
    fullName : string
    bio : string
    profileImageUrl : string
    education : string
    experience : string
    portfolioUrl : string
}

export interface UserSkills{
  id: string
  userId: string
  skillId: number
  proficiency: number
  created_at: string
}

export interface Skills{  
  id: number
  name : string
  category : string  
  description : string  
}

export interface NcsCategory{
  id : string
  code : string
  name : string
  parent_code : string
  level : string
  description : string 
  
}


interface AuthContextType {
  user: User | null 
  isLoading: boolean
  isAuthenticated: boolean
  viewProfile: () => Promise<{ success: boolean; message: string; profile: Profile;}>
  //프로필 데이터를 DB에 저장
  saveProfile: (profile: Profile) => Promise<{ success: boolean; message: string;}>  
  getOtherUserProfile :( userId : string ) => Promise<{ success: boolean; otherUserProfile?: Profile | null; message?: string  } | null>
  signUp: (email: string, password: string, username: string, phone: string) => Promise<{ success: boolean; message: string }>
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  viewUserSkills : () => Promise<{ success: boolean; message: string; data : UserSkills[] | [] } >
  getSkills : () => Promise<{ success: boolean; message: string;  data : Skills[]} >
  getNcsCategory : () => Promise<{success:boolean; message: string}>
  saveUserSkills: (skills : UserSkills[]) => Promise<{ success: boolean; message: string }>
  
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_SERVER_URL = 'http://localhost:60000'; // auth-server 직접 호출
const API_GATEWAY_URL = 'http://localhost:8080'; // api-gateway 호출

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)    
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // 컴포넌트 마운트 시 저장된 세션 확인
  // useEffect(() => {
  //   const checkSession = () => {
  //     try {
  //       //const savedUser = localStorage.getItem("EqualLocal_user")
  //       //const sessionExpiry = localStorage.getItem("EqualLocal_session_expiry")

  //       //if (savedUser && sessionExpiry) {
  //         //const expiryTime = Number.parseInt(sessionExpiry)
  //         //const currentTime = Date.now()

  //         //if (currentTime < expiryTime) {
  //           // 세션이 유효한 경우
  //           //setUser(JSON.parse(savedUser))
  //         //} else {
  //           // 세션이 만료된 경우
  //           //localStorage.removeItem("EqualLocal_user")
  //           //localStorage.removeItem("EqualLocal_session_expiry")
  //         }
  //       }
  //     //} catch (error) {
  //       //console.error("세션 확인 중 오류:", error)
  //       //localStorage.removeItem("EqualLocal_user")
  //       //localStorage.removeItem("EqualLocal_session_expiry")
  //     //} finally {
  //       //setIsLoading(false)
  //     //}
  //   //}

  //   //checkSession()
  // }, [])

  // 자동 로그아웃 타이머 설정
  // useEffect(() => {
  //   if (user) {
  //     const sessionExpiry = localStorage.getItem("EqualLocal_session_expiry")
  //     if (sessionExpiry) {
  //       const expiryTime = Number.parseInt(sessionExpiry)
  //       const currentTime = Date.now()
  //       const timeUntilExpiry = expiryTime - currentTime

  //       if (timeUntilExpiry > 0) {
  //         const timer = setTimeout(() => {
  //           logout()
  //           alert("세션이 만료되어 자동으로 로그아웃되었습니다.")
  //           router.push('/')
  //         }, timeUntilExpiry)

  //         return () => clearTimeout(timer)
  //       }
  //     }
  //   }
  // }, [user])

  //회원가입 요청
  const signUp = async (email: string, password: string, username: string, phoneNumber: string): Promise<{ success: boolean; message: string }> => {
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
                        password: password,
                        phone_number : phoneNumber
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
        //console.log("userData : " + userData)
        const sessionExpiry = Date.now() + 6 *(10 * 60 * 1000)// 10분 * 1분 * 1초 : 10분으로 설정

        // 로컬 스토리지에 사용자 정보와 세션 만료 시간 저장
        //localStorage.setItem("EqualLocal_user", JSON.stringify(userData))
        //localStorage.setItem("EqualLocal_session_expiry", sessionExpiry.toString())

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

  const logout = async () => {
setIsLoading(true)

    
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    try {
      // 로그인 확인
      const response = await fetch(`${AUTH_SERVER_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include', // 쿠키 포함                    
                });
      
      if (response.ok) {

        setUser(null)
        setIsLoading(false)
       
        return { success: true, message: "로그아웃 완료." }
      } else {
        const msg = await response.text()
        setIsLoading(false)
        return { success: false, message: msg +  "오류가 발생하였습니다." }
      }

    } catch (error) {
      setIsLoading(false)
      return { success: false, message: "오류가 발생하였습니다." }
    }
    
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      //localStorage.setItem("EqualLocal_user", JSON.stringify(updatedUser))
    }
  }

  //프로필 데이터가 없을 경우
  const FallbackProfile = (): Profile => ({  
    fullName: "",
    bio: "",
    profileImageUrl: "/placeholder.svg",
    education: "",
    experience: "",
    portfolioUrl: "",
  });

  //자신의 프로필 정보 불러오기
  const viewProfile = async () : Promise<{success: boolean; message: string; profile: Profile;}> => {    
    if (!user) return {
          success: false,
          message: "사용자 정보가 없습니다.",
          profile : FallbackProfile()       
        } 

    try {
      //데이터 요청
      const response = await fetch(`${API_GATEWAY_URL}/api/users/profiles/me`, {
                    method: 'GET',
                    credentials: 'include'
      });     
      //데이터가 없으면
      if (!response.ok) {
        return {
          success: false,
          message: "사용자 정보를 불러오지 못했습니다.",
          profile : FallbackProfile()       
        }        
      }
      else{
        
      const profileData = await response.json()     
      
      if (profileData) { 

        const parsedProfile: Profile = {
          fullName: profileData.fullName || "user",
          bio: profileData.bio || "",
          profileImageUrl: profileData.profileImageUrl || "/placeholder.svg",
          education: profileData.education || "",
          experience: profileData.experience || "",
          portfolioUrl: profileData.portfolioUrl || "",
        };
        
        return {
          success: true,
          message: "프로필 불러오기 성공",  
          profile : parsedProfile                
        }

      }
      else{
          return {
            success: false,
            message: "받은 데이터 정보가 없습니다.",  
            profile : FallbackProfile()               
          }
        }
      }

    } catch (error) {

      console.error("프로필 불러오기 오류:", error)

        return {
          success: false,
          message: "프로필 불러오기 오류", 
          profile : FallbackProfile()       
      }

    }
    
  }

  //프로필 추가/수정
  const saveProfile = async (profile: Profile): Promise<{ success: boolean; message: string;}> => {
    if (!user) return { success: false, message: "사용자 정보가 없습니다." }    
    try {      
      const response = await fetch(`${API_GATEWAY_URL}/api/users/profiles/me`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        userId: user.id,                       
                        fullName: profile.fullName,
                        bio: profile?.bio,
                        profileImageUrl: profile?.profileImageUrl, //| 'https://example.com/profile.jpg',
                        education: profile?.education,
                        experience: profile?.experience,
                        portfolioUrl: profile?.portfolioUrl //'https://example.com/portfolio'
                    })
                });

      if (!response.ok) {
        const msg = await response.text()
        return {success: false, message: "프로필 업데이트에 실패했습니다. " + msg }
      }
      // Optionally update user state here if needed
      return { success: true, message: "프로필이 성공적으로 업데이트되었습니다." }

    } catch (error) {

      console.error("프로필 업데이트 오류:", error)
      
      return { success: false, message: "프로필 업데이트 중 오류가 발생했습니다." }
    }

  }

  /*
    특정 사용자의 프로필 조회
    프로필이 없으면 null 리턴
  */
  const getOtherUserProfile = async (userId : string) => {
    
    if (!user) return null

    try {
      //데이터 요청
      const response = await fetch(`${API_GATEWAY_URL}/api/users/profiles/${userId}`, {
                    method: 'GET',
                    credentials: 'include'
      });

      //데이터가 없으면
      if (!response.ok) {         
        
        return{ 
          success: false, 
          otherUserProfile: null,
          message : "프로필 데이터가 없습니다." } 
      }

      const profileData = await response.json()     
      //console.log("profileData : " + profileData.portfolioUrl)
      if (profileData) { 

        const parsedProfile: Profile = {
          fullName: profileData.fullName,
          bio: profileData.bio,
          profileImageUrl: profileData.profileImageUrl,
          education: profileData.education ,
          experience: profileData.experience ,
          portfolioUrl: profileData.portfolioUrl,
        };

        return {
          success: true,
          otherUserProfile: parsedProfile,
          message : "프로필 데이터를 찾았습니다."           
        }

      }
      else{
          return {
            success: false,
            otherUserProfile: null,
            message: "받은 데이터 정보가 없습니다.",            
          }
        }

    } catch (error) {

      console.error("프로필 불러오기 오류:", error)

        return {
        success: false,
        otherUserProfile: null,
        message: "프로필 불러오기 오류",        
      }

    }

  }


  //사용자가 등록한 스킬 정보를 가져옵니다.
  const viewUserSkills = async (): Promise< { success: boolean; message: string; data: UserSkills[] | [] }> => {
    //사용자 정보 체크
    if (!user) return { success: false, message: "사용자 정보가 없습니다.", data:[] }   

    try {
      //데이터 요청
      const response = await fetch(`${API_GATEWAY_URL}/api/users/me/skills`, {
                    method: 'GET',
                    credentials: 'include'
      });
     
      //데이터가 없으면
      if (!response.ok) {
        return{ 
          success: false,
          message : "사용자 스킬 데이터가 없습니다.",
          data : []
        } 
      }

      const rawSkills: any[] = await response.json();

      // 데이터 파싱 (string → number 변환)
      const userSkills: UserSkills[] = rawSkills.map((item) => ({
        id: item.id,
        userId: item.userId, // 또는 item.userID, 백엔드 응답 확인 필요
        skillId: Number(item.skillId),
        proficiency: Number(item.proficiency),
        created_at: item.created_at,
      }));

      
      return {
        success: true,
        message: "사용자 스킬 데이터를 불러왔습니다.",
        data: userSkills,
      }
    } catch (error) {

      console.error("프로필 불러오기 오류:", error)

        return {
        success: false,
        message: "프로필 불러오기 오류",
        data : []        
      }

    }

  }

  const saveUserSkills = async (skills : UserSkills[]): Promise<{ success: boolean; message: string }> => {
     if (!user) return {
        success: false,
        message: "사용자 정보가 없습니다.",        
      }
      

    try {
      //데이터 요청
      const response = await fetch(`${API_GATEWAY_URL}/api/users/me/skills`, {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(skills), // 💡 핵심: skills 배열 그대로 전송
      });
     
      //데이터가 없으면
      if (!response.ok) {
        return{ 
          success: false,
          message : "사용자 스킬 데이터가 없습니다." } 
      }

      return {
        success: true,
        message: "사용자 스킬 데이터를 불러왔습니다.",   
      }

    } catch (error) {
      
        console.error("프로필 불러오기 오류:", error)

        return {
        success: false,
        message: "프로필 불러오기 오류",        
      }

    }

  }

  const getNcsCategory = async (): Promise<{success:boolean; message: string}>=> {

    return { success: true, message: "프로필이 성공적으로 업데이트되었습니다." }
    
  }

  //DB에 저장된 모든 스킬 정보 불러오기
  const getSkills = async (): Promise<{ success: boolean; message: string;  data : Skills[] | [] }> => {

    try{
      const response = await fetch(`${API_GATEWAY_URL}/skills`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',                   
                });

                
      
      if (!response.ok) {        
        return { success: false, message: "기술 데이터를 불러오기에 실패했습니다.", data : [] }
      }
      const skillsData = await response.json()      

      const allSkills: Skills[] = skillsData.map((skill: any) => ({
        id: skill.id || "",
        name: skill.name || "",
        category: skill.category || "",
        description: skill.description || "",
      }));

      //setArraySkills(allSkills)

      return { 
        success : true, 
        message: "기술 데이터를 성공적으로 불러왔습니다.", 
        data: allSkills, 
      }

    } catch (error) {

      console.error("기술 데이터 불러오기 오류:", error)

      return { success : false, message: "기술 데이터를 불러오는 중 오류가 발생했습니다.", data: [] }

    }
    
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    viewProfile,
    saveProfile,
    login,
    logout,
    updateUser,
    viewUserSkills,
    saveUserSkills,
    getSkills,
    getNcsCategory,
    getOtherUserProfile, 
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

