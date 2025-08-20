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

  // 지도 생성 및 기본 설정 (최초 1회 및 좌표 변경 시)
  useEffect(() => {
    if (!isLoaded || !mapContainer.current) return;

    // 지도가 아직 생성되지 않았다면 새로 생성합니다.
    if (!mapRef.current) {
      const mapOption = {
        center: new window.kakao.maps.LatLng(latitude, longitude),
        level: 3,
      };
      mapRef.current = new window.kakao.maps.Map(mapContainer.current, mapOption);
      geocoderRef.current = new window.kakao.maps.services.Geocoder();
    } else {
      // 이미 지도가 있다면 중심 좌표만 부드럽게 이동시킵니다.
      mapRef.current.panTo(new window.kakao.maps.LatLng(latitude, longitude));
    }
  }, [isLoaded, latitude, longitude]);

  // 마커 관리
  useEffect(() => {
    if (!mapRef.current) return;

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
  }, [markers]);

  // 클릭 이벤트 핸들러 관리
  useEffect(() => {
    if (!mapRef.current || !onAddressSelect || !geocoderRef.current) return;

    const handleClick = (mouseEvent: any) => {
      const coord = mouseEvent.latLng;
      geocoderRef.current.coord2Address(coord.getLng(), coord.getLat(), (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const newAddress = result[0]?.road_address?.address_name || result[0]?.address?.address_name;
          if (newAddress) onAddressSelect(newAddress);
        }
      });
    };

    window.kakao.maps.event.addListener(mapRef.current, "click", handleClick);

    // useEffect의 cleanup 함수: 컴포넌트가 언마운트되거나 onAddressSelect가 변경될 때 리스너를 제거합니다.
    return () => {
      window.kakao.maps.event.removeListener(mapRef.current, "click", handleClick);
    };
  }, [onAddressSelect]); // onAddressSelect 콜백이 변경될 때만 이 effect를 재실행합니다.

  return <div ref={mapContainer} style={{ width: "100%", height: "400px" }} />;
}

export default memo(KakaoMap);
