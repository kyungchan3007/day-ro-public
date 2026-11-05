import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  buildAgeCheckPath,
  buildPathWithQuery,
  needsAgeCheck,
  readAgeCheckSignals,
} from "@/features/auth/model/age-check";
import { getCourseNewPageData } from "@/features/situation/server/get-course-new-page-data";
import { SituationFlow } from "@/widgets/situation";

/**
 * 코스 생성(상황입력) 진입 라우트.
 * 주소의 step·rev 를 서버에서 정규화하고, 조건·후보는 클라이언트 흐름 상태에서 복원한다(issue #129).
 * 레거시 상태 쿼리 등 계약 밖 주소는 생성·분석 없이 첫 단계로 정리한다.
 */
interface CourseNewPageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function CourseNewPage({
  searchParams,
}: CourseNewPageProps) {
  const params = await searchParams;

  // 코스 생성부터 기기 ID 등 정보를 다루므로, 주소로 바로 들어와도 만 14세 확인을 거친다(issue #324).
  if (needsAgeCheck(readAgeCheckSignals(await cookies()))) {
    redirect(buildAgeCheckPath({ intent: "browse", next: buildPathWithQuery("/course/new", params) }));
  }

  const result = await getCourseNewPageData(params);

  if (result.kind === "redirect") {
    redirect(result.url);
  }

  return <SituationFlow {...result.data} />;
}
