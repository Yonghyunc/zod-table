import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma가 Turbopack에서 잘 돌아가도록 외부 모듈로 지정
    serverExternalPackages: ["@prisma/client"],
};

export default nextConfig;
