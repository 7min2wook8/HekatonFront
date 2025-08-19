"use client";

import { useEffect, useRef, memo } from "react";
import { useKakaoMap } from "@/contexts/kakao-map-context";

// 카카오맵 타입 선언
declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoMapProps {
  latitude: number;
  longitude: number;
  markers?: { lat: number; lng: number; title: string }[];
  onAddressSelect?: (address: string) => void;
}

function KakaoMap({ latitude, longitude, markers, onAddressSelect }: KakaoMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null); // 지도 객체 보관
  const markersRef = useRef<any[]>([]); // 마커 보관
  const geocoderRef = useRef<any>(null);
  const { isLoaded } = useKakaoMap();

  useEffect(() => {
    if (!isLoaded || !mapContainer.current) return;

    window.kakao.maps.load(() => {
      if (!mapRef.current) {
        // 최초 1회만 지도 생성
        const mapOption = {
          center: new window.kakao.maps.LatLng(latitude, longitude),
          level: 3,
        };
        mapRef.current = new window.kakao.maps.Map(mapContainer.current, mapOption);
        geocoderRef.current = new window.kakao.maps.services.Geocoder();
      } else {
        // 지도 중심만 이동
        mapRef.current.setCenter(new window.kakao.maps.LatLng(latitude, longitude));
      }

      // 기존 마커 제거
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      // 새 마커 추가
      if (markers) {
        markers.forEach((markerInfo) => {
          const marker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(markerInfo.lat, markerInfo.lng),
            title: markerInfo.title,
          });
          marker.setMap(mapRef.current);
          markersRef.current.push(marker);
        });
      }

      // 지도 클릭 이벤트 (주소 선택)
      if (onAddressSelect && geocoderRef.current) {
        // 중복 등록 방지: 기존 이벤트 제거 후 다시 등록
        window.kakao.maps.event.removeListener(mapRef.current, "click");

        window.kakao.maps.event.addListener(mapRef.current, "click", (mouseEvent: any) => {
          const coord = mouseEvent.latLng;
          geocoderRef.current.coord2Address(
            coord.getLng(),
            coord.getLat(),
            (
              result: Array<{ road_address?: { address_name: string }; address?: { address_name: string } }>,
              status: "OK" | "ZERO_RESULT" | "ERROR"
            ) => {
              if (status === window.kakao.maps.services.Status.OK) {
                const newAddress =
                  result[0]?.road_address?.address_name || result[0]?.address?.address_name;
                if (newAddress) {
                  onAddressSelect(newAddress);
                }
              }
            }
          );
        });
      }
    });
  }, [isLoaded, latitude, longitude, markers, onAddressSelect]);

  return <div ref={mapContainer} style={{ width: "100%", height: "400px" }} />;
}

export default memo(KakaoMap);
