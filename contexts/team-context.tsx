"use client"

import { createContext, SetStateAction, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { UUID } from "crypto"
import {AUTH_SERVER_URL, API_GATEWAY_URL} from "@/src/config"
import { AuthUser } from "./auth-context"


export interface TeamDatas{
  id: UUID
  name: string
  description: string
  leaderId: UUID
  contestId: UUID
  isRecruiting: boolean
  isPublic: boolean
  maxMembers: number
  createdByUserId : UUID
  createdAt: Date
  updatedAt: Date
  neededRoles : string[]
  skills: string[]
  categoryIds: string[]
  location: string
  requirements: string
  contactMethod: string
  contactInfo: string
  allowDirectApply: boolean
}


interface TeamContextType{
  Teams: TeamDatas[] // 팀 목록
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  //팀 정보 조회
  getTeam: (teamId: UUID) => Promise<{ success: boolean; message: string; team: TeamDatas | null }>
  //팀 생성
  createTeam: (teamData: TeamDatas) => Promise<{ success: boolean; message: string; team: TeamDatas | null }>
  //팀 수정
  updateTeam: (teamId: UUID, teamData: Partial<TeamDatas>) => Promise<{ success: boolean; message: string; team: TeamDatas | null }>
  //팀 삭제
  deleteTeam: (teamId: UUID) => Promise<{ success: boolean; message: string }>
  //팀 참여 신청
  applyToTeam: (teamId: UUID) => Promise<{ success: boolean; message: string }> 
  //팀 참여 승인
  approveTeamApplication: (userId: UUID) => Promise<{ success: boolean; message: string }>
  //팀 참여 거절
  rejectTeamApplication: (userId: UUID) => Promise<{ success: boolean; message: string }>
  //팀 탈퇴
  leaveTeam: (teamId: UUID) => Promise<{ success: boolean; message: string }>
  //팀장 변경
  changeTeamLeader: (teamId: UUID, newLeaderId: UUID) => Promise<{ success: boolean; message: string }>
  //팀 목록 조회
  getAllTeams: () => Promise<{ success: boolean; message: string; data: TeamDatas[] }>
  //사용자가 속한 팀 목록 조회
  getMyTeams: () => Promise<{ success: boolean; message: string; data: TeamDatas[] }>
  //사용자가 신청한 팀 목록 조회
  getAppliedTeams: () => Promise<{ success: boolean; message: string; data: TeamDatas[] | [] }>
  //팀원 목록 조회
  getTeamMembers: (teamId: UUID) => Promise<{ success: boolean; message: string; data: AuthUser[] }>

}

  // 팀 컨텍스트 생성
const TeamContext = createContext<TeamContextType | undefined>(undefined)


export function TeamProvider({ children }: { children: ReactNode }) {

  const teamContextValue: TeamContextType = {
    Teams: [], // 초기값은 빈 배열로 설정
    isLoading: false,
    setIsLoading: () => { },
    getTeam: async (teamId: UUID) => {
      return { success: false, message: "팀 정보를 불러오는 기능은 아직 구현되지 않았습니다.", team: null }
    },
    createTeam: function (teamData: TeamDatas): Promise<{ success: boolean; message: string; team: TeamDatas | null }> {
      //return { success : false, message: "팀 목록을 불러오지 못했습니다.", team: null }
      throw new Error("Function not implemented.")
    },
    updateTeam: function (teamId: UUID, teamData: Partial<TeamDatas>): Promise<{ success: boolean; message: string; team: TeamDatas | null }> {
      throw new Error("Function not implemented.")
    },
    deleteTeam: function (teamId: UUID): Promise<{ success: boolean; message: string }> {
      throw new Error("Function not implemented.")
    },
    applyToTeam: function (teamId: UUID): Promise<{ success: boolean; message: string }> {
      throw new Error("Function not implemented.")
    },
    //지원 받은 팀 승인
    approveTeamApplication: function (userId: UUID): Promise<{ success: boolean; message: string }> {
       try {
        const response = fetch(`${API_GATEWAY_URL}/api/applications/applications/${userId}/approve`, {
          method: 'PUT',
          credentials: 'include'       
        });        
        return response.then(async (res) => {
          if (!res.ok) {
            const msg = await res.text()
            console.log(msg)
            return { success: false, message: "승인이 정상적으로 처리되지 않았습니다."}
          }    

          return { success: true, message: "승인이 정상적으로 처리되었습니다."}
        })
      } catch (error) {
        console.error("승인 처리중 오류:", error)
        return Promise.resolve({
          success: false,
          message: "신청한 팀 목록을 불러오는 중 오류가 발생했습니다."
        })
      }
    },
    rejectTeamApplication: function (userId: UUID): Promise<{ success: boolean; message: string }> {
      try {
        const response = fetch(`${API_GATEWAY_URL}/api/applications/applications/${userId}/reject`, {
          method: 'PUT',
          credentials: 'include'       
        });        
        return response.then(async (res) => {
          if (!res.ok) {
            const msg = await res.text()
            console.log(msg)
            return { success: false, message: "승인이 정상적으로 처리되지 않았습니다."}
          }    

          return { success: true, message: "승인이 정상적으로 처리되었습니다."}
        })
      } catch (error) {
        console.error("승인 처리중 오류:", error)
        return Promise.resolve({
          success: false,
          message: "신청한 팀 목록을 불러오는 중 오류가 발생했습니다."
        })
      }
    },
    leaveTeam: function (teamId: UUID): Promise<{ success: boolean; message: string }> {
      throw new Error("Function not implemented.")
    },
    changeTeamLeader: function (teamId: UUID, newLeaderId: UUID): Promise<{ success: boolean; message: string }> {
      throw new Error("Function not implemented.")
    },
    getAllTeams: function (): Promise<{ success: boolean; message: string; data: TeamDatas[] }> {
      throw new Error("Function not implemented.")
    },
    //참여중인 팀 목록 요청
    getMyTeams: function (): Promise<{ success: boolean; message: string; data: TeamDatas[] }> {
       try {
        //호출 코드 수정해야함(컨트롤러에서 구현되면 바꿔야함 0812)
        const response = fetch(`${API_GATEWAY_URL}/api/mypage/teamservice/teams`, {
          method: 'GET',
          credentials: 'include' // JWT 쿠키 포함
        });
        return response.then(async (res) => {
          if (!res.ok) {
            const msg = await res.text()
            return { success: false, message: msg || "팀 목록을 불러오지 못했습니다.", data: [] }
          }
          const data = await res.json() 

           const teams: TeamDatas[] = (Array.isArray(data) ? data : data.content || []).map((team: TeamDatas) => ({

             id: team.id,
             name: team.name,
             description: team.description,
             leaderId: team.leaderId,
             contestId: team.contestId,
             isRecruiting: team.isRecruiting,
             isPublic: team.isPublic,
             maxMembers: team.maxMembers,
             createdAt: new Date(team.createdAt),
             updatedAt: new Date(team.updatedAt),
             allowDirectApply: team.allowDirectApply,
             categoryIds: team.categoryIds || [],
             contactInfo: team.contactInfo || "",
             contactMethod: team.contactMethod || "",
             createdByUserId: team.createdByUserId,
             location: team.location || "",
             neededRoles: team.neededRoles || [],
             requirements: team.requirements || "",
             skills: team.skills || []

           }))
          
          return { success: true, message: "팀 목록을 성공적으로 불러왔습니다.", data: teams }
        })
      } catch (error) {
        console.error("팀 목록 불러오기 오류:", error)
        return Promise.resolve({
          success: false,
          message: "팀 목록을 불러오는 중 오류가 발생했습니다.",
          data: []
        })
      }
    },

    //내가 신청한 팀 목록 조회 구현
    getAppliedTeams: function (): Promise<{ success: boolean; message: string; data: TeamDatas[] }> {
       try {
        const response = fetch(`${API_GATEWAY_URL}/api/teams/users/me/applications`, {
          method: 'GET',
          credentials: 'include'       
        });        
        return response.then(async (res) => {
          if (!res.ok) {
            const msg = await res.text()
            return { success: false, message: msg + "신청한 팀 목록을 불러오지 못했습니다.", data: [] }
          }
          const data = await res.json()         

          return { success: true, message: "신청한 팀 목록을 성공적으로 불러왔습니다.", data: data }
        })
      } catch (error) {
        console.error("신청한 팀 목록 불러오기 오류:", error)
        return Promise.resolve({
          success: false,
          message: "신청한 팀 목록을 불러오는 중 오류가 발생했습니다.",
          data: []
        })
      }
    },
    getTeamMembers: function (teamId: UUID): Promise<{ success: boolean; message: string; data: AuthUser[] }> {
      throw new Error("Function not implemented.")
    }
  }

  return (
    <TeamContext.Provider value={teamContextValue}>
      {children}
    </TeamContext.Provider>
  )
}


export function useTeam() {
  const context = useContext(TeamContext)
  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider")
  }
  return context
}