# `instructions/frontend/ANTI_PATTERNS.md`

## 프론트엔드 아키텍처 규칙

이 섹션은 React 기반 프론트엔드 작업 시 Codex가 반드시 따라야 하는 규칙이다.
권장 수준이 아니라 기본 동작 원칙이며, 예외가 필요한 경우 근거를 코드와 기록에 남긴다.

### 최우선 원칙

- React 공식 문서, TanStack Query 공식 문서, React Router 공식 문서, React Hook Form 공식 문서, Zustand 공식 문서, Feature-Sliced Design 공식 문서를 우선 참조한다.
- 블로그, 예제 글, 커뮤니티 답변은 공식 문서로 확인된 뒤에만 보조 근거로 사용한다.
- 구현 전에 아래 의사결정 순서를 따른다.
  1. 이 값이 서버 상태인가?
  2. 이 값이 페이지 진입 시 필요한 데이터인가?
  3. 이 값이 폼 상태인가?
  4. 이 값이 글로벌 UI 상태인가?
  5. 이 로직이 외부 시스템 동기화인가?

### 상태 관리 선택 규칙

- 서버 상태는 TanStack Query를 우선 사용한다.
- 페이지 진입 시 필요한 데이터는 React Router loader/clientLoader를 우선 사용한다.
- 사용자 변경 작업은 React Router action/clientAction 또는 TanStack Query mutation을 사용한다.
- 폼 상태는 React Hook Form을 사용한다.
- 글로벌 UI 상태(모달, 토스트, 드로어, 필터 UI, 세션 단위 preference)만 Zustand를 사용한다.
- 서버 상태를 Zustand에 복제 저장하지 않는다.
- 폼 상태를 Zustand 또는 일반 React state에 중복 저장하지 않는다.

### useEffect 규칙

- useEffect는 외부 시스템 동기화에만 사용한다.
- 다음 목적의 useEffect 추가를 금지한다.
  - props/state에서 파생 가능한 값을 state로 다시 저장
  - 최초 데이터 fetch
  - mutation 성공 후 화면 상태를 맞추기 위한 동기화
  - 폼 초기값 주입
  - URL/search params를 일반 state에 복제
  - 단순 이벤트 처리 로직
- 다음 경우만 예외적으로 허용한다.
  - 브라우저 API 구독 및 해제
  - 타이머 등록 및 해제
  - DOM imperative 제어
  - 외부 위젯 또는 서드파티 라이브러리 연결
  - visibility/focus/resize 같은 외부 이벤트 구독
- 예외적인 useEffect를 추가할 때는 바로 위에 이유를 주석으로 남긴다.

### Props 규칙

- props는 leaf UI 컴포넌트의 표현 목적에 한해 최소한으로 사용한다.
- 2단계 이상 prop drilling을 금지한다.
- 페이지 → 위젯 → 기능 → 엔티티를 관통하는 제어용 props 전달을 금지한다.
- 다음 대안을 우선 검토한다.
  - React Router loader data
  - TanStack Query 재사용
  - React Hook Form context
  - Zustand selector
  - FSD slice public API
- React Router가 생성하는 Route.ComponentProps 사용은 허용한다.
- 공개 API가 필요한 재사용 컴포넌트가 아니라면 불필요한 props 확장을 금지한다.

### TanStack Query 규칙

- 서버 데이터 fetch를 useEffect로 구현하지 않는다.
- query key는 배열 기반으로 정의한다.
- queryFn에서 사용하는 식별자는 query key에 포함한다.
- QueryClient는 앱 수명 동안 안정적으로 1회 생성한다.
- query hook이 반환한 객체 전체를 dependency array에 넣지 않는다.
- mutation 이후에는 임의의 local state patch보다 invalidate/revalidate를 우선 검토한다.
- 폼 기본값 구성을 위해 API 데이터가 필요할 때는 먼저 React Router loader/clientLoader에서 데이터를 확보할 수 있는지 검토한다.
- Query 캐시와 통합해야 하는 경우 `queryClient.ensureQueryData`를 우선 검토하고, 항상 명시적 fetch가 필요한 경우에만 `fetchQuery`를 사용한다.

### React Router 규칙

- 페이지 로딩 데이터는 loader/clientLoader를 먼저 검토한다.
- 페이지 컴포넌트는 라우팅 조합과 화면 배치에 집중하고, 비즈니스 로직은 features/entities로 내린다.

### React Hook Form 규칙

- 폼의 단일 진실 공급원은 RHF다.
- 초기값은 `useForm({ defaultValues })` 또는 명시적 `reset` 1회 진입점으로 넣는다.
- 각 input에서 제각각 `defaultValue`를 흩뿌리지 않는다.
- `useEffect + setValue/reset` 반복 호출로 폼을 동기화하지 않는다.
- 깊게 중첩된 form-aware 컴포넌트에서는 `FormProvider`와 `useFormContext`를 우선 검토한다.
- controlled input 또는 재사용 가능한 form field adapter가 필요할 때는 `useController`를 우선 검토한다.
- 동적 배열 필드는 `useFieldArray`를 사용한다.
- 특정 필드 값 구독은 `useWatch`를 우선 검토한다.
- 특정 form state 구독은 `useFormState`를 우선 검토한다.
- 단순한 네이티브 입력은 `register`를 우선 검토한다.
- 위 훅들은 리렌더 범위 축소와 props drilling 방지를 위한 도구이며, 단순 폼에 기계적으로 모두 도입하지 않는다.
- API 데이터로 RHF 기본값을 구성해야 할 때는 다음 순서를 따른다.
  1. 페이지 진입 전에 필요하면 React Router loader/clientLoader에서 먼저 해결한다.
  2. Query 캐시와 연결해야 하면 `queryClient.ensureQueryData` 또는 `fetchQuery`로 데이터를 확보한다.
  3. 확보한 결과를 `defaultValues` 또는 명시적 `reset` 1회 진입점에 전달한다.
  4. 컴포넌트 내부에서 API 응답을 effect로 받아 여러 `setValue` 호출로 분산 주입하지 않는다.

### Zustand 규칙

- Zustand는 글로벌 UI/세션 상태에만 사용한다.
- 서버 상태, 폼 상태, 페이지 로딩 데이터를 Zustand에 저장하지 않는다.
- store는 slice 구조로 나눈다.
- selector 기반 hook으로 필요한 값만 구독한다.
- store 전체를 통째로 구독하지 않는다.

### Feature-Sliced Design 규칙

- 기본 레이어는 app, pages, widgets, features, entities, shared를 사용한다.
- pages는 라우트 진입점이다. 다른 pages를 import하지 않는다.
- widgets는 pages에 의존하지 않는다.
- features는 widgets/pages/다른 features에 직접 의존하지 않는다.
- entities는 features/widgets/pages에 의존하지 않는다.
- 외부에서 각 slice 내부 파일로 deep import하지 않고 public API만 사용한다.
- 같은 slice 내부 참조는 상대 경로를 우선 사용한다.
- cross-import가 꼭 필요하다면 명시적 public API 계약을 먼저 설계한다.

### 구현 전 체크리스트

- 이 문제를 useEffect 없이 해결할 수 있는가?
- 이 데이터는 loader 또는 query로 가져오는 편이 맞는가?
- 이 상태는 RHF나 Query가 이미 관리해야 하는 값이 아닌가?
- 새 props를 추가하는 대신 context/store/route data/public API로 해결할 수 있는가?
- FSD layer import rule과 public API rule을 깨지 않는가?

### 작업 후 필수 검증

- `pnpm lint`
- `pnpm typecheck`
- 실패 시 `instructions/FAILURE.md`에 따라 원인을 기록한다.
- 중요한 구조 선택은 `DECISIONS.md`에 기록한다.
- 참고한 공식 문서는 `RESEARCH.md`에 기록한다.
