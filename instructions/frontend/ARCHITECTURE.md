# `instructions/frontend/ARCHITECTURE.md`

## 목적

이 문서는 React 기반 프론트엔드 구현에서 상태 관리, 데이터 로딩, 폼 처리, 전역 UI 상태, 폴더 구조를 일관되게 유지하기 위한 기준이다.

## 1. 상태 분류

### 서버 상태

- 원천: 서버, API, 백엔드
- 도구: TanStack Query
- 예:
  - 사용자 상세 정보
  - 주문 목록
  - 프로젝트 멤버 목록

### 라우트 진입 데이터

- 원천: 페이지 이동 시점에 필요한 서버/클라이언트 데이터
- 도구: React Router loader/clientLoader
- 예:
  - 상세 페이지 첫 렌더 데이터
  - 검색 조건에 따라 페이지 진입 시 필요한 결과
  - SSR/프리패치 대상 데이터

### 폼 상태

- 원천: 사용자의 입력
- 도구: React Hook Form
- 예:
  - 회원가입 폼
  - 검색 필터 폼
  - 설정 저장 폼

### 글로벌 UI 상태

- 원천: 앱 전역 UI 상호작용
- 도구: Zustand
- 예:
  - 모달 열림/닫힘
  - 토스트 큐
  - 드로어 상태
  - 사용자별 UI preference

### 로컬 UI 상태

- 원천: 특정 컴포넌트 내부 상호작용
- 도구: React local state
- 예:
  - 탭 선택
  - 아코디언 펼침 상태
  - hover/focus 임시 상태

## 2. 무엇을 어디에 두는가

### TanStack Query에 둔다

- 서버에서 가져온 데이터
- 서버 데이터 캐시
- refetch / invalidate / mutation lifecycle
- 뮤테이션 API 요청

### React Router에 둔다

- 페이지 진입과 함께 필요한 데이터

### React Hook Form에 둔다

- 입력값
- validation state
- dirty/touched/submitting state
- 필드 배열과 필드 단위 구독

### Zustand에 둔다

- 여러 컴포넌트가 공유하는 UI 상태
- 페이지를 넘나드는 사용자 preference
- business data가 아닌 UI orchestration 상태

### local state에 둔다

- 컴포넌트 내부에서만 쓰는 표현 상태
- 간단한 토글/선택 상태

## 3. useEffect 사용 기준

### 허용

- 브라우저 API 구독
- 타이머 등록/해제
- 외부 위젯 연결
- imperative DOM 처리
- 외부 시스템과의 연결/정리

### 금지

- props/state에서 유도 가능한 값 동기화
- 데이터를 가져오기 위한 최초 fetch
- mutation 성공 후 상태 맞추기
- 폼 초기값 분배
- search params를 local state로 복제
- 사용자 이벤트를 effect로 처리

### 대체 방법

- render 계산
- useMemo
- event handler
- React Router loader
- TanStack Query
- RHF defaultValues/reset
- Zustand selector

## 4. Props 설계 기준

### 허용

- leaf component의 표현용 props
- 공개 API가 필요한 재사용 컴포넌트
- React Router route component의 generated props

### 금지

- 2단계 이상 prop drilling
- page/widget/feature/entity 경계를 가로지르는 제어 props
- 상위가 모든 상태를 들고 하위에 주입하는 과도한 orchestration props

### 우선 대안

- route loader data
- query cache
- RHF context
- Zustand selector
- slice public API

## 5. FSD 구조

```txt
src/
  app/
  pages/
  widgets/
  features/
  entities/
  shared/
```

### 레이어 규칙

- app: 라우터, provider, 앱 전역 설정
- pages: 라우트 진입점
- widgets: 페이지를 구성하는 큰 UI 블록
- features: 사용자 행동 단위 기능
- entities: 비즈니스 개체
- shared: 외부 세계 연결, 공용 UI, 유틸

### import 규칙

- 상위 레이어는 하위 레이어를 import 가능
- 하위 레이어는 상위 레이어 import 금지
- 같은 레이어의 다른 slice 직접 import 금지
- slice 외부에서는 public API만 import
- shared/app은 segment 간 자유 import 허용

## 6. 라이브러리별 구현 규칙

### TanStack Query

- queryOptions factory 우선
- 배열 queryKey만 사용
- queryFn 식별자는 queryKey에 포함
- query result object 전체를 hook dependency에 넣지 않음
- QueryClient는 안정적으로 1회 생성
- 폼 기본값에 API 데이터가 필요하면 먼저 loader/clientLoader에서 확보할 수 있는지 검토
- Query 캐시를 재사용해야 하면 `queryClient.ensureQueryData` 우선
- 항상 명시적 fetch 의미가 필요할 때만 `fetchQuery`

### React Router

- 페이지 진입 데이터는 loader/clientLoader 우선
- 수동 동기화 useEffect 작성 금지

### React Hook Form

- `defaultValues`를 기준값으로 사용
- `reset`은 명시적 단일 진입점에서만 수행
- `setValue` 반복 동기화 금지
- 깊은 중첩 form-aware 컴포넌트는 `FormProvider` + `useFormContext` 우선
- controlled input/field adapter는 `useController` 우선
- 동적 배열 필드는 `useFieldArray`
- 특정 필드 값 구독은 `useWatch`
- 특정 form state 구독은 `useFormState`
- 단순 네이티브 input은 `register` 우선
- API 데이터 기반 기본값은 다음 순서를 사용
  1. loader/clientLoader
  2. `queryClient.ensureQueryData` 또는 `fetchQuery`
  3. `useForm({ defaultValues })` 또는 명시적 `reset`
- API 응답을 effect에서 받아 여러 `setValue`로 흩뿌리는 패턴 금지

### Zustand

- slice 구조 사용
- selector로 필요한 값만 구독
- server/form/page data 저장 금지
- whole-store subscription 금지

## 7. RHF 선택 기준

- 깊은 중첩에서 props drilling 없이 form methods가 필요하면 `useFormContext`
- 외부 UI 라이브러리와 결합한 controlled field가 필요하면 `useController`
- 배열 필드를 추가/삭제/정렬해야 하면 `useFieldArray`
- 특정 필드 값만 반응형으로 읽으면 되면 `useWatch`
- dirty/errors/isSubmitting 등 특정 form state만 읽으면 되면 `useFormState`
- 위 조건이 아니라 단순 input이면 `register`

## 8. 코드 리뷰 체크리스트

- 이 useEffect는 외부 시스템 동기화인가?
- 이 props 추가는 정말 public API인가?
- loader/action으로 대체 가능한가?
- 서버 상태를 Query 대신 다른 곳에 복제하지 않았는가?
- RHF와 local state가 중복되지 않는가?
- 폼 기본값을 effect로 분산 주입하지 않았는가?
- Query 캐시와 기본값 연결이 필요할 때 `ensureQueryData`/`fetchQuery` 사용 이유가 명확한가?
- FSD public API를 우회하지 않았는가?
