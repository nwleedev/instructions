# `instructions/frontend/TEST_ANTI_PATTERNS.md`

## 목적

이 문서는 React 프론트엔드 테스트에서 Codex, Claude와 개발자가 반복해서 피해야 하는 **금지 패턴**을 정리한다.

원칙:

- 금지 패턴은 “테스트가 있더라도 잘못된 자신감을 주는 선택”을 의미한다.
- 각 항목은 왜 문제인지, 어떤 코드가 나쁜지, 무엇으로 대체해야 하는지를 함께 본다.
- 자동 검출 가능한 항목은 ESLint/CI로 함께 강제한다.
- 작업 순서와 증빙 형식은 `TESTING.md`가 우선한다.

---

## 1. TDD 절차 안티패턴

### 금지 1. 구현을 먼저 작성하고 테스트를 나중에 맞춰 붙이기

이유:

- 이 패턴은 테스트를 명세가 아니라 결과 보고서로 만든다.
- 실패 테스트가 먼저 없으면 구현이 정말 필요한 변경인지 증명하기 어렵다.
- Codex, Claude가 가장 자주 빠지는 패턴 중 하나이므로 기본적으로 금지한다.

위험 신호:

- 구현 파일만 먼저 크게 바뀌고 테스트는 마지막에 추가됨
- 테스트 설명이 요구사항이 아니라 이미 작성된 구현을 서술함
- 수정 전 실패 증거가 없음

나쁜 예시:

```tsx
// 1) 먼저 구현을 바꾼다.
export function LoginButton() {
  return <button className="primary">Continue</button>;
}

// 2) 나중에 이미 만들어진 구현을 설명하는 테스트를 붙인다.
it("renders a primary button with Continue text", () => {
  render(<LoginButton />);
  expect(screen.getByText("Continue")).toBeInTheDocument();
});
```

권장 대체:

```tsx
it("로그인 가능할 때 계속하기 버튼을 보여준다", () => {
  render(<LoginButton canContinue />);
  expect(screen.getByRole("button", { name: /continue/i })).toBeEnabled();
});
```

### 금지 2. 버그 수정에서 기존 테스트를 느슨하게 바꿔 통과시키기

이유:

- 버그 수정의 핵심은 기존 실패를 재현하는 회귀 테스트다.
- assertion을 약하게 만들어 green으로 만드는 방식은 결함을 숨긴다.

나쁜 예시:

```tsx
expect(screen.getByRole("button", { name: /save/i })).toBeTruthy();
```

권장 대체:

```tsx
it("저장 성공 후 성공 메시지를 보여준다", async () => {
  render(<ProfileForm />);
  await user.click(screen.getByRole("button", { name: /save/i }));

  expect(await screen.findByText(/saved successfully/i)).toBeInTheDocument();
});
```

### 금지 3. 예외를 선언해 놓고 구현 우선 모드로 오래 머무르기

이유:

- `TDD Exception`은 좁은 설정/안정화 범위를 위한 장치다.
- 예외를 선언한 뒤 구현을 장시간 진행하면 사실상 tests-first를 포기한 것과 같다.

나쁜 예시:

```text
TDD Exception
1. Why tests-first is blocked: test setup 부족
2. What setup or stabilization is added first: providers 정리
3. What failing test will be added immediately after setup: 나중에 작성
4. How the exception scope is limited: 필요 시 정리
```

권장 대체:

```text
TDD Exception
1. Why tests-first is blocked: Browser provider 설정이 없어 컴포넌트 interaction 테스트를 실행할 수 없음
2. What setup or stabilization is added first: vitest browser provider 및 test setup 파일 추가
3. What failing test will be added immediately after setup: src/features/menu/ui/MenuButton.browser.test.tsx - "키보드로 메뉴를 열고 첫 항목에 focus를 준다"
4. How the exception scope is limited: browser test provider 설정 파일 2개만 수정, 구현 파일 수정 금지
```

---

## 2. 구현 세부사항 테스트 안티패턴

### 금지 1. DOM 구조와 className을 주된 계약으로 테스트하기

이유:

- DOM 중첩 구조, 래퍼 div, CSS class는 리팩터링에 취약하다.
- 사용자가 실제로 인지하는 것은 역할, 이름, 상태, 결과다.

나쁜 예시:

```tsx
const { container } = render(<ProfilePage />);

expect(container.firstChild).toHaveClass("page-shell");
expect(container.querySelector(".submit-row > button")).not.toBeNull();
```

권장 대체:

```tsx
render(<ProfilePage />);

expect(screen.getByRole("button", { name: /save/i })).toBeEnabled();
```

### 금지 2. internal state, private hook, private helper 호출 여부를 검증하기

이유:

- 내부 구현은 공개 계약이 아니다.
- 내부 구조가 바뀌면 동작이 동일해도 테스트가 깨진다.

나쁜 예시:

```tsx
const setState = vi.fn();
vi.spyOn(React, "useState").mockReturnValue(["", setState]);

render(<SearchBox />);
await user.type(screen.getByRole("textbox", { name: /search/i }), "ada");

expect(setState).toHaveBeenCalledTimes(3);
```

권장 대체:

```tsx
render(<SearchBox />);
await user.type(screen.getByRole("textbox", { name: /search/i }), "ada");

expect(screen.getByDisplayValue("ada")).toBeInTheDocument();
expect(screen.getByRole("button", { name: /search/i })).toBeEnabled();
```

### 금지 3. 같은 파일 내부 함수를 mock해서 테스트하기

이유:

- 같은 파일 내부 메서드 호출 mocking은 구조적으로 취약하다.
- 함수 분리나 파일 이동 같은 리팩터링을 방해한다.

나쁜 예시:

```tsx
// user-service.ts
export async function saveUser(input: UserInput) {
  const payload = normalize(input);
  return api.post("/users", payload);
}

function normalize(input: UserInput) {
  return { ...input, email: input.email.trim().toLowerCase() };
}

// user-service.test.ts
import * as service from "./user-service";

it("normalize를 호출한다", async () => {
  const spy = vi.spyOn(service as any, "normalize");
  await service.saveUser({ email: " ADA@EXAMPLE.COM " });
  expect(spy).toHaveBeenCalled();
});
```

권장 대체:

```tsx
it("정규화된 payload로 저장한다", async () => {
  const post = vi.fn().mockResolvedValue({ ok: true });
  vi.mocked(api.post).mockImplementation(post);

  await saveUser({ email: " ADA@EXAMPLE.COM " });

  expect(post).toHaveBeenCalledWith("/users", {
    email: "ada@example.com",
  });
});
```

---

## 3. 쿼리와 assertion 안티패턴

### 금지 1. `getByTestId`를 기본 선택자로 사용하기

이유:

- Testing Library는 role/label/text 중심 쿼리를 우선 권장한다.
- `data-testid` 중심 테스트는 접근성 표면과 사용자 시나리오를 놓치기 쉽다.

나쁜 예시:

```tsx
render(<SignUpForm />);

screen.getByTestId("email-input");
screen.getByTestId("submit-button");
```

권장 대체:

```tsx
render(<SignUpForm />);

screen.getByLabelText(/email/i);
screen.getByRole("button", { name: /sign up/i });
```

Testing Library는 `getByRole`을 최우선 선호 쿼리로 제시한다. citeturn414123search1

### 금지 2. 비동기 UI를 동기 assertion으로 성급하게 단정하기

이유:

- 로딩 후 렌더, transition, 네트워크 응답은 시간이 걸린다.
- 즉시 assertion을 쓰면 flaky test가 되기 쉽다.

나쁜 예시:

```tsx
render(<UserPage />);
expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
```

권장 대체:

```tsx
render(<UserPage />);
expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
```

### 금지 3. 의미 없는 truthy/falsy assertion으로 테스트를 끝내기

이유:

- `toBeTruthy`, `toBeDefined`, 존재만 보는 assertion은 의도를 흐리기 쉽다.
- 무엇이 사용자에게 중요한지 드러나지 않는다.

나쁜 예시:

```tsx
expect(screen.getByRole("alert")).toBeTruthy();
```

권장 대체:

```tsx
expect(screen.getByRole("alert")).toHaveTextContent(/email is required/i);
```

### 금지 4. `waitFor`를 만능 해결책처럼 남용하기

이유:

- `waitFor`는 실패 원인을 흐리고 느린 테스트를 만들기 쉽다.
- 먼저 `findBy*`나 명시적 상태 전환 검증이 가능한지 확인해야 한다.

나쁜 예시:

```tsx
await waitFor(() => {
  expect(screen.getByText(/saved/i)).toBeInTheDocument();
});
```

권장 대체:

```tsx
expect(await screen.findByText(/saved/i)).toBeInTheDocument();
```

### 금지 5. Playwright에서 수동 즉시 판정 assertion을 사용하기

이유:

- `isVisible()` 같은 수동 체크는 기다리지 않고 즉시 판정한다.
- Playwright는 web-first assertions를 권장한다.

나쁜 예시:

```ts
expect(await page.getByText("welcome").isVisible()).toBe(true);
```

권장 대체:

```ts
await expect(page.getByText("welcome")).toBeVisible();
```

Playwright는 web-first assertions를 권장하고 수동 assertion을 피하라고 안내한다. citeturn414123search3

---

## 4. Snapshot 안티패턴

### 금지 1. 전체 화면 snapshot을 기본 회귀 수단으로 남발하기

이유:

- 큰 snapshot은 의미 없는 변화에도 자주 깨진다.
- 리뷰어가 변경 의미를 읽기 어려워 snapshot 업데이트가 습관화된다.
- 구현 세부사항에 과도하게 결합되기 쉽다.

나쁜 예시:

```tsx
it("matches snapshot", () => {
  const { container } = render(<CheckoutPage />);
  expect(container).toMatchSnapshot();
});
```

권장 대체:

```tsx
it("결제 가능할 때 주문 버튼을 활성화한다", () => {
  render(<CheckoutPage />);
  expect(screen.getByRole("button", { name: /place order/i })).toBeEnabled();
});
```

예외:

- 출력이 매우 작고 안정적이며 의미가 명확한 경우에만 제한적으로 허용한다.
- 컴포넌트 전체 snapshot보다 작은 출력 단위를 우선한다.
- 예: markdown renderer의 짧은 HTML 조각, 토큰화된 포맷 출력

---

## 5. Mocking 안티패턴

### 금지 1. 모든 의존성을 기본적으로 mock하기

이유:

- 테스트가 현실과 너무 멀어지면 통합 리스크를 놓친다.
- 공개 계약보다 구현 호출 수만 검증하게 되기 쉽다.

나쁜 예시:

```tsx
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: "123" }),
}));
vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: { name: "Ada" }, isLoading: false }),
}));
vi.mock("react-hook-form", () => ({
  useForm: () => ({ register: vi.fn(), handleSubmit: vi.fn() }),
}));
```

권장 대체:

```tsx
render(
  <TestProviders>
    <Route path="/users/:id" initialEntry="/users/123">
      <UserPage />
    </Route>
  </TestProviders>
);

expect(
  await screen.findByRole("heading", { name: /ada/i })
).toBeInTheDocument();
```

### 금지 2. hook 내부를 통째로 mock해서 실제 공개 계약을 지워버리기

이유:

- hook 반환값 전체를 통째로 고정하면 UI 계약보다 내부 shape에 결합된다.
- 로딩/에러/성공 상태 전환을 놓치기 쉽다.

나쁜 예시:

```tsx
vi.mock("../model/useUserQuery", () => ({
  useUserQuery: () => ({
    data: { id: "1", name: "Ada" },
    isLoading: false,
    isError: false,
  }),
}));
```

권장 대체:

```tsx
server.use(
  http.get("/api/users/1", () => {
    return HttpResponse.json({ id: "1", name: "Ada" });
  })
);

render(<UserPage userId="1" />);
expect(
  await screen.findByRole("heading", { name: /ada/i })
).toBeInTheDocument();
```

### 금지 3. API 경계 대신 private helper를 mock하기

이유:

- 외부 시스템을 고립하는 목적이 아니라 내부 구조를 고정하는 mock이 된다.
- 리팩터링을 방해한다.

권장 방향:

- 네트워크/API client 경계 mock
- router/provider boundary 제어
- 시간/랜덤성 같은 외부 입력 제어

---

## 6. Browser Mode / E2E 선택 안티패턴

### 금지 1. 브라우저 의미가 중요한 상호작용을 jsdom-only 테스트로 끝내기

이유:

- focus, selection, pointer, keyboard navigation은 브라우저 의미가 중요하다.
- jsdom만으로는 실제 문제를 놓칠 수 있다.

나쁜 예시:

```tsx
it("ArrowDown으로 첫 메뉴 항목에 focus를 준다", async () => {
  render(<Menu />);
  await user.keyboard("{ArrowDown}");
  expect(screen.getByRole("menuitem", { name: /profile/i })).toHaveFocus();
});
```

권장 대체:

- 이 상호작용이 단일 컴포넌트 범위면 Browser Mode를 우선 검토한다.
- route, auth, backend가 함께 얽히면 Playwright E2E를 검토한다.

Vitest Browser Mode는 브라우저에서 테스트를 직접 실행하며 provider와 instance 설정이 필요하다. citeturn414123search0turn414123search4

### 금지 2. 반대로, 작은 컴포넌트 상호작용까지 전부 E2E로만 해결하기

이유:

- 작은 failing spec까지 모두 E2E에 올리면 느리고 불안정해진다.
- 핵심 문제를 가장 싼 레이어에서 빠르게 검증할 기회를 잃는다.

권장 방향:

- 컴포넌트 수준 문제는 unit/RTL/Browser Mode에서 우선 해결한다.
- 전체 여정 검증이 필요한 경우에만 Playwright E2E로 올린다.

---

## 7. Flaky 우회 안티패턴

### 금지 1. arbitrary sleep, timeout 증가, retry 남발로 통과시키기

이유:

- 원인을 해결하지 않고 운에 기대게 만든다.
- CI에서 재현성이 급격히 나빠진다.

나쁜 예시:

```tsx
await new Promise((resolve) => setTimeout(resolve, 1000));
expect(screen.getByText(/saved/i)).toBeInTheDocument();
```

권장 대체:

```tsx
expect(await screen.findByText(/saved/i)).toBeInTheDocument();
```

Playwright에서는 수동 대기보다 web-first assertions를, RTL에서는 의미 있는 비동기 질의를 우선 검토한다. citeturn414123search1turn414123search3

### 금지 2. 실패 원인을 모른 채 재시도 설정으로 덮기

이유:

- 테스트가 왜 불안정한지 학습하지 못한다.
- 재시도는 증상을 늦출 뿐 근본 원인을 숨긴다.

권장 방향:

- 비동기 상태 전환을 더 명시적으로 검증한다.
- 네트워크/시간/랜덤성 경계를 통제한다.
- Browser Mode 또는 E2E 레이어 선택이 맞는지 다시 판단한다.

---

## 8. 리뷰와 자동 검출 힌트

다음은 자동 검출 또는 리뷰 경고 대상으로 본다.

- 구현 파일 대량 변경 후 테스트가 마지막에만 추가됨
- `.only`, `.skip`, 과도한 `testId`, `container.querySelector`, `waitFor` 남용
- snapshot 급증
- `setTimeout`, `sleep`, arbitrary delay 추가
- private helper/hook spy
- hook 반환값 전체 mocking
- bugfix인데 회귀 테스트 변경이 없음

ESLint와 CI는 일부 패턴만 강제할 수 있다. “정말 먼저 실패했는가”의 최종 증빙은 `TESTING.md`의 `TDD Plan`, `Failing Evidence`, `Green Evidence`, `TDD Exception`이 맡는다.
