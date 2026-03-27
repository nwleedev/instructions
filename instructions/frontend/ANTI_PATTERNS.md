# Frontend Anti-Patterns

이 문서는 React 기반 프론트엔드에서 Codex, Claude와 개발자가 반복해서 피해야 하는 금지 패턴을 정리한다.

원칙:

- 금지 패턴은 “작동하더라도 구조를 악화시키는 선택”을 의미한다.
- 각 금지 패턴은 이유와 대체 패턴까지 함께 본다.
- 이 문서는 설명 문서이며, 자동 검출 가능한 항목은 ESLint/CI로도 강제한다.

---

## 1. TanStack Query 안티 패턴

### 금지 1. `useEffect` 안에서 서버 데이터를 fetch하고 local state로 저장

이유:

- 서버 상태는 TanStack Query가 관리해야 한다.
- Effect fetch는 loading/error/cache/staleness/invalidation을 직접 관리하게 만든다.
- React는 데이터 변환과 이벤트 처리를 위해 Effect를 쓰지 말라고 설명한다.
- TanStack Query는 캐시, refetch, stale/fresh, invalidation을 기본 제공한다.

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

    return () => {
      cancelled = true;
    };
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

### 금지 2. query key 없이 query function 인자만 바꿔 사용

이유:

- query key는 캐시 식별자다.
- queryFn이 의존하는 식별자는 query key에 포함되어야 한다.

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

### 금지 3. mutation 성공 후 local state를 임의로 patch해서 화면 동기화

이유:

- Query 캐시와 화면 상태가 분리되어 stale bug가 생기기 쉽다.
- mutation 이후에는 invalidate/revalidate 또는 명시적 cache update를 우선 검토한다.

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

### 금지 4. query hook 반환 객체 전체를 dependency array에 넣기

이유:

- TanStack Query 공식 ESLint 규칙이 금지한다.
- 필요한 값만 구조 분해해서 의존해야 한다.

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

## 2. React Hook Form 안티 패턴

### 금지 1. API 응답을 `useEffect + setValue`로 여러 번 분산 주입

이유:

- RHF는 `defaultValues`를 단일 기준값으로 사용한다.
- 기본값은 `useForm({ defaultValues })`, 비동기 `defaultValues`, 또는 명시적 `reset` 진입점으로 넣는다.
- effect에서 필드별로 주입하면 dirty/touched 기준이 흐려진다.

나쁜 예시:

```tsx
const form = useForm<UserForm>();

useEffect(() => {
  if (!user) return;
  form.setValue("name", user.name);
  form.setValue("email", user.email);
  form.setValue("role", user.role);
}, [form, user]);
```

권장 대체:

```tsx
const form = useForm<UserForm>({
  defaultValues: {
    name: user.name,
    email: user.email,
    role: user.role,
  },
});
```

### 금지 2. `defaultValue`와 `defaultValues`를 제각각 섞어 사용

이유:

- RHF는 `defaultValues`를 전체 폼의 단일 기준으로 권장한다.
- 필드별 `defaultValue` 남발은 초기값 출처를 분산시킨다.

나쁜 예시:

```tsx
const form = useForm<UserForm>();

<input defaultValue={user.name} {...form.register("name")} />
<input defaultValue={user.email} {...form.register("email")} />
```

권장 대체:

```tsx
const form = useForm<UserForm>({
  defaultValues: {
    name: user.name,
    email: user.email,
  },
});
```

### 금지 3. 단순 네이티브 입력도 전부 `Controller/useController`로 감싸기

이유:

- RHF는 기본적으로 uncontrolled input과 잘 맞는다.
- 단순 input까지 모두 controlled 패턴으로 만들면 코드량과 복잡성이 증가한다.

나쁜 예시:

```tsx
const { field } = useController({ name: "firstName", control });

<input value={field.value} onChange={field.onChange} />;
```

권장 대체:

```tsx
<input {...register("firstName")} />
```

### 금지 4. root에서 `watch()`로 전체 폼 값을 광범위하게 구독

이유:

- 필요한 값만 `useWatch`로 구독하는 편이 리렌더 범위 관리에 유리하다.
- 폼 전체 구독은 대형 폼에서 추적과 성능을 악화시킨다.

나쁜 예시:

```tsx
const values = watch();

return <Preview values={values} />;
```

권장 대체:

```tsx
const selectedRole = useWatch({
  control,
  name: "role",
});

return <RolePreview role={selectedRole} />;
```

### 금지 5. 동적 배열 필드를 일반 state 배열로 따로 관리

이유:

- RHF는 동적 배열 필드용 `useFieldArray`를 제공한다.
- 별도 state 배열과 RHF 값을 이중 관리하면 동기화 버그가 생긴다.

나쁜 예시:

```tsx
const [emails, setEmails] = useState([""]);

return emails.map((value, index) => (
  <input
    key={index}
    value={value}
    onChange={(e) => {
      const next = [...emails];
      next[index] = e.target.value;
      setEmails(next);
    }}
  />
));
```

권장 대체:

```tsx
const { fields, append, remove } = useFieldArray({
  control,
  name: "emails",
});
```

---

## 3. React Router 안티 패턴

### 금지 1. 페이지 진입 데이터를 컴포넌트 mount 후 `useEffect`로 로드

이유:

- 페이지 진입 데이터는 loader/clientLoader가 우선이다.
- Router는 데이터 로딩, action, revalidation을 제공한다.
- page component에서 fetch lifecycle을 직접 관리할 이유를 줄여야 한다.

나쁜 예시:

```tsx
function ProjectPage() {
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    void api.getProject().then(setProject);
  }, []);

  return <ProjectView project={project} />;
}
```

권장 대체:

```tsx
export async function loader() {
  return { project: await api.getProject() };
}

export default function ProjectPage({ loaderData }: Route.ComponentProps) {
  return <ProjectView project={loaderData.project} />;
}
```

### 금지 2. URL state를 React state에 복제하고 다시 동기화

이유:

- React Router는 URL search params를 상태의 자연스러운 저장소로 설명한다.
- URL과 local state를 이중 관리하면 동기화 버그가 생긴다.

나쁜 예시:

```tsx
const [view, setView] = useState("list");
const navigate = useNavigate();

useEffect(() => {
  navigate(`?view=${view}`);
}, [navigate, view]);
```

권장 대체:

```tsx
const [searchParams, setSearchParams] = useSearchParams();
const view = searchParams.get("view") ?? "list";

function setView(next: "list" | "details") {
  setSearchParams((prev) => {
    prev.set("view", next);
    return prev;
  });
}
```

### 금지 3. pending/submission/navigation 상태를 별도 local state로 중복 관리

이유:

- Router는 `useNavigation`, `useFetcher`, loaderData, actionData를 제공한다.
- 네트워크 관련 상태를 별도 React state로 들고 있으면 중복이다.

나쁜 예시:

```tsx
const [isSubmitting, setIsSubmitting] = useState(false);

async function onSubmit(formData: FormData) {
  setIsSubmitting(true);
  await save(formData);
  setIsSubmitting(false);
}
```

권장 대체:

```tsx
const navigation = useNavigation();
const isSubmitting = navigation.state === "submitting";
```

---

## 4. React Props 안티 패턴

### 금지 1. 4개 이상 제어 props를 여러 계층에 걸쳐 연속 전달

이유:

- 숫자 자체가 문제는 아니지만, 여러 계층을 관통하는 다수의 제어 props는 설계 붕괴 신호다.
- props drilling은 loader data, context, RHF context, selector, slice public API를 먼저 검토해야 한다.

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

권장 대체:

- route loader data
- `FormProvider/useFormContext`
- Zustand selector
- feature/entity public API
- leaf UI로 props 범위 축소

### 금지 2. 상위 컴포넌트가 모든 상태와 모든 이벤트를 쥐고 하위에 orchestration props를 대량 주입

이유:

- 하위 컴포넌트가 사실상 “원격 조종 UI”가 된다.
- feature 책임이 page에 과도하게 집중된다.

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

권장 대체:

- 폼이면 RHF 내부로 수렴
- feature면 feature public API로 응집
- page는 orchestration 최소화

### 금지 3. leaf UI가 아닌 컴포넌트에서 “미래 확장” 명목으로 props를 미리 늘리기

이유:

- 아직 필요하지 않은 props 확장은 Codex, Claude가 반복해서 남용하기 쉬운 패턴이다.
- public API가 아닌 내부 구현 컴포넌트는 현재 책임에 맞는 최소 props만 가진다.

---

## 5. React useEffect 안티 패턴

### 금지 1. props/state로부터 파생 가능한 값을 Effect에서 다시 state로 저장

이유:

- 렌더 중 계산 가능한 값은 렌더에서 계산한다.
- Effect + state 동기화는 추가 렌더와 추적 비용을 만든다.

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

### 금지 2. 사용자 이벤트를 Effect로 처리

이유:

- React는 이벤트 처리 로직은 이벤트 핸들러에 두라고 설명한다.
- Effect 시점에는 어떤 이벤트가 일어났는지 맥락이 흐려진다.

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

### 금지 3. Effect 안에서 즉시 state를 갱신하는 무한 루프 패턴

나쁜 예시:

```tsx
useEffect(() => {
  setCount(count + 1);
});
```

권장 대체:

- 구조를 재설계한다.
- 렌더 계산, 이벤트 핸들러, loader/query, memo를 우선 검토한다.

### 금지 4. “한 번만 실행”을 위해 ref로 Effect를 막기

이유:

- React는 ref로 Effect 재실행을 막는 것을 pitfall로 설명한다.
- Strict Mode 재마운트 상황에서 cleanup 없는 effect bug를 숨긴다.

나쁜 예시:

```tsx
const ranRef = useRef(false);

useEffect(() => {
  if (ranRef.current) return;
  ranRef.current = true;
  connect();
}, []);
```

권장 대체:

- cleanup을 올바르게 구현한다.
- 정말 앱 초기화라면 component effect가 아니라 별도 앱 bootstrap 경로를 검토한다.

---

## 6. React useRef 안티 패턴

### 금지 1. 렌더에 필요한 값을 ref에 저장하고 UI가 ref 변경에 의존

이유:

- ref 변경은 리렌더를 일으키지 않는다.
- 화면에 반영되어야 하는 값은 state여야 한다.

나쁜 예시:

```tsx
const countRef = useRef(0);

function increment() {
  countRef.current += 1;
}

return <div>{countRef.current}</div>;
```

권장 대체:

```tsx
const [count, setCount] = useState(0);
```

### 금지 2. 렌더 중 `ref.current` 읽기/쓰기

이유:

- React는 렌더 중 ref read/write를 예측 불가능한 동작으로 설명한다.
- React hooks lint의 `refs` 규칙도 이를 검증한다.

나쁜 예시:

```tsx
const inputRef = useRef<HTMLInputElement | null>(null);

if (inputRef.current) {
  inputRef.current.focus();
}
```

권장 대체:

- 이벤트 핸들러
- commit 이후 effect
- callback ref
- DOM 전용 imperative 처리

### 금지 3. DOM 제어 없이 일반 상태 대체재로 ref를 남용

이유:

- ref는 DOM node, timeout ID, 외부 핸들, 렌더와 무관한 값 저장에 적합하다.
- business/UI state를 ref에 넣으면 추적이 어려워진다.

---

## 7. TypeScript 타입 안티 패턴

### 금지 1. 내부 도메인 모델에 `any` 전파

이유:

- `any`는 타입 검사를 사실상 꺼 버린다.
- 외부 경계에서는 `unknown` 후 좁히기를 우선 검토한다.

나쁜 예시:

```ts
type User = any;

function getUser(): any {
  return api.get("/user");
}
```

권장 대체:

```ts
type User = {
  id: string;
  name: string;
};

function parseUser(input: unknown): User {
  const data = input as { id: string; name: string };
  return { id: data.id, name: data.name };
}
```

### 금지 2. `as` 단언을 연쇄적으로 사용해 타입 오류를 억지로 통과

이유:

- `as Foo as Bar`는 타입 시스템을 우회하는 냄새가 강하다.
- 검증 함수, 파서, 타입 가드로 해결한다.

나쁜 예시:

```ts
const user = response as unknown as User;
```

### 금지 3. optional property를 `undefined`와 혼동

이유:

- `exactOptionalPropertyTypes`는 “속성이 없음”과 “속성이 undefined임”을 구분한다.
- 이 구분을 무시하면 객체 의미가 흐려진다.

나쁜 예시:

```ts
type Filters = {
  keyword?: string;
};

const filters: Filters = {
  keyword: undefined,
};
```

권장 대체:

- 속성이 없음을 표현하려면 키 자체를 생략한다.
- 진짜 `undefined`를 허용하려면 타입에 명시한다.

### 금지 4. index signature 접근을 항상 존재하는 값처럼 취급

이유:

- `noUncheckedIndexedAccess`는 미선언 키에 `undefined` 가능성을 더한다.
- 동적 키 접근은 존재성 체크가 필요하다.

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

---

## 8. Zustand 안티 패턴

### 금지 1. 서버 상태를 Zustand에 복제 저장

이유:

- 서버 상태는 TanStack Query가 담당해야 한다.
- Query와 Zustand에 같은 데이터를 동시에 저장하면 source of truth가 둘이 된다.

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

### 금지 2. 폼 상태를 Zustand에 저장

이유:

- 폼 상태는 RHF가 담당해야 한다.
- 입력값, 에러, dirty 상태를 store에 복제하면 동기화 버그가 생긴다.

### 금지 3. store 전체를 통째로 구독

이유:

- Zustand는 selector 기반 구독을 권장한다.
- 필요 이상 리렌더가 발생한다.

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

### 금지 4. 여러 값을 객체로 반환하면서 shallow 최적화 없이 사용

이유:

- selector가 새 객체를 만들면 불필요한 리렌더가 생길 수 있다.
- 공식 문서는 `useShallow`를 안내한다.

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

### 금지 5. store를 slice 없이 계속 확장

이유:

- Zustand는 단일 store를 권장하지만, 큰 앱은 slice로 분리할 수 있다고 안내한다.
- 무한 확장 store는 책임이 섞이고 변경 추적이 어려워진다.

---

## 9. 금지 패턴 운영 규칙

- 새 기능 구현 전 이 문서를 먼저 읽는다.
- 새 코드가 아래 조건 중 하나에 해당하면 PR에서 설명 없이 병합하지 않는다.
  - 새로운 `useEffect`
  - 새로운 전역 store 필드
  - feature/page/entity 경계를 넘는 props 확장
  - loader/action 없이 page 진입 fetch 추가
  - RHF 기본값을 effect로 분산 주입
- 자동 검출 가능한 항목은 ESLint/CI에 옮긴다.
- 반복된 실패 사례는 이 문서에 새 금지 패턴으로 추가한다.
