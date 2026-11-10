import type { NextConfig } from "next";

import { ADMIN_SECURITY_HEADERS } from "./src/shared/config/security-headers";

const nextConfig: NextConfig = {
  // 범용 UI 패키지는 빌드 없이 소스로 두고 앱이 transpile 한다(issue #381).
  transpilePackages: ["@dayro/ui"],
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: [...ADMIN_SECURITY_HEADERS] }];
  },
};

export default nextConfig;
