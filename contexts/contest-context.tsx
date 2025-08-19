"use client"
//0804 -참여 중인 팀 목록, 신청한 팀 목록 구현하기
//0805 - 프로필 호출 시 스킬 정보도 같이 가져오는 기능 구현하기
import { createContext, SetStateAction, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { UUID } from "crypto"
import {AUTH_SERVER_URL, API_GATEWAY_URL} from "@/src/config"

export interface CategoryResponse {
  id: string;
  name: string;
  description: string;
}

export enum ContestStatus{
  OPEN,          // 모집 중 (마감일까지 여유 있음)
  CLOSING_SOON,  // 모집 임박 (마감일이 얼마 남지 않음)
  CLOSED         // 모집 마감 (이미 종료됨)
}

/**
 * 공모전의 상세 정보를 담는 인터페이스
 */
export interface Contest{
  /** 공모전의 고유 식별자 (UUID) */
  id : UUID;
  /** 공모전 제목 */
  title : string ;  
  /** 공모전 상세 설명 */
  description : string ; /*설명 */ 
  /** 주최 기관 또는 개인 */
  organizer : string ; //주최자
  /** 공모전 시작일 (YYYY-MM-DD 형식) */
  startDate : string ;
  /** 공모전 종료일 (YYYY-MM-DD 형식) */
  endDate : string ;
  /** 참가 신청 마감일 (YYYY-MM-DD 형식) */
  registrationDeadline : string ;  //등록마감일
  /** 상금 관련 상세 설명. 예: "1등: 100만원" */
  prizeDescription : string ;  //상금 설명 마감일 예) 상금 대상 1억, 상 5000
  /** 참가 요구 사항 */
  requirements : string ;  //요구사항
  /** 공모전 관련 외부 웹사이트 URL */
  websiteUrl : string ;
  /** 대표 이미지 URL */
  imageUrl : string ;
  /** 공모전 활성화 여부 */
  isActive : Boolean ;
  /** 공모전 카테고리 목록 */
  categories : CategoryResponse[] ;
  /** 생성 일시 */
  createdAt : string ;
  /** 마지막 수정 일시 */
  updatedAt : string ;
  /** 공모전 진행 상태 (모집 중, 마감 임박, 마감) */
  status : ContestStatus ;
  /** 주최측 이메일 주소 */
  organizerEmail : string ; //주최자 이메일
  /** 주최측 연락처 */
  organizerPhone : string ; //주최자 전화번호
  /** 제출물 형식. 예: "PDF 파일", "5분 이내의 동영상 URL" */
  submissionFormat: string; // 제출물 형식 (예: "PDF", "영상 URL")
  /** 최대 참가 인원 수 */
  maxParticipants: number; // 최대 참가 인원
  /** 참가 자격 조건. 예: ["대학생", "누구나"] */
  eligibility: string[]; // 참가 자격 (예: "대학생", "누구나")
  /** 검색 및 필터링을 위한 태그. 예: ["IT", "AI", "빅데이터"] */
  tags: string[]; // 검색 및 필터링을 위한 태그
  /** 공모전을 생성한 사용자의 ID */
  createdByUserId: UUID; // 공모전을 등록한 사용자 ID
  /** 개최 지역 (시/도) */
  regionSi: string; /*개최 지역 (시/도)*/
  /** 개최 지역 (구/군) */
  regionGu: string; /* 개최 지역 (구/군)*/
}

interface ContestContextType {  
  /** 서버로부터 모든 공모전 목록을 가져옵니다. */
  getAllContests: () => Promise<{ success: boolean; message: string; contests: Contest[] }>
  /** ID를 이용해 특정 공모전 하나의 데이터를 가져옵니다. */
  getContest: (id: UUID) => Promise<{ success: boolean; message: string; contest: Contest | null }>
  /** 새로운 공모전 데이터를 생성합니다. */
  setContest: (contest: Contest) => Promise<{ success: boolean; message: string }>
  /** ID에 해당하는 공모전 정보를 수정합니다. */
  updateContest: (id: UUID, contest: Partial<Contest>) => Promise<{ success: boolean; message: string }>
  /** ID에 해당하는 공모전을 삭제합니다. */
  deleteContest: (id: UUID) => Promise<{ success: boolean; message: string }>
  /** 키워드를 사용해 공모전을 검색합니다. (제목, 설명, 태그 등) */
  searchContests: (query: string) => Promise<{ success: boolean; message: string; contests: Contest[] | null }>
  /** 날짜, 카테고리, 상태 등 다양한 조건으로 공모전을 필터링합니다. */
  filterContests: (filters: Record<string, any>) => Promise<{ success: boolean; message: string; contests: Contest[] | null }>  
  /** 특정 공모전에 사용자가 참가를 신청합니다. */
  joinContest: (contestId: UUID, userId: UUID) => Promise<{ success: boolean; message: string }>
  /** 특정 공모전 참가를 취소합니다. */
  leaveContest: (contestId: UUID, userId: UUID) => Promise<{ success: boolean; message: string }>  
  /** 특정 사용자가 참가하고 있는 모든 공모전 목록을 조회합니다. */
  getUserContests: (userId: UUID) => Promise<{ success: boolean; message: string; contests: Contest[] | null}>

}


  //컨텐츠 컨텍스트 생성
const ContestContext = createContext<ContestContextType | undefined>(undefined);



export function ContestProvider({ children }: { children: ReactNode }) {

  //const [contests, setContests] = useState<Contest[]>([])
  const contentsContextValue: ContestContextType = {
    // 모든 대회 목록 가져오기
    getAllContests: async () => {
      try {
        const res = await fetch(`${API_GATEWAY_URL}/api/contests/list`)
        if(res.ok){
          const data = await res.json();
          
          return { success: true, message: "대회 목록 불러오기 성공", contests: data.content }
        }
        else
          return { success: false, message: "대회 목록 불러오기 실패 : " + res.text, contests: [] }
          
        
      } catch (err) {
        return { success: false, message: "대회 목록 불러오기 실패" + err, contests: [] }
      }
    },
    
    // 단일 대회 조회
    getContest: async (id : UUID) => {
      try {
        
        const res = await fetch(`${API_GATEWAY_URL}/api/contests/${id}`)
        if(!res.ok)
          return { success: false, message: "대회 조회 실패", contest: null }

        const data = await res.json()
        return { success: true, message: "대회 조회 성공", contest: data.contest }
      } catch (err) {
        return { success: false, message: "대회 조회 실패", contest: null }
      }
    },

    // 대회 생성
    setContest: async (contest) => {
      try {
        const res = await fetch("/api/contests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contest),
        })
        if (!res.ok) throw new Error()
       
        return { success: true, message: "대회 생성 성공" }
      } catch (err) {
        return { success: false, message: "대회 생성 실패" }
      }
    }
    // 대회 수정
    ,

    // 대회 수정
    updateContest: async (id, contest) => {
      try {
        const res = await fetch(`/api/contests/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contest),
        })
        if (!res.ok) throw new Error()
        
        return { success: true, message: "대회 수정 성공" }
      } catch (err) {
        return { success: false, message: "대회 수정 실패" }
      }
    }
    // 대회 삭제
    ,

    // 대회 삭제
    deleteContest: async (id) => {
      try {
        const res = await fetch(`/api/contests/${id}`, {
          method: "DELETE",
        })
        if (!res.ok) throw new Error()

        return { success: true, message: "대회 삭제 성공" }
      } catch (err) {
        return { success: false, message: "대회 삭제 실패" }
      }
    },
    searchContests: function (query: string): Promise<{ success: boolean; message: string; contests: Contest[] }> {


      throw new Error("Function not implemented.")
    },
    filterContests: async (filters) => {
      try {
        // 필터 객체를 URL 쿼리 파라미터로 변환합니다.
        // 값이 유효한 (null, undefined, 빈 문자열이 아닌) 필터만 포함시킵니다.
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            queryParams.append(key, String(value));
          }
        });

        // 백엔드 필터링 API 엔드포인트로 요청을 보냅니다.
        // (참고: 엔드포인트는 백엔드 구현에 따라 '/api/contests/list' 등이 될 수도 있습니다.)
        const res = await fetch(`${API_GATEWAY_URL}/api/contests/filter?${queryParams.toString()}`);

        if (res.ok) {
          const data = await res.json();
          return { success: true, message: "공모전 필터링 성공", contests: data.content || [] };
        }
        return { success: false, message: "공모전 필터링 실패: " + await res.text(), contests: null };
      } catch (err) {
        return { success: false, message: "공모전 필터링 중 오류 발생: " + String(err), contests: null };
      }
    },
    joinContest: function (contestId: UUID, userId: UUID): Promise<{ success: boolean; message: string }> {
      throw new Error("Function not implemented.")
    },
    leaveContest: function (contestId: UUID, userId: UUID): Promise<{ success: boolean; message: string }> {
      throw new Error("Function not implemented.")
    },
    getUserContests: function (userId: UUID): Promise<{ success: boolean; message: string; contests: Contest[] }> {
      throw new Error("Function not implemented.")
    }
  }
  return (
    <ContestContext.Provider value={contentsContextValue}>
      {children}
    </ContestContext.Provider>
  )
  
}


export function useContest() {
  const context = useContext(ContestContext)
  if (context === undefined) {
    throw new Error("useContest must be used within a ContestProvider")
  }
  return context
}