import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WLS - 위시켓 법무 관리 시스템",
  description: "위시켓 법무팀 전용 케이스 관리 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
