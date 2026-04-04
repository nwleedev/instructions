---
name: harness-fe-zustand
description: "Zustand, store, slice, selector, useShallow, 글로벌 UI 상태, 전역 상태 관리, 모달, 토스트, 드로어 작업 시 활성화. Zustand 규칙과 안티패턴을 제공."
user-invocable: true
---

# Zustand Rules & Anti-Patterns

Zustand는 글로벌 UI/세션 상태에만 사용한다. 공식 문서를 우선 참조한다.

## 핵심 규칙

- Zustand는 글로벌 UI 상태(모달, 토스트, 드로어, 필터 UI, 세션 단위 preference)에만 사용한다.
- 서버 상태, 폼 상태, 페이지 로딩 데이터를 Zustand에 저장하지 않는다.
- store는 slice 구조로 나눈다.
- selector 기반 hook으로 필요한 값만 구독한다.
- store 전체를 통째로 구독하지 않는다.

---

## 안티패턴 1. 서버 상태를 Zustand에 복제 저장

서버 상태는 TanStack Query가 담당한다. Query와 Zustand에 같은 데이터를 동시에 저장하면 source of truth가 둘이 된다.

나쁜 예시:

```tsx
const { data } = useQuery(userQueries.me());

useEffect(() => {
  useUserStore.getState().setUser(data);
}, [data]);
```

권장 대체:

- 서버 데이터는 Query에서 직접 읽는다.
- 정말 UI 파생값만 store에 둔다.

---

## 안티패턴 2. 폼 상태를 Zustand에 저장

폼 상태는 React Hook Form이 담당한다. 입력값, 에러, dirty 상태를 store에 복제하면 동기화 버그가 생긴다.

---

## 안티패턴 3. store 전체를 통째로 구독

Zustand는 selector 기반 구독을 권장한다. 필요 이상 리렌더가 발생한다.

나쁜 예시:

```tsx
const store = useAppStore();
return <div>{store.user.name}</div>;
```

권장 대체:

```tsx
const userName = useAppStore((state) => state.user.name);
return <div>{userName}</div>;
```

---

## 안티패턴 4. 여러 값을 객체로 반환하면서 shallow 최적화 없이 사용

selector가 새 객체를 만들면 불필요한 리렌더가 생길 수 있다. 공식 문서는 `useShallow`를 안내한다.

나쁜 예시:

```tsx
const { bears, food } = useBearStore((state) => ({
  bears: state.bears,
  food: state.food,
}));
```

권장 대체:

```tsx
const { bears, food } = useBearStore(
  useShallow((state) => ({
    bears: state.bears,
    food: state.food,
  }))
);
```

---

## 안티패턴 5. store를 slice 없이 계속 확장

Zustand는 단일 store를 권장하지만, 큰 앱은 slice로 분리할 수 있다고 안내한다. 무한 확장 store는 책임이 섞이고 변경 추적이 어려워진다.
