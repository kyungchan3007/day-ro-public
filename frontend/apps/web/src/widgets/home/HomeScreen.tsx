import { Suspense } from "react";

import { AppShell, SiteFooter } from "@/shared/ui/layout";
import {
  HomeCreateCard,
  HomePopularRegions,
  HomePopularRegionsSkeleton,
  HomePurposeLink,
  HomeSavedCard,
  HomeServiceAreaCard,
} from "@/features/home";
import { getHomePopularRegions } from "@/features/home/server";
import { AccountNavBar } from "@/features/auth";
import { homeStatic } from "@/shared/static/home";
import { siteStatic } from "@/shared/static/site";
import imgSaved from "./assets/img-saved.webp";
import { WebVitalsLogger } from "@/shared/observability";
import styles from "./css/HomeScreen.module.css";

/**
 * 홈(루트) 화면 (widgets/home).
 *
 * 벤토 그리드로 조합한다(issue #328).
 *   - 헤더(NavBar, 뒤로가기 없음) + 제목 + 카드 격자 + 공용 푸터(`SiteFooter`).
 *   - 카드 조각은 features/home, 정적 문구는 shared/static/home.
 *   - server component 로 SSR 렌더. 인기 동네만 Suspense 로 흘려보내 화면을 막지 않는다.
 */
export interface HomeScreenProps {
  /**
   * 첫 카드 그림을 우선 로드할지. 기본 true(회원 홈 · LCP).
   * 비회원 `/` 는 시작 화면과 함께 숨긴 채 내려오므로 false → 지연 로드(숨은 동안 받지 않음, issue #244).
   */
  imagePriority?: boolean;
}

async function PopularRegionsSection() {
  const regions = await getHomePopularRegions();
  return <HomePopularRegions regions={regions} className={styles.wide} />;
}

export function HomeScreen({ imagePriority = true }: HomeScreenProps = {}) {
  return (
    <AppShell
      bleed
      nav={<AccountNavBar showBack={false} />}
      footer={<SiteFooter {...siteStatic.footer} />}
      className={styles.screen}
    >
      {process.env.NODE_ENV === "development" ? (
        <WebVitalsLogger route="home" />
      ) : null}
      <h1 className={styles.heading}>{homeStatic.heading}</h1>
      <HomeCreateCard imagePriority={imagePriority} className={styles.hero} />
      <div className={styles.grid}>
        <HomeSavedCard image={imgSaved} className={styles.stackTall} />
        <HomeServiceAreaCard className={styles.stackTall} />
        <Suspense fallback={<HomePopularRegionsSkeleton className={styles.wide} />}>
          <PopularRegionsSection />
        </Suspense>
        {homeStatic.purposes.map((purpose) => (
          <HomePurposeLink key={purpose.label} {...purpose} />
        ))}
      </div>
    </AppShell>
  );
}
