import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import BottomNavigation from "./components/BottomNavigation";
import { CategoryProvider } from "@/context/CategoryContext";

const notoSans = localFont({
  src: [
    {
      path: "./_fonts/NotoSans-VariableFont_wdth,wght.ttf",
      style: "normal",
    },
    {
      path: "./_fonts/NotoSans-Italic-VariableFont_wdth,wght.ttf",
      style: "italic",
    },
  ],
  variable: "--font-noto-sans",
  weight: "100 900", // 가변 폰트의 두께 범위를 지정
  display: "swap",
});

const notoSansKr = localFont({
  src: "./_fonts/NotoSansKR-VariableFont_wght.ttf",
  variable: "--font-noto-sans-kr",
  weight: "100 900", // 가변 폰트의 두께 범위를 지정
  display: "swap",
});

export const metadata: Metadata = {
  manifest: "/manifest.json", // manifest.ts가 자동으로 이 경로로 서빙됨
  title: "ZoD-Table",
  description: "자취생을 위한 식단&식비 관리 서비스",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "zod-table",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // PWA 풀스크린 대응
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${notoSans.variable} ${notoSansKr.variable}`}
      suppressHydrationWarning
    >
      {/* body에서는 max-w-md와 mx-auto를 제거합니다 */}
      <body className="h-screen bg-gray-100 antialiased">
        <CategoryProvider>
          {/* 실제 콘텐츠 영역을 담당하는 Wrapper 생성 */}
          <div className="relative mx-auto flex h-full max-w-md flex-col bg-white shadow-lg">
            <main className="scrollbar-hide h-[calc(100vh-64px)] overflow-x-hidden overflow-y-auto">
              {children}
            </main>

            <BottomNavigation />
          </div>
        </CategoryProvider>
      </body>
    </html>
  );
}
