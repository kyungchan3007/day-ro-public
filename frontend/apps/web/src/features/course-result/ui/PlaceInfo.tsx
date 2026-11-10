"use client";

import type { PlaceCandidate } from "@/shared/api/openapi/dayro.openapi";
import { courseMapStatic } from "@/shared/static/course-map";
import { courseResultStatic } from "@/shared/static/course-result";
import { cn, StarIcon } from "@dayro/ui";

import { usePlacePhoto } from "../hooks/usePlacePhoto";
import { buildPlaceInfoView } from "../model/place-info";
import styles from "./css/PlaceInfo.module.css";

export interface PlaceInfoProps {
  place: PlaceCandidate;
  /** 작은 미리보기(마우스)면 true. 사진을 작게 쓰고 이름을 생략한다. */
  compact?: boolean;
}

/**
 * 선택 화면 장소 정보 (features/course-result, issue #365).
 * 정보 시트와 마우스 미리보기가 같은 내용을 쓴다. 이미 받은 후보 데이터만 쓰고, 사진만 열었을 때 요청한다.
 */
export function PlaceInfo({ place, compact = false }: PlaceInfoProps) {
  const photo = usePlacePhoto(place.photoUrl);
  const { meta, rating, reviewCount, details } = buildPlaceInfoView(place);

  return (
    <div className={cn(styles.info, compact && styles.compact)}>
      {photo.src ? (
        // 백엔드 프록시 사진이라 next/image 최적화 대신 그대로 쓴다(확정 화면과 같은 방식).
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.src}
          alt={courseMapStatic.placeDetail.photoAlt(place.name)}
          loading="lazy"
          decoding="async"
          onError={photo.onError}
          className={styles.photo}
        />
      ) : (
        <div className={cn(styles.photo, styles.photoEmpty)} role="img" aria-label={courseMapStatic.placeDetail.photoEmpty}>
          <span aria-hidden>{courseMapStatic.placeDetail.photoEmpty}</span>
        </div>
      )}
      {meta || rating != null ? (
        <p className={styles.summary}>
          {meta ? <span>{meta}</span> : null}
          {rating != null ? (
            <span className={styles.rating}>
              <span aria-hidden className={styles.star}>
                <StarIcon size={12} />
              </span>
              <span className="sr-only">평점 </span>
              {rating.toFixed(1)}
              {reviewCount != null ? ` · ${courseResultStatic.info.reviews(reviewCount)}` : null}
            </span>
          ) : null}
        </p>
      ) : null}
      <dl className={styles.rows}>
        {details.map((row) => (
          <div key={row.label} className={styles.row}>
            <dt>{row.label}</dt>
            <dd className={cn(row.empty && styles.muted)}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
