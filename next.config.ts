import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

// 1. Serwist 설정 초기화
const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts", // 서비스 워커 소스 파일 위치
  swDest: "public/sw.js", // 빌드 후 생성될 실제 파일 위치
  disable: process.env.NODE_ENV === "development", // 개발 중에는 PWA를 끄는 게 일반적
});

// 2. 기존 Next.js 설정
const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"], // 기존 Prisma 설정 유지
  // 필요한 다른 설정들 (images, redirects 등)을 여기에 추가하세요.
};

// 3. Serwist로 감싸서 내보내기
export default withSerwist(nextConfig);
