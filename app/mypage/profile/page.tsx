"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Plus, Upload, Save, ArrowLeft, CheckCircle, User } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ProtectedRoute from "@/components/protected-route"
import { Profile, Skills, UserSkills, useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { useRouter } from "next/navigation"


const defaultImage = "/placeholder.svg"

function ProfileEditContent() {

  const { viewProfile, saveProfile, isAuthenticated, user, 
    updateUser, viewUserSkills, saveUserSkills,  getSkills } = useAuth()
  //const [newInterest, setNewInterest] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  //const [success, setSuccess] = useState(false)

  //선택된 스킬 데이터 저장
  const [selectSkill, setSelectSkill] = useState<Skills[]>([]); // 빈 Skills 배열로 초기화

  //모든 스킬 데이터를 가지고 있음
  const [arraySkills, setArraySkills] = useState<Skills[]>([])

  const [profile, setProfile] = useState<Profile>({
    fullName: "",
    bio: "",
    profileImageUrl: "/placeholder.svg",
    education: "",
    experience: "",
    portfolioUrl: "",
  })

  const [isSelectOpen, setIsSelectOpen] = useState(false); // Select 컴포넌트의 열림 상태를 관리하는 새 상태


  const router = useRouter()
  
  useEffect(() => {
    setIsLoading(true)
    //setSuccess(false)

    if (isAuthenticated && user) { // 인증되었고 사용자가 존재할 때만 데이터 가져오기
      fetchUserData();     
    }else
      router.push("/")

    setIsLoading(false)
    //setSuccess(true)
    
  }, [isAuthenticated, user]); // isAuthenticated와 user에 의존

    // 이 useEffect는 AuthProvider에서 기술 스택이 가져와지고 설정된 후 올바르게 로깅될 것입니다.
  useEffect(() => {
    //console.log("현재 selectSkill 상태:", selectSkill);
    // 여기에 사용자의 기존 기술을 미리 선택하도록 설정할 수 있습니다.
    // 예: setSelectSkill(userSkills?.map(us => skills.find(s => s.id === us.skillId)).filter(Boolean) as Skills[]);
  }, [selectSkill]);

  //프로필 및 스킬 정보를 가져옴
  const fetchUserData = async () => {

    try {

      const [profileResult, userSkillsResult, skillsResult] = await Promise.all([
        viewProfile(),
        viewUserSkills(),
        getSkills(),
      ]);

      if(profileResult?.success){
        setProfile(profileResult.profile)
      }else{
        console.warn("프로필 정보가 일부 누락되었거나 실패함");
      }

      let allSkills; //DB에 저장된 모든 스킬 정보 저장
      
      if (skillsResult?.success) {

        allSkills = skillsResult.data ?? []; // ✅ 안전하게 처리
        setArraySkills(allSkills);

      } else {
        console.warn("스킬 정보가 불러오기 실패함");
      }

      if(userSkillsResult?.success){

        const userSkillIds = userSkillsResult.data?.map((us) => us.skillId) ?? [];
        allSkills = skillsResult.data ?? []; // ✅ 안전하게 처리
        const selectedSkills = allSkills.filter((skill) =>
        userSkillIds.includes(skill.id)); // 

        setSelectSkill(selectedSkills); // ✅ 선택된 것만 저장

      }else{
        console.warn("사용자의 스킬 정보가 불러오기 실패함");
      }

    } catch (error) {
      console.error("프로필 또는 스킬 정보 로딩 중 오류:", error);
    }
  };


  // 프로필 저장 핸들러
  // 이 함수는 실제 API 호출을 시뮬레이션합니다.
  const handleSave = async () => {

    if (profile == null || user == null) {
      return;
    }
    setIsLoading(true)
    //setSuccess(false)

    try {
      
      // 실제 API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // 스킬 변환
    const userSkills: UserSkills[] = selectSkill.map(skill => ({
      id:"",
      userId: user.id, // 현재 로그인한 유저 ID
      skillId: skill.id,
      proficiency: 3, // 사용자가 선택할 수 있게 하려면 별도 상태로 관리
      created_at: new Date().toISOString(),
    }));


      const [saveProfileResult, saveUserSkillsResult] = await Promise.all([
        saveProfile(profile),
        saveUserSkills(userSkills)
      ]);

      if (
        saveProfileResult?.success &&
        saveUserSkillsResult?.success
      ) {

        console.log("프로필 업데이트 성공:")
        //setSuccess(true)
        //setTimeout(() => setSuccess(false), 3000)
        router.push("/mypage")
      }
      else{
        console.error("프로필 업데이트에 실패했습니다.")
        return;   
      }
     
    } catch (error) {
      console.error("프로필 업데이트 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addSkill = (skillToAdd: Skills) => {

     if (!selectSkill.some(s => s.id === skillToAdd.id)) {
      setSelectSkill((prev) => [...prev, skillToAdd]);
    }
  }

  const removeSkill = (id: number) => {
    setSelectSkill((prev) => prev.filter((skill) => skill.id !== id));
  }

  if (!user) return null

    // const addInterest = (interest: string) => {
  //   if (interest && !profile.interests.includes(interest)) {
  //     setProfile({
  //       ...profile,
  //       interests: [...profile.interests, interest],
  //     })
  //   }
  //   setNewInterest("")
  // }

  // const removeInterest = (interest: string) => {
  //   setProfile({
  //     ...profile,
  //     interests: profile.interests.filter((i) => i !== interest),
  //   })
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">        
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/mypage">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              돌아가기
            </Button>
          </Link>

          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">프로필 수정</h1>
              <p className="text-gray-600">개인 정보와 관심사를 업데이트하세요</p>
            </div>
          </div>
        </div>

        {/* 성공 메시지 */}
        {/* {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">프로필이 성공적으로 업데이트되었습니다!</AlertDescription>
          </Alert>
        )} */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 프로필 사진 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>프로필 사진</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <Avatar className="w-32 h-32 mx-auto">
                  <AvatarImage src={profile?.profileImageUrl || defaultImage} alt={profile?.fullName} />
                  <AvatarFallback className="text-4xl">{ profile?.fullName?.[0] ?? "U" }</AvatarFallback>
                </Avatar>
                <Button variant="outline" className="w-full bg-transparent" disabled>
                  <Upload className="w-4 h-4 mr-2" />
                  사진 업로드 (준비중)
                </Button>
                <p className="text-sm text-gray-500">JPG, PNG 파일만 업로드 가능합니다. (최대 5MB)</p>
              </CardContent>
            </Card>
          </div>

          {/* 프로필 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input
                      id="name"
                      value={profile?.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      // onChange={(e) => updateUser({ ...thisProfile, email: e.target.value })}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">이메일은 변경할 수 없습니다.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">전화번호</Label>
                    <Input
                      id="phone"
                      value={user.phoneNumber}
                      onChange={(e) => updateUser({ ...user, phoneNumber: e.target.value })}
                      placeholder="010-0000-0000"
                    />
                  </div>
                  {/* <div className="space-y-2">
                    <Label htmlFor="location">지역</Label>
                    <Select
                      value={profile.location}
                      onValueChange={(value) => updateUser({ ...profile, location: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="지역을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="서울">서울</SelectItem>
                        <SelectItem value="부산">부산</SelectItem>
                        <SelectItem value="대구">대구</SelectItem>
                        <SelectItem value="인천">인천</SelectItem>
                        <SelectItem value="광주">광주</SelectItem>
                        <SelectItem value="대전">대전</SelectItem>
                        <SelectItem value="울산">울산</SelectItem>
                        <SelectItem value="세종">세종</SelectItem>
                        <SelectItem value="경기">경기</SelectItem>
                        <SelectItem value="강원">강원</SelectItem>
                        <SelectItem value="충북">충북</SelectItem>
                        <SelectItem value="충남">충남</SelectItem>
                        <SelectItem value="전북">전북</SelectItem>
                        <SelectItem value="전남">전남</SelectItem>
                        <SelectItem value="경북">경북</SelectItem>
                        <SelectItem value="경남">경남</SelectItem>
                        <SelectItem value="제주">제주</SelectItem>
                      </SelectContent>
                    </Select>
                  </div> */}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">자기소개</Label>
                  <Textarea
                    id="bio"
                    value={profile?.bio}
                     onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))} // ✅ 항상 Profile 반환
                    rows={4}
                    placeholder="자신을 소개해주세요..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* 관심 분야 */}
            {/* <Card>
              <CardHeader>
                <CardTitle>관심 분야</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                      {interest}
                      <button
                        onClick={() => removeInterest(interest)}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Select value={newInterest} onValueChange={setNewInterest}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="관심 분야 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableInterests
                        .filter((interest) => !profile.interests.includes(interest))
                        .map((interest) => (
                          <SelectItem key={interest} value={interest}>
                            {interest}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => addInterest(newInterest)} disabled={!newInterest} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card> */}

            {/* 기술 스택 */}
            <Card>
              <CardHeader>
                <CardTitle>기술 스택</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                   {selectSkill?.map((skill) => (
                    <Badge key={skill.id} variant="outline" className="flex items-center gap-1">
                      {skill.name}
                      <button onClick={() => removeSkill(skill.id)} className="ml-1 hover:bg-gray-300 rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Select 
                  // 1. open 상태를 직접 관리
                  open={isSelectOpen}
                  // 2. onOpenChange를 사용하여 상태 변경을 감지
                  onOpenChange={setIsSelectOpen}

                  onValueChange={(skillName: string) => {
                      const foundSkill = arraySkills.find((s) => s.name === skillName);
                      if (foundSkill) {
                        addSkill(foundSkill); // 찾은 Skills 객체를 addSkill에 전달

                        // --- 이 부분이 핵심입니다 ---
                        // 아이템을 선택한 후에도 Select가 열려있도록 강제합니다.
                        // onValueChange가 발생한 후 Select 내부적으로 닫히려고 할 수 있으므로,
                        // 명시적으로 다시 열린 상태로 설정해 줍니다.
                        setIsSelectOpen(true);
                        
                      }
                      //console.log(isSelectOpen)
                    }}>
                      
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="기술 스택 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {/*모든 스킬 불러옴*/}
                      {arraySkills?.map((skill) => (
                          <SelectItem key={skill.id} value={skill.name}>
                            {skill.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* 추가 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>추가 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="education">학력</Label>
                    <Input
                      id="education"
                      value={profile?.education}
                      onChange={(e) =>setProfile(prev => ({ ...prev, education: e.target.value }))}
                      
                      placeholder="예: 컴퓨터공학과 학사"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">경력</Label>
                    <Input
                      id="experience"
                      value={profile?.experience}
                      onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
                      placeholder="예: 프론트엔드 개발자 2년"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portfolio">포트폴리오 URL</Label>
                    <Input
                      id="portfolio"
                      value={profile?.portfolioUrl}
                      onChange={(e) => setProfile(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                      placeholder="https://portfolio.example.com"
                    />
                  </div>
                  {/* <div className="space-y-2">
                    <Label htmlFor="github">GitHub URL</Label>
                    <Input
                      id="github"
                      value={profile.github}
                      onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                      placeholder="https://github.com/username"
                    />
                  </div> */}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* 저장 버튼 */}
        <div className="mt-8 flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                저장 중...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                저장하기
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 푸터 */}
      <Footer />
    </div>
  )
}


export default function ProfileEditPage() {
  return (
    <ProtectedRoute>
      <ProfileEditContent />
    </ProtectedRoute>
  )
}