"use client";

import { useEffect, useRef, memo } from "react";

//카카오맵 타입 선언 (타입스크립트 사용)
declare global {
  interface Window {
    kakao: any;
  }
}

import { useKakaoMap } from "@/contexts/kakao-map-context";

interface KakaoMapProps {
  latitude: number;
  longitude: number;
  markers?: { lat: number; lng: number; title: string }[];
}

function KakaoMap({ latitude, longitude, markers }: KakaoMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const { isLoaded } = useKakaoMap();

  useEffect(() => {
    if (isLoaded) {
      window.kakao.maps.load(() => {
        if (mapContainer.current) {
          const mapOption = {
            center: new window.kakao.maps.LatLng(latitude, longitude),
            level: 3,
          };
          const map = new window.kakao.maps.Map(mapContainer.current, mapOption);

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
        }
      });
    }
  }, [isLoaded, latitude, longitude, markers]);

  return <div ref={mapContainer} style={{ width: "100%", height: "400px" }} />;
}

export default memo(KakaoMap);
