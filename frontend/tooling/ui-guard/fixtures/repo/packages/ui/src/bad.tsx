// 실패 fixture: 범용 패키지가 앱 · 서버 전용 · 자기 패키지 · 대상 밖을 가져온다
import { x } from "@/shared/ui";
import { cookies } from "next/headers";
import "server-only";
import { y } from "@dayro/ui";
import { z } from "../../../apps/web/src/a/ok";
export { w } from "dayro-frontend/src/x";
type T = typeof import("dayro-admin");
const lazy = () => import("../../../apps/admin/src/a");
const r = require("/abs/path");
