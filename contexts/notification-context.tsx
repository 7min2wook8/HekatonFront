"use client"
//0804 -참여 중인 팀 목록, 신청한 팀 목록 구현하기
//0805 - 프로필 호출 시 스킬 정보도 같이 가져오는 기능 구현하기
import { createContext, SetStateAction, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { UUID } from "crypto"
import {AUTH_SERVER_URL, API_GATEWAY_URL} from "@/src/config"



export interface Notification {
  id: UUID;
  user_id: UUID;
  title: string;
  message : string;
  type : string;
  reference_id : UUID;
  reference_type : string;
  is_read : boolean;
  created_at : string;

}


interface NotificationsContextType {  
  notifications: Notification[]; // 현재 알림 목록
  getNotification: () => Promise<{ success: boolean; message: string; notifications: Notification[] }> ;

  removeNotification:(id: UUID) => Promise<{ success: boolean; message: string;}> ;
  // 알림 개별 삭제

  markAsRead: (id: UUID) => Promise<{ success: boolean; message: string;}> ; 
  // 특정 알림 읽음 처리

  clearNotifications: () => void; 
  // 모든 알림 제거
}


  //컨텐츠 컨텍스트 생성
const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);


export function NotificationsProvider({ children }: { children: ReactNode }) { 

  const notificationsContextValue: NotificationsContextType = {
    notifications: [],
    
    getNotification : async () => {


      return { success: false, message: "알림 기능이 아직 구현되지 않았습니다.", notifications: [] };
    },
    removeNotification: function (id: UUID): Promise<{ success: boolean; message: string }> {
      throw new Error("Function not implemented.")
    },
    markAsRead: function (id: UUID): Promise<{ success: boolean; message: string }> {
      throw new Error("Function not implemented.")
    },
    clearNotifications: function (): void {
      throw new Error("Function not implemented.")
    }
  }
  return (
    <NotificationsContext.Provider value={notificationsContextValue}>
      {children}
    </NotificationsContext.Provider>
  )
}


//알람 관련 Cotext
export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error("useContest must be used within a ContestProvider")
  }
  return context
}