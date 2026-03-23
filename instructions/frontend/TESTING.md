# `instructions/frontend/TESTING.md`

## 목적

이 문서는 React 기반 프론트엔드 작업에서 Codex CLI가 테스트를 **구현 완료 후 확인 절차**가 아니라 **구현을 이끄는 실행 명세**로 다루도록 만들기 위한 기본 작업 프로토콜이다.

이 문서는 다음만 다룬다.

1. 테스트를 먼저 작성하는 작업 순서
2. 테스트 종류 선택 기준
3. 완료 판단 기준과 증빙 형식
4. ESLint, 테스트 러너, CI, Codex 작업 로그의 책임 분리

이 문서는 **좋은/나쁜 예시 모음집**이 아니다. 상세 금지 사례와 대체 예시는 `TEST_ANTI_PATTERNS.md`가 우선한다.

---

## 1. 문서 역할과 관계

### 1.1 이 문서의 역할

이 문서는 Codex CLI가 테스트 작업을 진행할 때 따라야 하는 **프로토콜 문서**다.

핵심 질문은 아래와 같다.

- 무엇을 먼저 기록해야 하는가?
- 어떤 테스트를 어떤 레이어에서 작성해야 하는가?
- 테스트가 완료되었다고 판단하려면 무엇을 남겨야 하는가?
- 어떤 항목을 어떤 도구로 강제하는가?

### 1.2 이 문서가 자세히 다루지 않는 것

아래 내용은 `TEST_ANTI_PATTERNS.md`가 우선한다.

- 구현 세부사항 테스트
- 나쁜 쿼리와 assertion 사례
- 과도한 mocking과 flaky 우회
- snapshot 남용
- 구현 후 테스트 맞추기 패턴

### 1.3 다른 문서와의 관계

- 공개 계약과 상태 경계는 `ARCHITECTURE.md`를 우선한다.
- 프론트엔드 전반 규칙은 관련 frontend 문서를 따른다.
- 테스트 금지 사례는 `TEST_ANTI_PATTERNS.md`를 따른다.
- 특정 route, loader, action, query, form, store를 수정한다면 테스트도 같은 경계를 존중한다.

---

## 2. 최우선 원칙

### 2.1 테스트는 공개 계약과 사용자 관찰 가능 결과를 검증한다

테스트는 아래를 중심으로 작성한다.

- 사용자가 무엇을 보게 되는가
- 사용자가 무엇을 할 수 있는가
- 공개된 입력과 출력 계약이 유지되는가
- 오류와 로딩, 비활성화, 접근성 상태가 어떻게 드러나는가

다음 질문이 테스트의 중심이 되면 방향이 잘못되었을 가능성이 크다.

- internal state가 어떤 값인가
- private helper가 호출되었는가
- 특정 hook이 어떤 순서로 실행되었는가
- DOM 래퍼 구조나 className이 유지되는가

Testing Library는 테스트가 실제 사용자 사용 방식에 최대한 닮아야 하며, 쿼리 우선순위는 `getByRole`을 최상위에 두라고 안내한다. citeturn414123search1

### 2.2 테스트는 구현보다 먼저 작성하고 먼저 실패해야 한다

기능 추가, 버그 수정, 회귀 방지, 위험한 리팩터링은 모두 실패 테스트에서 시작한다.

규칙:

- 새 테스트 또는 수정 테스트는 현재 코드에서 먼저 실패해야 한다.
- 실패를 실행으로 확인하지 않은 테스트는 구현 필요성을 충분히 증명한 것으로 보지 않는다.
- 구현을 먼저 작성하고 테스트를 나중에 맞추는 방식은 금지한다.

### 2.3 기본 선택은 고가치 경계, 저결합 검증이다

테스트는 가능한 한 아래 방향을 따른다.

- 더 사용자 가치가 큰 경계에서 검증한다.
- 더 구현 결합이 낮은 방식으로 검증한다.
- 더 실제 실행 환경에 가까운 방식으로 검증한다.

예:

- 단순 계산은 순수 함수 테스트
- 폼 제출과 상태 변화는 컴포넌트/통합 테스트
- 포커스 이동, 키보드 탐색, pointer interaction은 Browser Mode 우선 검토
- 다중 route, 인증, 네트워크 경계, 실제 사용자 여정은 Playwright E2E 검토

### 2.4 mocking은 기본값이 아니라 예외다

mock은 테스트 편의보다 **공개 계약을 유지하면서 실제 경계를 그대로 재현하기 어려운 경우**에만 사용한다.

허용 판단 기준:

- 외부 시스템 제약이 분명한가
- 실제 경계 테스트보다 비용이 훨씬 낮고 의미 손실이 적은가
- mock을 제거해도 테스트 목적이 유지되는가
- private helper/hook을 숨기기 위한 mock이 아닌가

---

## 3. 아키텍처 경계와 테스트 기준

테스트도 `ARCHITECTURE.md`의 상태 분류와 경계 규칙을 따른다.

### 3.1 React Router loader/clientLoader 경계

페이지 진입 데이터가 loader/clientLoader에서 정해진다면 테스트도 그 계약을 중심으로 작성한다.

- page 테스트는 loader 결과에 의해 어떤 UI가 보이는지 검증한다.
- loader가 해결할 수 있는 데이터를 컴포넌트 내부 effect fetch로 재구성하지 않는다.
- route params, search params, action 결과는 공개 입력으로 취급한다.

### 3.2 TanStack Query 경계

서버 상태는 Query 경계에서 검증한다.

- query hook 내부 구현보다 로딩/성공/에러 상태와 invalidation 결과를 본다.
- query hook 전체를 spy/mocking하는 것보다 네트워크 경계 또는 query client 전제를 통제하는 쪽을 우선한다.
- query result 객체 내부 shape를 사소하게 고정하는 테스트를 만들지 않는다.

### 3.3 React Hook Form 경계

폼 테스트는 RHF 내부 메커니즘이 아니라 공개 계약을 검증한다.

- `defaultValues` 또는 명시적 `reset` 1회 진입점이 기대한 초기 UI를 만드는지 본다.
- 사용자가 입력, blur, submit 했을 때 검증 메시지와 제출 payload가 올바른지 본다.
- `setValue` 호출 횟수, `formState` 내부 구조, 내부 registration 흐름을 직접 검증하지 않는다.

### 3.4 Zustand / 글로벌 UI 경계

전역 UI 상태는 사용자가 인지하는 결과로 검증한다.

- 모달이 열리고 닫히는가
- 토스트가 보이는가
- preference 반영 결과가 렌더되는가

store 구현 디테일, 내부 action 조합, subscription 구조는 테스트의 기본 대상이 아니다.

---

## 4. Codex CLI 기본 작업 프로토콜

이 절차는 권장이 아니라 기본 실행 순서다. 예외가 필요한 경우에는 4.7의 예외 기록 형식을 반드시 남긴다.

### 4.1 요구사항을 테스트 시나리오로 번역한다

구현 파일을 수정하기 전에 아래 형식을 먼저 작성한다.

```text
TDD Plan
1. User-visible behavior:
2. Public contract under test:
3. Failing spec to add first:
4. Why it must fail before changes:
5. Minimal implementation to make it pass:
6. Refactor targets after green:
```

작성 규칙:

- `User-visible behavior`에는 사용자 관찰 가능 결과만 적는다.
- `Public contract under test`에는 props, route output, form submit payload, rendered state, query state, accessibility state 등 공개 계약을 적는다.
- `Failing spec to add first`에는 테스트 파일과 테스트 이름 수준까지 적는다.
- `Why it must fail before changes`에는 현재 코드 기준 실패 이유를 한 줄로 적는다.
- `Minimal implementation to make it pass`에는 필요한 최소 수정만 적는다.
- `Refactor targets after green`에는 green 이후 정리할 항목만 적는다.

### 4.2 테스트를 먼저 추가하거나 수정한다

구현보다 먼저 아래 중 하나를 수행한다.

1. 새 테스트 추가
2. 기존 테스트 수정
3. 부족한 테스트 인프라 추가

원칙:

- 테스트 인프라가 없다면 구현보다 먼저 인프라를 만든다.
- 인프라 추가는 구현 우선의 면허가 아니다.
- 테스트는 현재 코드에서 실패해야 한다.

### 4.3 실패를 실제로 확인하고 기록한다

테스트를 쓴 뒤에는 반드시 실패를 실행으로 확인한다.

기록해야 할 최소 증빙:

```text
Failing Evidence
- Test file:
- Test name or pattern:
- Command run:
- Why it failed before implementation:
```

예시:

```text
Failing Evidence
- Test file: src/features/todos/ui/TodoForm.test.tsx
- Test name or pattern: shows validation message when title is empty
- Command run: pnpm vitest src/features/todos/ui/TodoForm.test.tsx -t "shows validation message when title is empty"
- Why it failed before implementation: 빈 제목 제출 시 validation message가 렌더되지 않음
```

규칙:

- `Failing Evidence`가 없으면 TDD 흐름을 따르지 않은 것으로 본다.
- 실패 원인은 “assertion이 왜 틀렸는가”가 아니라 “현재 공개 계약이 무엇을 못 만족하는가” 기준으로 적는다.
- 테스트를 작성했지만 현재는 통과한다면, 해당 테스트는 failing spec이 아니므로 다시 작성한다.

### 4.4 실패 테스트를 통과시키는 최소 구현만 작성한다

이 단계에서는 다음만 허용한다.

- failing spec을 green으로 만드는 최소 코드 변경
- 테스트를 통과시키기 위한 작은 구조 정리
- 테스트 인프라와 타입 정리의 최소 보완

이 단계에서는 다음을 기본적으로 하지 않는다.

- 범용 추상화 추가
- 대규모 파일 이동
- 공용 훅/유틸 대량 도입
- 관련 없는 cleanup
- failing spec 범위를 넘어서는 UX 변경

### 4.5 green을 확인하고 기록한다

green 확인 시 아래를 기록한다.

```text
Green Evidence
- Command run:
- Passing tests:
- Notes:
```

예시:

```text
Green Evidence
- Command run: pnpm vitest src/features/todos/ui/TodoForm.test.tsx -t "shows validation message when title is empty"
- Passing tests: 1
- Notes: validation message와 submit block 확인
```

규칙:

- green 증빙은 failing spec과 같은 범위를 최소 1회 다시 실행한 결과여야 한다.
- 필요하면 관련 회귀 테스트 묶음을 추가로 실행한다.
- `Notes`에는 “어떤 공개 계약이 이제 만족되는가”를 적는다.

### 4.6 green 이후에만 리팩터링한다

리팩터링은 공개 계약 보존이 전제다.

다음 질문 중 하나라도 “아니오”면 리팩터링 전에 멈춘다.

- 현재 테스트가 공개 계약을 보호하고 있는가
- 이 변경은 failing spec 범위를 벗어나지 않는가
- 테스트가 구현 세부사항에 과하게 결합되어 있지 않은가

리팩터링 후에는 필요한 범위만큼 다시 실행한다.

### 4.7 예외가 필요한 경우 기록한다

다음은 제한적 예외 사유가 될 수 있다.

- 저장소에 테스트 인프라가 전혀 없음
- 브라우저/provider 설정 부재로 Browser Mode 실행 전 준비가 필요함
- 라우터/provider/test harness stabilization이 먼저 필요함
- 대규모 구조 안정화가 선행되어야 failing spec이 의미를 가짐

예외 기록 형식:

```text
TDD Exception
1. Why tests-first is blocked:
2. What setup or stabilization is added first:
3. What failing test will be added immediately after setup:
4. How the exception scope is limited:
```

예외 규칙:

- 예외는 가능한 한 좁게 제한한다.
- 예외 작업이 끝나면 즉시 failing spec 단계로 돌아간다.
- 예외를 이유로 구현 우선으로 장시간 진행하지 않는다.
- 예외가 1개를 넘기면 새 예외를 추가하기 전에 범위를 다시 축소한다.

---

## 5. 테스트 종류 선택 기준

테스트 종류는 “어디서 가장 낮은 결합으로 가장 큰 위험을 줄일 수 있는가”를 기준으로 결정한다.

### 5.1 순수 단위 테스트를 우선하는 경우

다음은 순수 함수 테스트로 충분하다.

- 날짜, 문자열, 숫자 변환
- parser / formatter
- 순수 validator
- UI 프레임워크와 무관한 계산 로직

예시:

```ts
import { describe, expect, it } from "vitest";
import { formatPrice } from "./formatPrice";

describe("formatPrice", () => {
  it("원화를 통화 형식으로 반환한다", () => {
    expect(formatPrice(12000)).toBe("₩12,000");
  });
});
```

### 5.2 React Testing Library 기반 컴포넌트/통합 테스트를 우선하는 경우

다음은 RTL 중심 테스트를 기본으로 검토한다.

- 폼 입력과 제출
- 로딩/에러/empty/success 상태 전환
- props, route data, query result에 따른 렌더 변화
- 접근성 역할, 이름, 상태 검증
- callback payload와 공개 side effect 검증

기본 원칙:

- 쿼리는 `getByRole` → `getByLabelText` → `getByText` 순으로 우선 검토한다.
- 비동기 상태는 `findBy*`를 우선 검토한다.
- `getByTestId`는 role/label/text로 안정적인 접근이 불가능할 때만 마지막 수단으로 사용한다.

Testing Library는 사용자 관점과 접근성 트리를 반영하는 질의를 우선 사용하라고 권장한다. citeturn414123search1

예시:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileForm } from "./ProfileForm";

it("필수 이름이 비어 있으면 검증 메시지를 보여준다", async () => {
  const user = userEvent.setup();

  render(<ProfileForm onSubmit={vi.fn()} />);

  await user.click(screen.getByRole("button", { name: /save/i }));

  expect(await screen.findByRole("alert")).toHaveTextContent(
    /name is required/i,
  );
});
```

### 5.3 Browser Mode를 우선 검토하는 경우

다음은 Browser Mode를 먼저 검토한다.

- 실제 focus 이동, selection, keyboard navigation
- `pointer`, `hover`, layout 영향이 있는 상호작용
- browser semantics에 민감한 input behavior
- jsdom에서 의미가 약해지는 UI interaction

Browser Mode는 테스트를 브라우저에서 직접 실행하게 하며 `window`, `document` 같은 browser globals에 접근하게 한다. 또한 provider와 instance 설정이 필요하다. citeturn414123search0turn414123search4

판단 기준:

- 단일 컴포넌트 또는 작은 UI 흐름인데 브라우저 현실성이 중요하면 Browser Mode
- 전체 사용자 여정까지는 아니지만 jsdom보다 실제 브라우저 의미가 중요하면 Browser Mode

### 5.4 Playwright E2E를 우선 검토하는 경우

다음은 Playwright E2E를 먼저 검토한다.

- 다중 route 이동
- 인증/권한 흐름
- 브라우저와 서버, 라우터, 네트워크 경계가 동시에 얽히는 시나리오
- 진짜 사용자 여정 전체를 검증해야 하는 경우

Playwright는 locator와 web-first assertions 사용을 권장하며, 수동 즉시 판정보다 기다리며 재시도하는 assertion을 쓰라고 안내한다. citeturn414123search3

판단 기준:

- 컴포넌트 수준이 아니라 앱 흐름 전체가 목적이면 Playwright
- route, auth, backend, browser가 함께 얽히면 Playwright

### 5.5 한 변경에 여러 테스트가 필요한 경우

다음 순서로 생각한다.

1. 가장 작은 failing spec 하나를 먼저 만든다.
2. 그 failing spec을 만족시키는 최소 레이어에서 green을 만든다.
3. 회귀 위험이 남으면 상위 레이어 테스트를 추가한다.

원칙:

- 처음부터 모든 레이어 테스트를 한 번에 쓰지 않는다.
- unit + RTL + browser + E2E를 습관적으로 전부 추가하지 않는다.
- 가장 낮은 비용으로 핵심 위험을 덮는 테스트를 먼저 고른다.

---

## 6. 쿼리, assertion, 상호작용 기준

### 6.1 쿼리 우선순위

기본 우선순위:

1. `getByRole`
2. `getByLabelText`
3. `getByText`
4. `getByPlaceholderText` 또는 다른 접근성 기반 질의
5. `getByTestId`는 마지막 수단

### 6.2 비동기 상태 기준

다음은 `findBy*` 또는 적절한 비동기 assertion을 먼저 검토한다.

- 로딩 후 데이터 표시
- 제출 후 성공/실패 메시지 표시
- transition 이후 상태 표시
- lazy rendering 또는 suspense 연계 UI

### 6.3 assertion 기준

assertion은 존재 여부만이 아니라 **공개 계약의 의미**를 드러내야 한다.

권장:

- `toHaveTextContent`
- `toBeDisabled` / `toBeEnabled`
- `toHaveValue`
- `toBeChecked`
- `toHaveAccessibleName`
- Playwright의 `toBeVisible`, `toHaveText` 같은 web-first assertion

지양:

- 의미 없는 `toBeTruthy`
- 구현 호출 수만 보는 assertion
- 수동 즉시 판정 assertion

---

## 7. 완료 조건

작업을 완료로 판단하려면 아래 네 가지가 모두 필요하다.

1. `TDD Plan`이 존재한다.
2. `Failing Evidence`가 존재한다.
3. `Green Evidence`가 존재한다.
4. 관련 테스트가 현재 공개 계약을 보호한다.

다음 중 하나라도 빠지면 테스트 기반 개발을 완료한 것으로 보지 않는다.

- 요구사항을 반영한 failing spec
- 실패 실행 증빙
- green 재실행 증빙
- 예외 사용 시 `TDD Exception`

---

## 8. 도구별 강제 책임 분리

### 8.1 ESLint가 맡는 것

ESLint와 관련 플러그인은 주로 **테스트 코드 품질과 흔한 안티패턴**을 잡는다.

예:

- Testing Library 쿼리/상호작용 안티패턴
- focused test, skipped test, await 누락
- jest-dom matcher 오용
- Playwright locator/assertion 안티패턴 일부

### 8.2 테스트 러너가 맡는 것

Vitest/Browser Mode/Playwright는 **실행 결과와 런타임 의미**를 검증한다.

예:

- failing spec이 실제로 실패하는가
- green이 실제로 통과하는가
- 브라우저 semantics와 비동기 UI가 맞는가
- E2E 흐름이 실제로 유지되는가

### 8.3 CI 스크립트가 맡는 것

CI 또는 별도 스크립트는 **순서 강제와 diff 기반 가드**를 맡는다.

예:

- 구현 파일이 바뀌었는데 대응 테스트 변경이 없는가
- bugfix인데 회귀 테스트가 없는가
- 금지 패턴이 grep/custom script에서 잡히는가
- snapshot 급증이나 timeout 남용이 있는가

### 8.4 Codex 작업 로그가 맡는 것

Codex 작업 로그 또는 PR 기록은 **사람이 검토 가능한 TDD 증빙**을 남긴다.

최소 항목:

- `TDD Plan`
- `Failing Evidence`
- `Green Evidence`
- 필요한 경우 `TDD Exception`

중요:

- ESLint만으로 “테스트를 먼저 썼는가”를 증명할 수 없다.
- 따라서 순서 강제는 CI와 작업 로그가 함께 맡는다.

---

## 9. 기본 실행 명령 예시

프로젝트 상황에 따라 달라질 수 있지만 기본 예시는 아래와 같다.

```bash
pnpm lint
pnpm typecheck
pnpm vitest
pnpm vitest --browser=chromium
pnpm playwright test
```

작은 failing spec은 가능한 한 좁은 범위로 먼저 실행한다.

```bash
pnpm vitest src/features/profile/ui/ProfileForm.test.tsx -t "필수 이름이 비어 있으면 검증 메시지를 보여준다"
```

---

## 10. 최종 체크리스트

구현을 제출하기 전에 아래를 점검한다.

- 요구사항이 사용자 관찰 가능 시나리오로 번역되었는가
- failing spec이 먼저 작성되고 실제로 실패했는가
- green을 만드는 최소 구현만 작성했는가
- Browser Mode와 Playwright 경계를 과도하게 섞지 않았는가
- 테스트가 공개 계약을 보호하고 구현 세부사항에 결합되지 않았는가
- 예외가 있다면 범위를 좁게 기록했는가
- ESLint, 테스트 러너, CI, 작업 로그의 책임을 혼동하지 않았는가

이 문서에 없는 상세 금지 사례와 구체적 나쁜/좋은 예시는 `TEST_ANTI_PATTERNS.md`를 따른다.
