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
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { useRouter } from "next/navigation"


const defaultImage = "/placeholder.svg"

function ProfileEditContent() {

  const {profile, viewProfile, saveProfile, setProfile, isAuthenticated, user, updateUser, userSkills, viewUserSkills, updateUserSkills, skills, getSkills } = useAuth()
  const [newInterest, setNewInterest] = useState("")
  const [selectSkill, setSelectSkill] = useState<typeof skills>([])
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  
  useEffect(() => {
    if (isAuthenticated && user) { // 인증되었고 사용자가 존재할 때만 데이터 가져오기
      fetchUserData();
    }
  }, [isAuthenticated, user]); // isAuthenticated와 user에 의존

    // 이 useEffect는 AuthProvider에서 기술 스택이 가져와지고 설정된 후 올바르게 로깅될 것입니다.
  useEffect(() => {
    console.log("현재 skills 상태:", skills);
    // 여기에 사용자의 기존 기술을 미리 선택하도록 설정할 수 있습니다.
    // 예: setSelectSkill(userSkills?.map(us => skills.find(s => s.id === us.skillId)).filter(Boolean) as Skills[]);
  }, [skills]);

  

  const fetchUserData = async () => {
    if (user) {
      const profileResult1 = await viewProfile();  // 비동기 호출

      const userSkillsResult = await viewUserSkills();  // 비동기 호출
      
      const skillsResult = await getSkills();

      if (profileResult1?.success && userSkillsResult?.success && skillsResult?.success) {
        console.log("프로필 불러오기 성공:");

        //setNewSkill(skillsResult.skills)

      } else {
        console.warn("프로필 불러오기 실패:");
      }
    }
    else
      router.push("/")
  };
  // 프로필 저장 핸들러
  // 이 함수는 실제 API 호출을 시뮬레이션합니다.
  const handleSave = async () => {
    setIsLoading(true)
    setSuccess(false)


    try {
      
      // 실제 API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // // 프로필 업데이트
      const result = await saveProfile();
      // setProfile(result) // API 호출 결과로 프로필 업데이트
      if (!result || !result.success) {
        console.error("프로필 업데이트에 실패했습니다.")
        return
      }

      console.log("프로필 업데이트 성공:", result)

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      router.push("/mypage")
    } catch (error) {
      console.error("프로필 업데이트 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }

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

  const addSkill = (skill: string) => {
    // if (skill && !userSkills?.includes(skill)) {
    //   updateUserSkills({
    //     ...profile,
    //     skills: [...profile.skills, skill],
    //   })
    // }
    // setNewSkill(null)
  }

  const removeSkill = (id: string) => {
    //setSelectSkill((prev) => prev.filter((s) => s.id !== id));
  }

  if (!user) return null

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
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">프로필이 성공적으로 업데이트되었습니다!</AlertDescription>
          </Alert>
        )}

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
                  {/* <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input
                      id="name"
                      value={thisProfile.fullName}
                      onChange={(e) => setProfile({ ...thisProfile, fullName: e.target.value })}
                    />
                  </div> */}
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
                      value={user.phone_number}
                      onChange={(e) => updateUser({ ...user, phone_number: e.target.value })}
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
                     onChange={(e) => setProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
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
                  // value={selectSkill?[0]. ?? ""} 
                  onValueChange={(skillName: string) => {
                      const skill = skills?.find((s) => s.name == skillName);
                      //if(skill)
                        //setSelectSkill(skill);
                    }}>
                      
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="기술 스택 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {/*모든 스킬 불러옴*/}
                      {skills?.map((skill) => (
                          <SelectItem key={skill.id} value={skill.name}>
                            {skill.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {/* <Button onClick={() => addSkill("")} disabled={!newSkill} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button> */}
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
                      onChange={(e) =>setProfile(prev => prev ? { ...prev, education: e.target.value } : null)}
                      placeholder="예: 컴퓨터공학과 학사"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">경력</Label>
                    <Input
                      id="experience"
                      value={profile?.experience}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, experience: e.target.value } : null)}
                      placeholder="예: 프론트엔드 개발자 2년"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portfolio">포트폴리오 URL</Label>
                    <Input
                      id="portfolio"
                      value={profile?.portfolioUrl}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, portfolioUrl: e.target.value } : null)}
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