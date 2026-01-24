import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import BottomNavigation from "./components/BottomNavigation";


const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
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
    <html lang="ko" className={notoSansKr.variable}>
      <body
        className={`${notoSans.variable} ${notoSansKr.variable}  antialiased bg-white h-screen overflow-hidden max-w-md mx-auto`}
      >
        {children}
        <BottomNavigation />
      </body>
    </html>
  );
}
