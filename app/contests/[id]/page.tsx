"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Trophy,
  Clock,
  Share2,
  Heart,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  CheckCircle,
  AlertCircle,
  User,
  Send,
  Trash2,
  Edit, // Edit 아이콘 추가
} from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useAuth } from "@/contexts/auth-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ContestDetailPage() {
  const params = useParams(); // id
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [contest, setContest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // 삭제 확인 다이얼로그 상태
  const API_GATEWAY_URL = "http://localhost:8080";

  // API 호출부
  useEffect(() => {
    const fetchContestDetails = async () => {
      if (!params.id) return;
      setIsLoading(true);
      setError(null);

      try {
        // 기본 공모전 정보
        const contestPromise = fetch(
          `${API_GATEWAY_URL}/api/contests/${params.id}`,
          { credentials: "include" }
        ).then((res) => {
          if (!res.ok) throw new Error("공모전 정보를 가져오지 못했습니다.");
          return res.json();
        });
        //즐겨찾기 상태
        const isFavoritePromise = isAuthenticated
          ? fetch(
              `${API_GATEWAY_URL}/api/contests/favorite/${params.id}/isfavorites`,
              { credentials: "include" }
            ).then((res) => (res.ok ? res.json() : false))
          : Promise.resolve(false);

        // 즐겨찾기 수를 병렬로 가져옵니다.
        const favoritesCountPromise = fetch(
          `${API_GATEWAY_URL}/api/contests/favorite/${params.id}/favoritesCount`,
          { credentials: "include" } // 인증 정보 추가
        ).then((res) => (res.ok ? res.json() : 0));

        const [contestData, isLiked, likeCount] = await Promise.all([
          contestPromise,
          isFavoritePromise,
          favoritesCountPromise,
        ]);

        setContest({ ...contestData, isLiked, likeCount });
      } catch (error: any) {
        console.error("공모전 데이터를 가져오는 중 오류 발생:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContestDetails();
  }, [params.id, isAuthenticated]);

  //사용자 로그인 여부 확인
  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.warning("로그인이 필요합니다.");
      return;
    }
    if (!contest) return;

    const newIsLiked = !contest.isLiked;

    // UI를 먼저 업데이트하여 즉각적인 피드백을 제공합니다.
    setContest((prev: any) => ({
      ...prev,
      isLiked: newIsLiked,
    }));

    try {
      const method = newIsLiked ? "POST" : "DELETE";
      const endpoint = newIsLiked
        ? `${API_GATEWAY_URL}/api/contests/favorite/${params.id}/favoritesAdd`
        : `${API_GATEWAY_URL}/api/contests/favorite/${params.id}/favoritesRemove`;

      const response = await fetch(endpoint, {
        method: method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error("서버 응답이 올바르지 않습니다.");
      }

      // 서버로부터 최신 즐겨찾기 수를 다시 가져와 동기화합니다.
      const favoritesCountResponse = await fetch(
        `${API_GATEWAY_URL}/api/contests/favorite/${params.id}/favoritesCount`,
        { credentials: "include" } // 인증 정보 추가
      );
      if (favoritesCountResponse.ok) {
        const likeCount = await favoritesCountResponse.json();
        setContest((prev: any) => ({ ...prev, likeCount }));
      }

      toast.success(
        newIsLiked ? "즐겨찾기에 추가했습니다." : "즐겨찾기에서 삭제했습니다."
      );
    } catch (error) {
      console.error("즐겨찾기 업데이트 실패:", error);
      toast.error("즐겨찾기 업데이트에 실패했습니다.");

      // 실패 시 UI를 원래 상태로 되돌립니다.
      setContest((prev: any) => ({
        ...prev,
        isLiked: !newIsLiked,
      }));
    }
  };

  //지원하기
  const handleApply = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    // Implement apply logic, e.g., redirect to an application form
    toast.info("지원 기능은 현재 준비 중입니다.");
  };

  //공모전 삭제
  const handleDeleteContest = async () => {
    console.log("현재 로그인 사용자:", user);
    console.log("공모전 정보:", contest);
    // 권한 검사: 현재 로그인한 사용자의 ID와 공모전 주최자(user_id)가 일치하는지 확인
    // 백엔드에서 contest 객체에 'userId' 또는 'organizerId'와 같은 필드로 주최자 ID를 내려줘야 합니다.
    // 임시로 user.id와 contest.id가 같을 때만 허용하는 로직은 실제 배포 시 수정되어야 합니다.
    // if (!contest || !user || contest.userId !== user.id) {
    //   toast.error("삭제 권한이 없습니다.");
    //   return;
    // }

    try {
      const response = await fetch(
        `${API_GATEWAY_URL}/api/contests/${params.id}/deactivate`, // 이 엔드포인트는 물리적 삭제가 아닌 소프트 삭제(비활성화)를 의미
        {
          method: "DELETE", // 백엔드에서 DELETE 요청을 물리적 삭제로 처리한다면 상관없음
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("공모전 삭제에 실패했습니다.");
      }

      toast.success("공모전이 성공적으로 삭제되었습니다.");
      router.push("/contests"); // 삭제 후 목록 페이지로 이동
    } catch (error: any) {
      console.error("공모전 삭제 중 오류 발생:", error);
      toast.error(error.message || "공모전 삭제 중 오류가 발생했습니다.");
    } finally {
      setShowDeleteConfirm(false); // 다이얼로그 닫기
    }
  };

  //공유하기
  const handleShare = async () => {
    if (!contest) return;
    const shareData = {
      title: contest.title,
      text: contest.description?.slice(0, 100) + "...",
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("링크가 클립보드에 복사되었습니다!");
      }
    } catch (error) {
      console.error("Share failed:", error);
      toast.error("공유에 실패했습니다.");
    }
  };

  //마감 상태 컬러표기(미사용)
  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-100 text-gray-800";
    if (status.includes("마감")) return "bg-red-100 text-red-800";
    if (status.includes("임박")) return "bg-yellow-100 text-yellow-800";
    if (status.includes("중")) return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };

  // 남은 일수 계산
  const getDaysLeft = () => {
    if (!contest?.registrationDeadline) return 0;
    const deadline = new Date(contest.registrationDeadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysLeft = getDaysLeft();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        로딩 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        오류: {error}
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        공모전 정보를 찾을 수 없습니다.
      </div>
    );
  }
  // 여기까지 기능 요소 (JS)

  // 이 아래부터 실제 구현되는 페이지 구성
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <Link href="/contests">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              공모전 목록으로
            </Button>
          </Link>

          {/* 수정 및 삭제 버튼 그룹 */}
          <div className="flex gap-2">
            {/* user.id와 contest.userId (주최자 ID) 비교 로직 필요 */}
            {/* 백엔드에서 contest 객체에 `userId` 필드를 포함시켜주어야 합니다. */}
            {/* 예시: user && contest && user.id === contest.userId */}
            {user && user.id && ( // 이 조건은 현재 로그인 여부만 확인. 실제로는 `contest.userId`와 비교해야 함.
              <>
                <Link href={`/contests/update?id=${params.id}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    공모전 수정
                  </Button>
                </Link>
                <AlertDialog
                  open={showDeleteConfirm}
                  onOpenChange={setShowDeleteConfirm}
                >
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      공모전 삭제
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        정말로 이 공모전을 삭제하시겠습니까?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        이 작업은 되돌릴 수 없습니다. 공모전과 관련된 모든
                        데이터가 영구적으로 삭제됩니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteContest}>
                        삭제
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="relative">
                <img
                  src={contest.image || "/placeholder.svg"}
                  alt={contest.title || "공모전 이미지"}
                  className="w-full h-64 object-cover rounded-t-lg"
                />

                {/* 카테고리(구현중) */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {contest.category && <Badge>{contest.category}</Badge>}
                  {contest.status && (
                    <Badge className={getStatusColor(contest.status)}>
                      {contest.status}
                    </Badge>
                  )}
                </div>
                <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    {/* 즐겨찾기 버튼(구현중) */}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleLike}
                      className="bg-white/90 hover:bg-white"
                    >
                      <Heart
                        className={`w-4 h-4 mr-1 ${
                          contest.isLiked ? "fill-red-500 text-red-500" : ""
                        }`}
                      />
                      {contest.likeCount || 0}
                    </Button>
                    {/* 공유하기 버튼 */}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleShare}
                      className="bg-white/90 hover:bg-white"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-2xl mb-2">{contest.title}</CardTitle>
                {/* 지역(미구현) */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {contest.region && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {contest.region}
                    </div>
                  )}
                  {/* 참가 정원(미구현) */}
                  {contest.maxParticipants && (
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      최대 {contest.maxParticipants}명
                    </div>
                  )}
                  {/* 대회 시작일 / 대회 종료일 */}
                  {(contest.startDate || contest.endDate) && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {contest.startDate || "미정"} ~{" "}
                      {contest.endDate || "미정"}
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>

            <Tabs defaultValue="description" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="description">상세정보</TabsTrigger>
                <TabsTrigger value="requirements">참가요건</TabsTrigger>
              </TabsList>

              <TabsContent value="description">
                <Card>
                  <CardHeader>
                    <CardTitle>공모전 상세 설명</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* 상세 정보 */}
                    <div className="prose max-w-none whitespace-pre-line text-gray-700 leading-relaxed">
                      {contest.description}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requirements">
                {/* 참가 자격(미구현) */}
                <div className="space-y-6">
                  {contest.eligibility?.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                          참가 자격
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {contest.eligibility.map((item: string) => (
                            <Badge key={item} variant="secondary">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {/* 참가 요구사항 */}
                  {contest.requirements && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                          참가 요구사항
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="whitespace-pre-line text-gray-700">
                          {contest.requirements}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {/* 제출 형식(미구현) */}
                  {contest.submissionFormat && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Send className="w-5 h-5 mr-2 text-purple-600" />
                          제출 형식
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="whitespace-pre-line text-gray-700">
                          {contest.submissionFormat}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <Clock className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">
                    D-{daysLeft}
                  </div>
                  <div className="text-sm text-gray-600">
                    {daysLeft > 0 ? `${daysLeft}일 남음` : "접수 마감"}
                  </div>
                </div>
                <Separator className="my-4" />
                {/* 접수 마감일 */}
                <div className="text-sm text-gray-600 space-y-1">
                  {contest.registrationDeadline && (
                    <div>접수 마감: {contest.registrationDeadline}</div>
                  )}
                  {/* 조회수(미구현) */}
                  {contest.viewCount !== undefined && (
                    <div>조회수: {contest.viewCount.toLocaleString()}</div>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* 상금 */}
            {contest.prizeDescription && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                    상금/혜택
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {contest.prizeDescription}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  주최자 정보
                </CardTitle>
              </CardHeader>
              {/* 주최자 정보 */}
              <CardContent className="space-y-3">
                <div>
                  <div className="font-medium">{contest.organizer}</div>
                </div>
                {/* 주최자 이메일(미구현) */}
                <div className="space-y-2 text-sm">
                  {contest.organizerEmail && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <a
                        href={`mailto:${contest.organizerEmail}`}
                        className="text-blue-600 hover:underline"
                      >
                        {contest.organizerEmail}
                      </a>
                    </div>
                  )}
                  {/* 주최자 전화번호(미구현) */}
                  {contest.organizerPhone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{contest.organizerPhone}</span>
                    </div>
                  )}
                  {/* 주최자 웹사이트 */}
                  {contest.websiteUrl && (
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-2 text-gray-400" />
                      <a
                        href={contest.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        {contest.websiteUrl}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* 태그(미구현) */}
            {contest.tags?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>태그</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {contest.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-4">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleApply}
                  disabled={daysLeft <= 0}
                >
                  {daysLeft <= 0 ? "마감된 공모전" : "지원하기"}
                </Button>
                {!isAuthenticated && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    지원하려면 로그인이 필요합니다
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}