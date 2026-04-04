---
name: harness-fe-test-antipatterns
description: "테스트 안티패턴, 나쁜 테스트, 구현 세부사항 테스트, snapshot 남용, mocking 남용, flaky 테스트, getByTestId 남용, waitFor 남용, 테스트 품질 작업 시 활성화. 테스트 금지 패턴과 권장 대체를 제공."
user-invocable: true
---

# Frontend Test Anti-Patterns

테스트가 있더라도 **잘못된 자신감을 주는 선택**을 피한다.

---

## 1. TDD 절차 안티패턴

### 금지: 구현 먼저 → 테스트 맞추기

나쁜 예시:

```tsx
// 1) 먼저 구현을 바꾼다
export function LoginButton() {
  return <button className="primary">Continue</button>;
}

// 2) 나중에 이미 만들어진 구현을 설명하는 테스트를 붙인다
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

### 금지: 버그 수정에서 assertion 약화로 통과시키기

나쁜 예시: `expect(...).toBeTruthy()` — 의미 없는 검증.

권장 대체:

```tsx
it("저장 성공 후 성공 메시지를 보여준다", async () => {
  render(<ProfileForm />);
  await user.click(screen.getByRole("button", { name: /save/i }));
  expect(await screen.findByText(/saved successfully/i)).toBeInTheDocument();
});
```

---

## 2. 구현 세부사항 테스트

### 금지: DOM 구조/className을 계약으로 테스트

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

### 금지: internal state/private hook 호출 검증

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

---

## 3. 쿼리와 Assertion

### 금지: getByTestId를 기본 선택자로 사용

나쁜 예시:

```tsx
screen.getByTestId("email-input");
screen.getByTestId("submit-button");
```

권장 대체:

```tsx
screen.getByLabelText(/email/i);
screen.getByRole("button", { name: /sign up/i });
```

### 금지: 비동기 UI를 동기 assertion으로 판정

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

### 금지: waitFor 남용

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

### 금지: Playwright 수동 즉시 판정

나쁜 예시:

```ts
expect(await page.getByText("welcome").isVisible()).toBe(true);
```

권장 대체:

```ts
await expect(page.getByText("welcome")).toBeVisible();
```

---

## 4. Snapshot

### 금지: 전체 화면 snapshot 남발

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

예외: 출력이 매우 작고 안정적인 경우만 (markdown renderer HTML 조각 등).

---

## 5. Mocking

### 금지: 모든 의존성을 기본 mock

나쁜 예시:

```tsx
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: "123" }),
}));
vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: { name: "Ada" }, isLoading: false }),
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
expect(await screen.findByRole("heading", { name: /ada/i })).toBeInTheDocument();
```

### 금지: hook 내부를 통째로 mock

나쁜 예시:

```tsx
vi.mock("../model/useUserQuery", () => ({
  useUserQuery: () => ({
    data: { id: "1", name: "Ada" },
    isLoading: false,
  }),
}));
```

권장 대체 (MSW):

```tsx
server.use(
  http.get("/api/users/1", () => {
    return HttpResponse.json({ id: "1", name: "Ada" });
  })
);
render(<UserPage userId="1" />);
expect(await screen.findByRole("heading", { name: /ada/i })).toBeInTheDocument();
```

---

## 6. Browser/E2E 선택

- 브라우저 의미가 중요한 상호작용(focus, keyboard navigation)을 **jsdom-only로 끝내지 않는다** → Browser Mode 검토.
- 반대로 작은 컴포넌트까지 **전부 E2E로 해결하지 않는다** → 가장 싼 레이어에서 먼저 검증.

---

## 7. Flaky

### 금지: arbitrary sleep/timeout으로 통과시키기

나쁜 예시:

```tsx
await new Promise((resolve) => setTimeout(resolve, 1000));
expect(screen.getByText(/saved/i)).toBeInTheDocument();
```

권장 대체:

```tsx
expect(await screen.findByText(/saved/i)).toBeInTheDocument();
```

### 금지: 원인 모른 채 재시도 설정으로 덮기

비동기 상태 전환을 명시적으로 검증하고, 네트워크/시간/랜덤성 경계를 통제한다.

---

## 리뷰 경고 대상

- 구현 대량 변경 후 테스트가 마지막에만 추가됨
- `.only`, `.skip`, 과도한 `testId`, `container.querySelector`, `waitFor` 남용
- snapshot 급증
- `setTimeout`, `sleep`, arbitrary delay
- private helper/hook spy, hook 반환값 전체 mocking
- bugfix인데 회귀 테스트 없음
