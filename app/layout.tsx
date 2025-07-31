import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth-context";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "이퀄로컬 - 공모전 플랫폼",
  description: "공모전과 팀 매칭을 통해 여러분의 꿈을 실현해보세요",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
        {/* 카카오맵 API 스크립트 로드 */}
        <Script
          type="text/javascript"
          strategy="beforeInteractive"
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&libraries=services&autoload=false`}

          onLoad={() => {
            console.log("스크립트의 문제 없음!");
            if (window.kakao) {
              console.log("window.kakao 객체가 생성됨!", window.kakao);
            } else {
              console.warn("스크립트가 올바르게 로드되었으나 window.kakao 객체를 찾을 수 없습니다.");
            }
          }}
          onError={(e) => {
            console.error("카카오맵 스크립트 로드에 실패했습니다.", e);
          }}
        ></Script>
      </body>
    </html>
  );
}
