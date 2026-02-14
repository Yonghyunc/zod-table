import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import BottomNavigation from "./components/BottomNavigation";

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
  title: "ZoD-Table",
  description: "자취생 식단 기록 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSans.variable} ${notoSansKr.variable}`}>
      <body
        className={`${notoSans.variable} ${notoSansKr.variable} mx-auto h-screen max-w-md overflow-hidden bg-white antialiased`}
      >
        <div className="h-[calc(100dvh-64px)] overflow-y-auto">
          {children}
        </div>
        <BottomNavigation />
      </body>
    </html>
  );
}
