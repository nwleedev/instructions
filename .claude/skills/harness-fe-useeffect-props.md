---
name: harness-fe-useeffect-props
description: "useEffect, props, prop drilling, useState, useMemo, useRef, useCallback, React 패턴, TypeScript 타입, any, as 단언, 파생 값, 이벤트 핸들러, 컴포넌트 설계 작업 시 활성화. useEffect/Props/TypeScript 규칙과 안티패턴을 제공."
user-invocable: true
---

# useEffect, Props & TypeScript Rules & Anti-Patterns

## useEffect 규칙

useEffect는 **외부 시스템 동기화에만** 사용한다.

### 허용

- 브라우저 API 구독 및 해제
- 타이머 등록 및 해제
- DOM imperative 제어
- 외부 위젯 또는 서드파티 라이브러리 연결
- visibility/focus/resize 같은 외부 이벤트 구독

### 금지

- props/state에서 파생 가능한 값을 state로 다시 저장
- 최초 데이터 fetch
- mutation 성공 후 화면 상태를 맞추기 위한 동기화
- 폼 초기값 주입
- URL/search params를 일반 state에 복제
- 단순 이벤트 처리 로직

예외적인 useEffect를 추가할 때는 바로 위에 이유를 주석으로 남긴다.

---

### 안티패턴: props/state 파생값을 Effect에서 state로 저장

렌더 중 계산 가능한 값은 렌더에서 계산한다. Effect + state 동기화는 추가 렌더와 추적 비용을 만든다.

나쁜 예시:

```tsx
const [visibleItems, setVisibleItems] = useState<Item[]>([]);

useEffect(() => {
  setVisibleItems(items.filter((item) => item.active));
}, [items]);
```

권장 대체:

```tsx
const visibleItems = items.filter((item) => item.active);
```

---

### 안티패턴: 사용자 이벤트를 Effect로 처리

React는 이벤트 처리 로직은 이벤트 핸들러에 두라고 설명한다.

나쁜 예시:

```tsx
useEffect(() => {
  if (shouldBuy) {
    void buyProduct();
    toast.success("purchased");
  }
}, [shouldBuy]);
```

권장 대체:

```tsx
async function handleBuy() {
  await buyProduct();
  toast.success("purchased");
}
```

---

### 안티패턴: "한 번만 실행"을 위해 ref로 Effect를 막기

React는 ref로 Effect 재실행을 막는 것을 pitfall로 설명한다. Strict Mode 재마운트 상황에서 cleanup 없는 effect bug를 숨긴다.

나쁜 예시:

```tsx
const ranRef = useRef(false);

useEffect(() => {
  if (ranRef.current) return;
  ranRef.current = true;
  connect();
}, []);
```

권장 대체: cleanup을 올바르게 구현하거나, 앱 초기화라면 별도 bootstrap 경로를 검토.

---

## Props 규칙

- props는 leaf UI 컴포넌트의 표현 목적에 한해 최소한으로 사용한다.
- **2단계 이상 prop drilling 금지.**
- 페이지→위젯→기능→엔티티 관통 제어 props 금지.
- 대안: React Router loader data, TanStack Query 재사용, RHF context, Zustand selector, FSD slice public API.

### 안티패턴: 4개 이상 제어 props를 여러 계층에 걸쳐 연속 전달

나쁜 예시:

```tsx
<Page
  user={user}
  project={project}
  selectedTab={selectedTab}
  onSelectTab={setSelectedTab}
  filters={filters}
  onChangeFilters={setFilters}
/>
```

그리고 이 props가 `Page -> Widget -> Feature -> Entity`로 계속 전달되는 구조.

권장 대체: route loader data, `FormProvider/useFormContext`, Zustand selector, feature/entity public API, leaf UI로 props 범위 축소.

### 안티패턴: 상위가 모든 상태와 이벤트를 쥐고 하위에 대량 주입

나쁜 예시:

```tsx
<UserEditor
  values={values}
  errors={errors}
  isDirty={isDirty}
  isSaving={isSaving}
  onChangeName={onChangeName}
  onChangeEmail={onChangeEmail}
  onSubmit={onSubmit}
  onReset={onReset}
/>
```

권장 대체: 폼이면 RHF 내부로 수렴, feature면 feature public API로 응집, page는 orchestration 최소화.

---

## useRef 규칙

- 렌더에 필요한 값을 ref에 저장하지 않는다 (ref 변경은 리렌더를 일으키지 않음).
- 렌더 중 `ref.current` 읽기/쓰기 금지. 이벤트 핸들러, effect, callback ref에서만 사용.
- DOM 제어 없이 일반 상태 대체재로 ref를 남용하지 않는다.

---

## TypeScript 규칙

### 안티패턴: 내부 도메인 모델에 any 전파

외부 경계에서는 `unknown` 후 좁히기를 우선 검토한다.

나쁜 예시:

```ts
type User = any;
function getUser(): any { return api.get("/user"); }
```

권장 대체:

```ts
type User = { id: string; name: string; };

function parseUser(input: unknown): User {
  const data = input as { id: string; name: string };
  return { id: data.id, name: data.name };
}
```

### 안티패턴: as 단언 연쇄로 타입 오류 억지 통과

검증 함수, 파서, 타입 가드로 해결한다.

### 안티패턴: index signature 접근을 항상 존재하는 값처럼 취급

나쁜 예시:

```ts
const label = map[key].toUpperCase();
```

권장 대체:

```ts
const label = map[key];
if (!label) return "unknown";
return label.toUpperCase();
```
