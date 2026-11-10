"use client";

import type { PlaceCandidate } from "@/shared/api/openapi/dayro.openapi";
import { courseResultStatic } from "@/shared/static/course-result";
import { Button } from "@dayro/ui";
import { BottomSheet } from "@/shared/ui/sheet";

import type { PlaceInfoAction } from "../model/place-info";
import { PlaceInfo } from "./PlaceInfo";
import styles from "./css/PlaceInfoSheet.module.css";

export interface PlaceInfoSheetProps {
  /** 열려 있는 장소. null 이면 닫힘. */
  place: PlaceCandidate | null;
  action: PlaceInfoAction;
  max: number;
  onConfirm: () => void;
  onClose: () => void;
}

/** 선택 화면 장소 정보 시트 (features/course-result, issue #365). 동작은 usePlaceInfo 가 정하고 여기서는 그리기만 한다. */
export function PlaceInfoSheet({ place, action, max, onConfirm, onClose }: PlaceInfoSheetProps) {
  const copy = courseResultStatic.info;
  const label = action === "blocked" ? copy.fullLabel(max) : action === "deselect" ? copy.deselectLabel : copy.selectLabel;
  return (
    <BottomSheet open={place != null} onClose={onClose} title={place?.name ?? ""}>
      {place ? (
        <div className={styles.body}>
          <PlaceInfo place={place} />
          <div className={styles.actions}>
            <Button
              variant={action === "deselect" ? "tonal" : "primary"}
              size="lg"
              fullWidth
              disabled={action === "blocked"}
              onClick={onConfirm}
            >
              {label}
            </Button>
            <button type="button" className={styles.close} onClick={onClose}>
              {copy.closeLabel}
            </button>
          </div>
        </div>
      ) : null}
    </BottomSheet>
  );
}
