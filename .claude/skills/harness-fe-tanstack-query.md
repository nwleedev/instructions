---
name: harness-fe-tanstack-query
description: "TanStack Query, useQuery, useMutation, queryKey, queryFn, invalidateQueries, 서버 상태 관리, API 데이터 fetch, 캐시 무효화, ensureQueryData, fetchQuery 작업 시 활성화. 서버 상태 관리 규칙과 안티패턴을 제공."
user-invocable: true
---

# TanStack Query Rules & Anti-Patterns

서버 상태는 TanStack Query가 관리한다. 공식 문서를 우선 참조한다.

## 핵심 규칙

- 서버 데이터 fetch를 useEffect로 구현하지 않는다.
- query key는 배열 기반으로 정의한다.
- queryFn에서 사용하는 식별자는 query key에 포함한다.
- QueryClient는 앱 수명 동안 안정적으로 1회 생성한다.
- query hook이 반환한 객체 전체를 dependency array에 넣지 않는다.
- mutation 이후에는 임의의 local state patch보다 invalidate/revalidate를 우선 검토한다.
- 폼 기본값 구성에 API 데이터가 필요할 때는 먼저 React Router loader/clientLoader에서 확보할 수 있는지 검토한다.
- Query 캐시 재사용이 필요하면 `queryClient.ensureQueryData`를 우선 검토하고, 항상 명시적 fetch가 필요한 경우에만 `fetchQuery`를 사용한다.

---

## 안티패턴 1. useEffect 안에서 서버 데이터를 fetch하고 local state로 저장

서버 상태는 TanStack Query가 관리해야 한다. Effect fetch는 loading/error/cache/staleness/invalidation을 직접 관리하게 만든다.

나쁜 예시:

```tsx
function UserList() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setUsers(data);
      });
    return () => { cancelled = true; };
  }, []);

  return <UserTable users={users} />;
}
```

권장 대체:

```tsx
function UserList() {
  const { data = [] } = useQuery(userQueries.list());
  return <UserTable users={data} />;
}
```

---

## 안티패턴 2. query key 없이 query function 인자만 바꿔 사용

query key는 캐시 식별자다. queryFn이 의존하는 식별자는 query key에 포함되어야 한다.

나쁜 예시:

```tsx
useQuery({
  queryKey: ["user"],
  queryFn: () => getUser(userId),
});
```

권장 대체:

```tsx
useQuery({
  queryKey: ["user", userId],
  queryFn: () => getUser(userId),
});
```

---

## 안티패턴 3. mutation 성공 후 local state를 임의로 patch

Query 캐시와 화면 상태가 분리되어 stale bug가 생기기 쉽다.

나쁜 예시:

```tsx
const [items, setItems] = useState<Item[]>([]);

const mutation = useMutation({
  mutationFn: createItem,
  onSuccess: (created) => {
    setItems((prev) => [...prev, created]);
  },
});
```

권장 대체:

```tsx
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: createItem,
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ["items"] });
  },
});
```

---

## 안티패턴 4. query hook 반환 객체 전체를 dependency array에 넣기

TanStack Query 공식 ESLint 규칙이 금지한다. 필요한 값만 구조 분해해서 의존해야 한다.

나쁜 예시:

```tsx
const query = useQuery(userQueries.detail(userId));

const onOpen = useCallback(() => {
  if (query.data) openUser(query.data);
}, [query]);
```

권장 대체:

```tsx
const { data } = useQuery(userQueries.detail(userId));

const onOpen = useCallback(() => {
  if (data) openUser(data);
}, [data]);
```

---

## 안티패턴 5. 서버 상태를 Zustand에 복제 저장

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
