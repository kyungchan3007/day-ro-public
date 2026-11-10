import type { MetadataRoute } from "next";

/** 어드민은 검색엔진 수집 대상이 아니다. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
