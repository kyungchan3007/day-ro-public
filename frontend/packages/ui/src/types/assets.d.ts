/** 패키지 자체 타입 검사용 자산 선언. 앱 next-env.d.ts 에 기대지 않는다(issue #381). */
declare module "*.webp" {
  import type { StaticImageData } from "next/image";

  const src: StaticImageData;
  export default src;
}

declare module "*.module.css" {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}
