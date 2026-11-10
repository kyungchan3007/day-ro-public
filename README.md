<div align="center">

# 💘 Dayro

**시간 · 지역 · 목적만 고르면, AI가 오늘의 데이트 코스를 짜주는 웹 서비스**

4인 팀 프로젝트 · 프론트엔드 담당 · 2026.11 베타 운영 중

<br>

[🌐 day-ro.com](https://day-ro.com) · [📷 Instagram @dayro_app](https://www.instagram.com/dayro_app/)

<br>

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?logo=turborepo&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?logo=playwright&logoColor=white)
![Storybook](https://img.shields.io/badge/Storybook-FF4785?logo=storybook&logoColor=white)
![Status](https://img.shields.io/badge/status-베타_테스트_중_1.0.0--rc.6-F59E0B)

<br><br>

<img src="docs/diagrams/screens.png" alt="Dayro 카카오 로그인 · 홈 · 완성된 코스 화면" width="100%">

</div>

> [!NOTE]
> 팀 저장소의 프론트엔드 코드를 공개용으로 정리한 스냅샷입니다. 그대로 실행되지는 않습니다.
> 백엔드 코드 · 커밋 히스토리 · 운영 설정 · 테스트 코드는 빠져 있고, 코드 안의 주소 · 이메일은 `example.invalid` 로 바꿔 두었습니다.

---

## 역할

**🎨 디자인 구현** — 디자이너의 Figma 시안을 디자인 토큰과 공용 컴포넌트로 옮겼습니다.

**🖥️ 화면 · BFF** — 전 화면을 구현하고, 로그인 정보를 브라우저 밖에서 다루는 BFF를 만들었습니다.

**⚡ 성능** — 운영 사이트의 모든 화면을 측정하고 느린 원인을 고쳤습니다.

**🧱 UI 구조** — 앱이 늘어도 디자인이 갈라지지 않도록 UI를 세 층으로 나누고 자동 검사를 붙였습니다.

**🤖 AI 협업** — Claude · Codex와 일하는 규칙을 협업 하네스로 만들었습니다.

작은 팀이라 기능이 돌아가는 데서 멈추면 그 뒤를 챙길 사람이 없었습니다.
그래서 화면 구현과 함께 성능, 구조, 검사까지 맡았습니다.
아래 작업 내용과 배운 점은 위 역할과 같은 순서입니다.

---

## 작업 내용

<details>
<summary><b>🎨 디자인 토큰 · 공용 컴포넌트</b> — Figma 시안의 값을 토큰으로 옮기고, 컴포넌트 시트와 같은 상태로 구현</summary>

<br>

디자이너가 Figma에 컬러 시스템과 컴포넌트 시트를 만들었습니다.
저는 시안의 색 · 글자 크기 · 모서리 · 그림자 값을 디자인 토큰으로 옮겼습니다.
화면 코드에서는 값을 직접 쓰지 않고 토큰만 쓰도록 했습니다.

버튼 · 시트 · 카드는 컴포넌트 시트와 같은 상태(기본 · 눌림 · 비활성 · 포커스)로 구현했습니다.
컴포넌트는 스토리북에 모아 시안과 나란히 비교할 수 있도록 했습니다.

</details>

<details>
<summary><b>🖥️ BFF · 로그인</b> — 토큰은 브라우저 밖 쿠키에만 두고, 모든 응답을 zod 계약으로 검사</summary>

<br>

카카오 로그인을 붙이면서 토큰을 브라우저 저장소에 두지 않기로 했습니다.
브라우저는 Next.js 서버(BFF)만 부르고, BFF가 쿠키 속 토큰으로 API를 대신 부르도록 했습니다.
토큰 쿠키는 스크립트로 읽을 수 없도록 했습니다.

요청과 응답은 모두 `zod` 계약으로 검사했습니다.
응답 모양이 바뀌면 화면이 조용히 깨지는 대신, 계약 테스트에서 먼저 실패하도록 했습니다.

상황 입력 중 로그아웃해도, 다시 로그인하면 하던 단계로 돌아오도록 했습니다.

</details>

<details>
<summary><b>⚡ 성능 측정 · 개선</b> — 운영 모바일 12개 화면 중 11개 목표 통과(LCP 2.5초 · TBT 200ms · CLS 0.1 · 점수 90)</summary>

<br>

어느 화면이 얼마나 느린지부터 재기로 했습니다.
운영 사이트의 모든 화면을 모바일 기준으로 다섯 번씩 재서 기준선을 만들었습니다.
첫 측정에서 홈과 시작 화면의 LCP는 4초대였습니다.

고칠 때는 원인 하나에 PR 하나만 올리도록 했습니다.
운영에 배포한 뒤 같은 방법으로 다시 재서, 확인된 것만 개선으로 인정하도록 했습니다.

측정 도구도 의심했습니다.
같은 화면의 숫자가 0.5초 단위로 끊겨 찍혀서 원인을 찾아봤습니다.
헤드리스 크롬이 첫 그리기를 최대 2초 늦게 기록하고 있었습니다.
측정 스크립트를 매 회차 새 크롬을 띄우는 방식으로 바꿔, 실제와 가까운 숫자가 나오도록 했습니다.

남은 찜 상세 화면은 지도가 화면 준비 뒤에 만들어지는 구조가 원인인 것까지 확인해 다음 과제로 남겼습니다.
번들 예산을 CI에 걸어 다시 느려지지 않도록 했습니다.

</details>

<details>
<summary><b>🧱 UI 3층 구조 · 자동 검사</b> — 범용 · 앱 공통 · 라우트 묶음으로 나누고, 경계 위반은 검사에서 실패하도록</summary>

<br>

어드민 앱이 생기면서 서비스 앱의 디자인 값을 복사해 쓰기 시작했습니다.
얼마 지나지 않아 같은 이름의 색이 두 앱에서 다른 값을 갖고 있었습니다.

UI를 세 층으로 나눴습니다.
두 앱이 함께 쓰는 범용 패키지, 한 앱 안의 공통, 코스 화면처럼 한 묶음 안에서만 쓰는 층입니다.
컴포넌트와 디자인 값이 어느 층에 속하는지는 소속표로 정했습니다.
소속을 벗어난 import나 디자인 값 사용은 ESLint와 직접 만든 검사 도구에서 실패하도록 했습니다.

작업은 다섯 단계로 나눠 진행했습니다.
단계마다 빌드된 CSS의 디자인 값을 비교해, 화면이 바뀌지 않도록 했습니다.
공용 묶음이 가벼워져 대부분 화면의 초기 JS가 약 13KB 줄었습니다.

</details>

<details>
<summary><b>🤖 AI 협업 하네스</b> — Claude는 UI, Codex는 로직 · 검증, 다른 쪽이 승인해야 작업이 닫히도록</summary>

<br>

프론트엔드는 Claude Code와 Codex 두 AI와 함께 만들었습니다.
처음에는 맡길 때마다 결과 기준이 달랐고, 검증 없이 끝나는 작업도 있었습니다.

그래서 저장소 안에 협업 하네스를 만들었습니다.
Claude는 UI, Codex는 로직과 검증을 맡도록 역할을 나눴습니다.
작업 전에는 명세(PRD · SDD · tasks)를 쓰고, 작업 후에는 검증 리포트를 남기도록 했습니다.
구현한 쪽이 아니라 다른 쪽이 승인해야 작업이 닫히도록 했습니다.
모든 변경에 이유와 확인 방법이 기록으로 남도록 했습니다.

</details>

---

## 배운 점

<details>
<summary><b>🎨 디자인 토큰 · Tailwind v4</b> — 시안의 값은 코드 한 곳에만, 바뀌었는지는 빌드 CSS 비교로</summary>

<br>

토큰은 Tailwind v4 의 `@theme` 로 만들었습니다.
구조를 바꿀 때마다 빌드된 CSS 를 전후 비교해, 디자인 값이 바뀌지 않았는지 확인하도록 했습니다.
시안의 값이 코드 한 곳에만 있어야, 시안이 바뀌었을 때 모든 화면이 함께 바뀐다는 걸 익혔습니다.

</details>

<details>
<summary><b>🖥️ 모바일 로그인 왕복 상태 유지</b> — 새 탭으로 돌아와도 입력 중이던 단계가 남도록</summary>

<br>

모바일 카카오 로그인은 앱을 거쳐 새 탭으로 돌아오는 경우가 있었습니다.
탭 단위 저장소(`sessionStorage`)만 쓰면 입력 중이던 단계가 사라졌습니다.
로그인 직전 상태를 30분짜리 인계 저장소에 맡기고, 돌아오면 한 번 꺼내 쓴 뒤 지우도록 했습니다.

</details>

<details>
<summary><b>⚡ 측정 신뢰도</b> — 같은 화면도 측정 환경에 따라 2초까지 달라진다</summary>

<br>

같은 화면도 측정 환경에 따라 숫자가 2초까지 달라졌습니다.
그래서 다섯 번 잰 중앙값, 운영 배포 뒤 재측정, 흔들림이 적은 지표(JS 전송량 · TBT) 우선이라는 기준을 세웠습니다.

</details>

<details>
<summary><b>🧱 검사 도구 직접 만들기</b> — 규칙을 문서 대신 <code>tooling/ui-guard</code> 검사로</summary>

<br>

UI 경계 규칙은 문서로만 두면 지켜지지 않았습니다.
그래서 규칙을 검사하는 도구 `tooling/ui-guard` 를 직접 만들었습니다.

모노레포 안의 별도 패키지로 만들고, 앱 코드가 import 하지 않도록 했습니다.
도구가 저장소의 파일을 직접 읽어 검사하는 방식입니다.
검사는 Vitest 테스트로 작성해 `npm run check:ui` 한 줄로 돌고, CI에서 실패하도록 했습니다.

**import 경계 검사**는 다른 앱이나 다른 묶음의 코드를 가져오는 것을 잡습니다.
TypeScript Compiler API 로 import 문을 읽고, `@/` 별칭과 상대 경로를 실제 파일 위치까지 풀어서 판단하도록 했습니다.

**토큰 소유권 검사**는 같은 디자인 값을 두 곳에서 정의하거나, 다른 묶음의 값을 쓰는 것을 잡습니다.
CSS 에서 토큰 정의와 참조를 모아, 소속표(`ui-owners.json`)와 대조하도록 했습니다.

**범용 패키지 검사**는 범용 패키지가 앱 전용 값에 기대는 것과, 지워진 토큰을 쓰는 class 를 잡습니다.
Tailwind 는 없는 토큰 class 를 조용히 무시하기 때문에, Tailwind 내부 API 로 class 를 직접 CSS 로 풀어보도록 했습니다.

**빌드 CSS 검사**는 빌드 과정에서 지워진 변수를 inline style 이나 SVG 가 쓰는 것을 잡습니다.
실제 빌드된 CSS 와 소스의 변수 참조를 대조하도록 했습니다.

도구가 위반을 놓치지 않는지는 일부러 규칙을 어긴 예제 파일로 확인하도록 했습니다.
ESLint 규칙도 같은 소속표에서 자동으로 만들어, 편집기에서 바로 경고가 뜨도록 했습니다.

이 구조는 Turborepo 모노레포 위에 있습니다.
공용 패키지가 바뀌면 앱 빌드 캐시도 새로 만들어지도록 입력 범위를 잡았습니다.
서비스는 OpenNext 로 Cloudflare Workers 에서 돌리고, Workers 에서만 생기는 오류는 배포 전에 실제 Workers 런타임으로 주요 경로를 띄워 확인하도록 했습니다.

</details>

<details>
<summary><b>🤖 기록으로 남기는 기준</b> — 무엇을 확인했는지가 남아야 다음 결정이 빨라진다</summary>

<br>

AI에게 맡길수록 "무엇을 확인했는지"가 남아야 했습니다.
명세와 검증 리포트를 남기도록 한 뒤로, 지난 결정의 이유를 기록에서 바로 찾을 수 있게 됐습니다.
지금은 단위 테스트 1,283개, e2e 테스트 129개, 번들 예산, UI 경계 검사가 이 기준을 지키고 있습니다.

</details>

---

## 서비스 소개

시간대 · 지역 · 목적 세 가지를 고르면 AI가 장소를 골라 순서대로 코스를 짜줍니다.
완성된 코스는 지도에서 동선을 보고, 장소 순서를 끌어서 바꾸고, 네이버 길찾기로 바로 이어집니다.
마음에 드는 코스는 저장하고 카카오톡으로 공유할 수 있습니다.

---

## 프론트엔드 구조

<p align="center"><img src="docs/diagrams/layers.png" alt="app · widgets · features · entities · shared 레이어" width="100%"></p>

---

## 기술 스택

**Next.js 16 · React 19 · TypeScript** — SSR 화면과 BFF

**Turborepo · npm workspaces** — 서비스 앱 · 어드민 · 공용 UI 패키지 분리

**Tailwind CSS 4 · CSS Modules** — 디자인 토큰과 화면별 스타일

**Zod (`zod/mini`)** — BFF 요청 · 응답 검증

**Kakao Maps SDK · dnd-kit** — 코스 동선 표시 · 장소 순서 변경

**Vitest · Playwright · Storybook · MSW** — 단위 · e2e · UI 카탈로그 · API 목

**OpenNext · Cloudflare Workers** — 배포

---

## 폴더 구조

```text
frontend
├── apps
│   ├── web          # 서비스 앱 (Next.js · BFF)
│   │   └── src
│   │       ├── app       # 라우트 · BFF Route Handler
│   │       ├── widgets   # 화면 조합
│   │       ├── features  # 기능 단위 조각 · 규칙
│   │       ├── groups    # 라우트 묶음 공통 UI · 디자인 값
│   │       ├── entities  # 도메인 모델
│   │       └── shared    # 앱 공통 UI · API 계약 · 유틸
│   └── admin        # GA4 운영 대시보드 (배포 준비 중)
├── packages
│   └── ui           # 범용 UI · 디자인 토큰 (@dayro/ui)
└── tooling
    └── ui-guard     # UI 경계 · 토큰 소유권 검사
```
