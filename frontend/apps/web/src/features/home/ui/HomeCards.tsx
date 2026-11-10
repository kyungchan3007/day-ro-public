import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

import { homeStatic } from "@/shared/static/home";
import { cn } from "@dayro/ui";
import { Illustration } from "@/shared/ui/illustration";

import styles from "./css/HomeCards.module.css";

/**
 * 홈 벤토 카드 조각 (features/home, issue #328).
 * 경로 이동만 담당하고, 배치는 widgets/home 이 맡는다. 세션 · 코스 상태는 다루지 않는다.
 * 고정 높이 대신 min-height 를 써서 작은 화면 · 큰 글자에서도 내용이 잘리지 않게 한다.
 */
export function HomeCreateCard({ imagePriority = false, className }: { imagePriority?: boolean; className?: string }) {
  const { title, subtitle, cta, href } = homeStatic.cards.create;
  return (
    <Link href={href} className={cn(styles.tile, styles.create, className)}>
      <span className={styles.createTitle}>{title}</span>
      <span className={styles.createSubtitle}>{subtitle}</span>
      <span className={styles.createFoot}>
        <span className={styles.createCta}>
          {cta}
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
        <Illustration name="date-planning" width={208} priority={imagePriority} className={styles.createImage} />
      </span>
    </Link>
  );
}

export function HomeSavedCard({ image, className }: { image: StaticImageData; className?: string }) {
  const { title, subtitle, href } = homeStatic.cards.saved;
  return (
    <Link href={href} className={cn(styles.tile, styles.small, styles.saved, className)}>
      <Image src={image} alt="" width={76} height={64} className={styles.savedImage} />
      <span className={styles.smallCopy}>
        <span className={styles.smallTitle}>{title}</span>
        <span className={styles.savedSubtitle}>{subtitle}</span>
      </span>
    </Link>
  );
}

export function HomeServiceAreaCard({ className }: { className?: string }) {
  const { title, subtitle } = homeStatic.cards.serviceArea;
  return (
    <div className={cn(styles.tile, styles.small, styles.serviceArea, className)}>
      <Illustration name="map-pin" width={92} className={styles.serviceAreaImage} />
      <span className={styles.smallCopy}>
        <span className={styles.smallTitle}>{title}</span>
        <span className={styles.serviceAreaSubtitle}>{subtitle}</span>
      </span>
    </div>
  );
}

export function HomePopularRegions({ regions, className }: { regions: readonly string[]; className?: string }) {
  const { heading, href } = homeStatic.popularRegions;
  if (regions.length === 0) return null;
  return (
    <section aria-labelledby="home-popular-regions" className={cn(styles.tile, styles.popular, className)}>
      <h2 id="home-popular-regions" className={styles.popularHeading}>
        {heading}
      </h2>
      <ul className={styles.chips}>
        {regions.map((region) => (
          <li key={region}>
            <Link href={href} className={styles.chip}>
              {region}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 인기 동네를 받는 동안 자리를 잡아 레이아웃이 밀리지 않게 한다. */
export function HomePopularRegionsSkeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn(styles.tile, styles.popular, className)}>
      <span className={styles.popularHeading}>{homeStatic.popularRegions.heading}</span>
      <span className={styles.chips}>
        <span className={styles.chipSkeleton} />
        <span className={styles.chipSkeleton} />
        <span className={styles.chipSkeleton} />
      </span>
    </div>
  );
}
