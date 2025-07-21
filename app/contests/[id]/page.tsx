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
} from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useAuth } from "@/contexts/auth-context";

export default function ContestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [contest, setContest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLikeNotification, setShowLikeNotification] = useState(false);

  const API_GATEWAY_URL = "http://localhost:8080";

  useEffect(() => {
    const fetchContest = async () => {
      if (!params.id) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_GATEWAY_URL}/api/contests/${params.id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("네트워크 응답이 올바르지 않습니다.");
        }

        const data = await response.json();
        console.log("API 응답 데이터:", data); // 디버깅 로그 추가
        setContest(data);
      } catch (error: any) {
        console.error("공모전 데이터를 가져오는 중 오류 발생:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContest();
  }, [params.id]);

  const handleLike = () => {
    if (!isAuthenticated) {
      toast.warning("로그인이 필요합니다.");
      return;
    }
    if (!contest) return;

    const newIsLiked = !contest.isLiked;

    // This is a mock implementation. In a real app, you'd call an API.
    try {
      if (!user || !user.id) {
        throw new Error("User not authenticated or user ID not available.");
      }
      const localStorageKey = `favoriteContests_${user.id}`;
      const storedFavorites = localStorage.getItem(localStorageKey);
      let favorites = storedFavorites ? JSON.parse(storedFavorites) : [];

      if (newIsLiked) {
        const newFavorite = {
          id: contest.id,
          title: contest.title,
          category: contest.category,
          organizer: contest.organizer,
          region: contest.region,
          deadline: contest.registration_deadline,
        };
        if (!favorites.some((fav: any) => fav.id === newFavorite.id)) {
          favorites.push(newFavorite);
        }
        setShowLikeNotification(true);
        setTimeout(() => setShowLikeNotification(false), 1500);
      } else {
        favorites = favorites.filter((fav: any) => fav.id !== contest.id);
      }

      localStorage.setItem(localStorageKey, JSON.stringify(favorites));
    } catch (e) {
      console.error("Failed to update favorites in localStorage", e);
      toast.error("즐겨찾기 업데이트에 실패했습니다.");
    }

    setContest((prev: any) => ({
      ...prev,
      isLiked: newIsLiked,
      likeCount: newIsLiked
        ? (prev.likeCount || 0) + 1
        : (prev.likeCount || 1) - 1,
    }));
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    // Implement apply logic, e.g., redirect to an application form
    toast.info("지원 기능은 현재 준비 중입니다.");
  };

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

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-100 text-gray-800";
    if (status.includes("마감")) return "bg-red-100 text-red-800";
    if (status.includes("임박")) return "bg-yellow-100 text-yellow-800";
    if (status.includes("중")) return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };

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
        <div className="mb-6">
          <Link href="/contests">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              공모전 목록으로
            </Button>
          </Link>
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
                  {showLikeNotification && (
                    <div className="bg-black text-white text-xs px-2 py-1 rounded-md">
                      즐겨찾기에 추가되었습니다!
                    </div>
                  )}
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
            {(contest.prizeDescription) && (
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
                    <div className="font-medium">
                      {contest.organizer}
                    </div>
                  </div>
                  {/* 주최자 이메일(미구현) */}
                <div className="space-y-2 text-sm">
                  {(contest.organizerEmail) && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <a
                        href={`mailto:${
                          contest.organizerEmail
                        }`}
                        className="text-blue-600 hover:underline"
                      >
                        {contest.organizerEmail}
                      </a>
                    </div>
                  )}
                  {/* 주최자 전화번호(미구현) */}
                  {(contest.organizerPhone) && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span>
                        {contest.organizerPhone}
                      </span>
                    </div>
                  )}
                  {/* 주최자 웹사이트 */}
                  {(contest.websiteUrl) && (
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
