// C:\HekatonFront\components\team\modals\InviteMemberModal.tsx
"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { useAuth, Profile } from "@/contexts/auth-context";

// useDebounce 훅이 별도 파일로 없기 때문에, 여기에 직접 정의하여 사용합니다.
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};


interface InviteMemberModalProps {
  teamId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:8080";

export function InviteMemberModal({ teamId, isOpen, onClose, onSuccess }: InviteMemberModalProps) {
  const { getAllUserProfiles } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (isOpen) {
      fetchInitialUsers();
    } else {
      setSearchQuery("");
      setSearchResults([]);
      setSelectedMembers([]);
      setInviteMessage("");
    }
  }, [isOpen]);

  const fetchInitialUsers = async () => {
    setIsSearching(true);
    try {
      const response = await getAllUserProfiles();

      if (!response.success) {
        throw new Error(response.message || "사용자 목록을 불러오는 데 실패했습니다.");
      }
      setSearchResults(response.data);
    } catch (err: any) {
      console.error("초기 사용자 목록 로딩 오류:", err);
      toast.error(`사용자 목록 로딩 실패: ${err.message || "알 수 없는 오류"}`);
    } finally {
      setIsSearching(false);
    }
  };

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      fetchInitialUsers();
      return;
    }

    setIsSearching(true);
    try {
      const response = await getAllUserProfiles();
      
      if (!response.success) {
        throw new Error(response.message || "사용자 목록을 불러오는 데 실패했습니다.");
      }

      const allUsers: Profile[] = response.data;
      
      const filteredUsers = allUsers.filter(user => 
        user.fullName.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filteredUsers);
    } catch (err: any) {
      console.error("사용자 검색 오류:", err);
      toast.error(`사용자 검색 실패: ${err.message || "알 수 없는 오류"}`);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [getAllUserProfiles]);

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      searchUsers(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, searchUsers]);

  const toggleSelectMember = (member: Profile) => {
    setSelectedMembers(prevSelected => {
      if (prevSelected.some(m => m.userId === member.userId)) {
        return prevSelected.filter(m => m.userId !== member.userId);
      } else {
        return [...prevSelected, member];
      }
    });
  };

  const handleInviteMembers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMembers.length === 0) {
      toast.warning("초대할 팀원을 한 명 이상 선택해주세요.");
      return;
    }
    if (!inviteMessage.trim()) {
      toast.warning("초대 메시지를 입력해주세요.");
      return;
    }

    setIsSendingInvite(true);
    let allInvitationsSuccess = true;

    // 선택된 멤버들 각각에 대해 개별적으로 API 요청을 보냅니다.
    for (const member of selectedMembers) {
      try {
        // 백엔드 API에 맞는 URL과 Request Body를 사용합니다.
        const response = await fetch(`${API_GATEWAY_URL}/api/invitations/teams/${teamId}/invite`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            userId: member.userId,
            message: inviteMessage,
          }),
        });

        // 💡 중요: 응답 상태를 먼저 확인합니다.
        if (!response.ok) {
          let errorBody = {};
          let errorMessage = `[${member.fullName}] 초대 실패: ${response.status} ${response.statusText}`;

          try {
            // 서버가 JSON 응답을 보냈다면 파싱합니다.
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              errorBody = await response.json();
              errorMessage = (errorBody as any).message || errorMessage;
            } else {
              // JSON이 아니면 텍스트로 읽고 메시지를 구성합니다.
              const text = await response.text();
              errorMessage = `[${member.fullName}] 초대 실패: ${text || response.statusText}`;
            }
          } catch (jsonError) {
            // JSON 파싱 자체가 실패했을 때의 처리
            console.error("Failed to parse error response as JSON", jsonError);
          }

          throw new Error(errorMessage);
        }
        
      } catch (err: any) {
        allInvitationsSuccess = false;
        console.error("팀원 초대 오류:", err);
        // 사용자에게 에러 메시지를 명확하게 표시합니다.
        toast.error(err.message || `[${member.fullName}] 알 수 없는 오류로 초대 실패`);
      }
    }

    if (allInvitationsSuccess) {
      toast.success("초대장이 성공적으로 전송되었습니다!");
      onSuccess();
      onClose();
    } else {
       toast.error("일부 팀원 초대에 실패했습니다. 콘솔을 확인해주세요.");
    }

    setIsSendingInvite(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>팀원 초대하기</DialogTitle>
          <DialogDescription>
            초대할 팀원을 검색하고 선택한 후, 초대 메시지를 보내세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInviteMembers} className="space-y-4">
          <div className="space-y-2">
            <Label>팀원 검색</Label>
            <Command className="border rounded-lg shadow-sm">
              <CommandInput
                placeholder="이름으로 검색..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                {isSearching ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    <Loader2 className="w-5 h-5 mx-auto animate-spin mb-2" />
                    <p>검색 중...</p>
                  </div>
                ) : (
                  <>
                    <CommandEmpty>
                      {searchQuery.length < 1 ? "검색어를 입력해주세요." : "검색 결과가 없습니다."}
                    </CommandEmpty>
                    <CommandGroup heading="검색 결과">
                      <ScrollArea className="h-[200px]">
                        {searchResults.map((user) => (
                          <CommandItem
                            key={user.userId}
                            onSelect={() => toggleSelectMember(user)}
                            className="cursor-pointer"
                          >
                            <div className="flex items-center space-x-2 w-full">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback>{user.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium">{user.fullName}</p>
                              </div>
                              {selectedMembers.some(m => m.userId === user.userId) && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </ScrollArea>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </div>

          <div className="space-y-2">
            <Label>선택된 팀원</Label>
            <div className="flex flex-wrap gap-2 min-h-[40px] border rounded-lg p-2 bg-gray-50">
              {selectedMembers.length > 0 ? (
                selectedMembers.map(member => (
                  <Badge
                    key={member.userId}
                    className="cursor-pointer"
                    onClick={() => toggleSelectMember(member)}
                  >
                    {member.fullName}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">초대할 팀원을 검색하여 선택하세요.</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inviteMessage">초대 메시지</Label>
            <Textarea
              id="inviteMessage"
              placeholder="함께 프로젝트를 시작해보아요!"
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              rows={5}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isSendingInvite || selectedMembers.length === 0}>
              {isSendingInvite ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              초대장 보내기
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}