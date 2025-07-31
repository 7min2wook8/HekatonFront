"use client";

import { useEffect, useRef } from "react";

//카카오맵 타입 선언 (타입스크립트 사용)
declare global {
  interface Window {
    kakao: any;
  }
}

interface MapProps {
  latitude: number;
  longitude: number;
  markers?: { lat: number; lng: number; title: string }[];
}

export default function KakaoMap({ latitude, longitude, markers }: MapProps) {
  // 지도를 담을 DOM 요소를 참조하기 위해 useRef 사용
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    //외부 스크립트가 로드되었는지 확인
    if (!window.kakao) {
      console.error("카카오맵 스크립트가 올바르게 로드되지 않았습니다.");
      return;
    }

    window.kakao.maps.load(() => {
      // mapContainer.current가 유효한지 확인
      if (!mapContainer.current) {
        return;
      }

      const mapOption = {
        //지도의 중심 좌표
        center: new window.kakao.LatLng(latitude, longitude),
        //지도의 확대 레벨
        level: 3,
      };

      //지도 생성
      const map = new window.kakao.maps.Map(mapContainer.current, mapOption);

      //마커 표시 로직
      if (markers) {
        markers.forEach((markerInfo) => {
          const markerPosition = new window.kakao.maps.LatLng(
            markerInfo.lat,
            markerInfo.lng
          );
          const marker = new window.kakao.maps.Marker({
            position: markerPosition,
            title: markerInfo.title,
          });
          marker.setMap(map);
        });
      }
    });
    // 컴포넌트 언마운트(사라질 때) 시 실행될 클린업 함수
    // 예시: 지도 관련 이벤트 리스너 해제 등
    // return () => {
    //   //내부에 지도 리소스 정리 코드 작성 가능
    // };
  }, [latitude, longitude, markers]); //props가 변경될 때마다 지도 업데이트

  return <div ref={mapContainer} style={{ width: "100%", height: "400px" }} />;
}
