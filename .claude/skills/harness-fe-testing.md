---
name: harness-fe-testing
description: "프론트엔드 테스트, TDD, Vitest, React Testing Library, Playwright, Browser Mode, 테스트 작성, 테스트 프로토콜, red-green-refactor, failing spec, TDD Plan, 테스트 종류 선택 작업 시 활성화. TDD 프로토콜을 제공."
user-invocable: true
---

# Frontend Testing Protocol

테스트를 **구현 완료 후 확인 절차**가 아니라 **구현을 이끄는 실행 명세**로 다룬다.

## 최우선 원칙

1. 테스트는 **공개 계약과 사용자 관찰 가능 결과**를 검증한다. internal state, private helper, hook 실행 순서, DOM className은 대상이 아니다.
2. 테스트는 **구현보다 먼저 작성**하고 **먼저 실패**해야 한다.
3. 기본 선택은 **고가치 경계, 저결합 검증**이다.
4. mocking은 기본값이 아니라 **예외**다.

---

## TDD 작업 프로토콜

### Step 1. 요구사항을 테스트 시나리오로 번역

구현 파일을 수정하기 전에 먼저 작성한다:

```text
TDD Plan
1. User-visible behavior:
2. Public contract under test:
3. Failing spec to add first:
4. Why it must fail before changes:
5. Minimal implementation to make it pass:
6. Refactor targets after green:
```

### Step 2. 테스트를 먼저 추가하고 실패 확인

```text
Failing Evidence
- Test file:
- Test name or pattern:
- Command run:
- Why it failed before implementation:
```

- 실패를 실행으로 확인하지 않은 테스트는 구현 필요성을 증명한 것으로 보지 않는다.
- 구현을 먼저 작성하고 테스트를 나중에 맞추는 방식은 금지.

### Step 3. 최소 구현으로 통과시키기

- failing spec을 green으로 만드는 최소 코드 변경만 허용.
- 범용 추상화, 대규모 파일 이동, 관련 없는 cleanup 금지.

### Step 4. Green 확인

```text
Green Evidence
- Command run:
- Passing tests:
- Notes:
```

### Step 5. Green 이후에만 리팩터링

공개 계약 보존이 전제. 리팩터링 후 재실행.

### 예외

```text
TDD Exception
1. Why tests-first is blocked:
2. What setup or stabilization is added first:
3. What failing test will be added immediately after setup:
4. How the exception scope is limited:
```

예외는 좁게 제한. 완료 후 즉시 failing spec으로 복귀.

---

## 테스트 종류 선택

| 상황 | 선택 |
|------|------|
| 날짜/문자열/숫자 변환, 순수 함수 | 순수 단위 테스트 |
| 폼 제출, 상태 전환, 렌더 변화, 접근성 | RTL 컴포넌트/통합 테스트 |
| focus, selection, keyboard navigation, pointer | Vitest Browser Mode |
| 다중 route, 인증, 네트워크 경계, 전체 여정 | Playwright E2E |

- 가장 낮은 비용으로 핵심 위험을 덮는 테스트를 먼저 고른다.
- 처음부터 모든 레이어 테스트를 한 번에 쓰지 않는다.

---

## 아키텍처 경계와 테스트

- **React Router**: loader 결과에 의해 어떤 UI가 보이는지 검증. route params, search params, action 결과는 공개 입력.
- **TanStack Query**: 로딩/성공/에러 상태와 invalidation 결과 검증. query hook 전체를 mock하는 것보다 네트워크 경계 통제 우선.
- **React Hook Form**: `defaultValues`/`reset`이 기대한 초기 UI를 만드는지, 입력/blur/submit 시 검증 메시지와 payload가 올바른지 검증. 내부 registration 흐름 검증 금지.
- **Zustand**: 모달/토스트 열림 등 사용자 인지 결과로 검증. store 내부 action 조합 검증 금지.

---

## 쿼리 우선순위

1. `getByRole`
2. `getByLabelText`
3. `getByText`
4. `getByPlaceholderText`
5. `getByTestId` (마지막 수단)

비동기: `findBy*` 우선.

## Assertion 기준

권장: `toHaveTextContent`, `toBeDisabled`/`toBeEnabled`, `toHaveValue`, `toBeChecked`, `toHaveAccessibleName`, Playwright `toBeVisible`/`toHaveText`.
지양: 의미 없는 `toBeTruthy`, 구현 호출 수만 보는 assertion, 수동 즉시 판정.

---

## 완료 조건

4가지 모두 필요:
1. TDD Plan 존재
2. Failing Evidence 존재
3. Green Evidence 존재
4. 관련 테스트가 현재 공개 계약을 보호

---

## 기본 실행 명령

```bash
pnpm lint && pnpm typecheck
pnpm vitest src/path/to/test.tsx -t "test name"  # 좁은 범위 먼저
pnpm vitest --browser=chromium                     # Browser Mode
pnpm playwright test                               # E2E
```
