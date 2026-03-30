# Frontend Adapter

## 목적

harness-engine이 프론트엔드 도메인 하네스를 생성하거나 보강할 때, 공통 `research` phase 이후 이 어댑터를 로드하여 프론트엔드 고유의 Coverage Contract, Anti/Good 필수 쌍, 검증 기준을 적용한다.

## Coverage Contract

프론트엔드 하네스에는 다음 항목이 반드시 포함되어야 한다. 누락 시 하네스가 불완전한 것으로 판정한다.

### 필수 축 (모든 프론트엔드 프로젝트)

1. **상태 관리 분류 기준**
   - 서버 상태, 라우트 진입 데이터, 폼 상태, 글로벌 UI 상태, 로컬 UI 상태의 구분 기준
   - 각 상태 유형에 대한 도구 선택 규칙
2. **컴포넌트 설계 패턴**
   - 폴더/레이어 구조 규칙
   - import 경계 규칙
   - props 전달 기준과 대안
3. **데이터 흐름 규칙**
   - 데이터 fetch 방식 (loader, query, effect 중 어떤 것을 언제 사용하는가)
   - mutation 후 처리 방식
   - 캐시 전략
4. **폼 처리 규칙**
   - 폼 상태의 단일 진실 공급원
   - 초기값 주입 방식
   - 유효성 검증 방식
5. **부수 효과(useEffect) 사용 기준**
   - 허용 케이스와 금지 케이스의 명확한 분류
   - 금지 케이스별 대체 방법

### 조건부 축 (프로젝트에 따라)

- 접근성(a11y) 기준 — 공개 서비스인 경우 필수
- 국제화(i18n) 전략 — 다국어 지원 시
- 성능 최적화 기준 — 대규모 사용자 대상 시
- 테스트 전략 — 테스트 코드 작성이 범위에 포함된 경우

## 1차 근거 소스

프론트엔드 하네스의 규칙은 다음 소스를 1차 근거로 사용한다. 도메인 내 스택에 따라 추가 소스가 달라진다.

- React 공식 문서 (react.dev)
- 사용 중인 라우터 공식 문서 (React Router, Next.js, Remix 등)
- 사용 중인 상태 관리 도구 공식 문서 (TanStack Query, Zustand, Redux 등)
- 사용 중인 폼 라이브러리 공식 문서 (React Hook Form, Formik 등)
- MDN Web Docs (브라우저 API, HTML/CSS)

선택형 보조 도구:
- Context7 MCP
  - 공식 문서 스니펫 검색을 빠르게 보강할 수 있다.
  - 단, 최종 규칙과 인용은 원문 공식 문서로 다시 확인한다.

스택별 추가 소스는 `stacks/<stack>.md`에서 정의한다.

## Paired Example Pack

프론트엔드 task adapter는 아래 example pack과 함께 유지한다.

- `references/examples/frontend/README.md`
- `references/examples/frontend/ANTI_GOOD_REFERENCE.md`
- `references/examples/frontend/VALIDATION_REFERENCE.md`

규칙:

- 위 3개가 없으면 정식 adapter 완료 상태로 보지 않는다.
- example pack은 규범 계약이 아니라 reference-only evidence다.
- adapter가 무엇을 강제하는지, example pack은 그것이 실제로 어떤 밀도로 써야 하는지 보여준다.

## Anti/Good 필수 쌍 목록

프론트엔드 하네스의 ANTI_PATTERNS.md에는 다음 케이스 각각에 대해 Anti와 Good 쌍이 **반드시** 존재해야 한다. 한쪽만 있으면 불완전 상태로 판정한다.

### 상태 관리

| 케이스 | Anti 내용 | Good 내용 |
|---|---|---|
| 서버 상태 복제 | 서버 데이터를 로컬 상태에 복제 저장 | 서버 상태 도구(Query)에서 직접 구독 |
| 상태 도구 오용 | 서버/폼/라우트 데이터를 글로벌 상태에 저장 | 각 상태 유형에 맞는 도구 사용 |

### 데이터 흐름

| 케이스 | Anti 내용 | Good 내용 |
|---|---|---|
| useEffect fetch | useEffect로 데이터 fetch | loader 또는 Query 사용 |
| mutation 후 수동 동기화 | mutation 성공 후 로컬 상태 수동 패치 | invalidate/revalidate 사용 |

### 폼

| 케이스 | Anti 내용 | Good 내용 |
|---|---|---|
| 초기값 분산 주입 | useEffect + setValue 반복으로 초기값 주입 | defaultValues 또는 명시적 reset 1회 |
| 폼 상태 중복 | 폼 값을 로컬 상태에 별도 저장 | 폼 라이브러리를 단일 진실 공급원으로 사용 |

### 컴포넌트 설계

| 케이스 | Anti 내용 | Good 내용 |
|---|---|---|
| props drilling | 2단계 이상 props 전달 | context, store, route data 등 대안 사용 |
| 레이어 경계 위반 | 하위 레이어가 상위 레이어 import | 레이어 규칙에 따른 단방향 의존 |

### useEffect

| 케이스 | Anti 내용 | Good 내용 |
|---|---|---|
| 파생 값 동기화 | props/state에서 계산 가능한 값을 effect로 state에 저장 | render 계산 또는 useMemo |
| 이벤트 처리 | 사용자 이벤트를 effect로 처리 | event handler 직접 사용 |

**주의**: 위 목록은 최소 필수 쌍이다. 프로젝트 스택에 따라 추가 쌍이 필요할 수 있다.

## 드라이런 입출력 예시

### Positive Case: 상태 관리 분류 검증

**Input**: "사용자 프로필 데이터를 화면에 표시하고, 사용자가 프로필을 수정할 수 있는 폼을 제공해야 한다."

**Expected Output (하네스가 안내해야 하는 방향)**:
- 프로필 표시 데이터 → 서버 상태 (TanStack Query)
- 프로필 수정 폼 → 폼 상태 (React Hook Form)
- 폼 초기값 → loader 또는 Query에서 가져와 defaultValues로 전달
- 저장 요청 → mutation + invalidate

### Negative Case: useEffect 남용 감지

**Input**: "API에서 데이터를 가져와서 state에 저장한 후 화면에 표시한다."

**Expected Output (하네스가 차단해야 하는 패턴)**:
- useEffect 내 fetch → 금지 케이스로 감지
- state에 저장 → 서버 상태 복제로 감지
- 대안 제시: TanStack Query 또는 loader 사용

## 스택 분기

프론트엔드 도메인 내 기술스택에 따라 추가 지침이 필요하다.

스택 감지 순서:
1. 프로젝트 루트의 AGENTS.md / CLAUDE.md에서 스택 선언 확인
2. 선언이 없으면 package.json 확인 (next, react-router-dom, remix, astro 등)
3. 선언도 없고 감지도 불가능하면 사용자에게 스택 선택을 요청

스택별 추가 지침 파일:
- `stacks/frontend-nextjs.md` — App Router, Server Components, SSR/SSG 전략
- `stacks/frontend-react-spa.md` — React Router DOM, CSR, SPA 라우팅
- (추후 필요 시 추가)

스택 파일이 아직 없으면 하네스 생성 시 해당 스택의 공식 문서를 조사하여 핵심 패턴을 Coverage Contract에 추가한다.

## 스킬 내부 reference example

- `references/examples/frontend/*`에는 현재 저장소의 레거시 프론트엔드 자료와 직접 예시에서 추린 reference-only evidence가 있다.
- 이 예시는 문서 구조, Anti/Good 직접성, validation 강도의 기준을 보여주기 위한 것이며, 새 프로젝트에 그대로 복사할 규칙이 아니다.
- 현재 프로젝트 스택과 맞지 않는 예시는 참고만 하고 portable core 규칙으로 승격하지 않는다.

## 설계 근거

- Coverage Contract 필수 축: React/라우터/상태관리/폼 계층에서 반복적으로 필요한 판단 축과 레거시 evidence를 교차 정리한 결과
- Anti/Good 필수 쌍 구조: OpenAI GPT-5 Prompting Guide의 XML-Tagged Instruction Blocks + Addyosmani 3-Tier Boundary System
- 스택 분기: Next.js AGENTS.md 공식 패턴 (nextjs.org/docs/app/guides/ai-agents) + Anthropic Skill authoring best practices (Domain-specific organization)
