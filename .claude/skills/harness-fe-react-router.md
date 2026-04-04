---
name: harness-fe-react-router
description: "React Router, loader, clientLoader, action, clientAction, useNavigation, useFetcher, useSearchParams, useParams, route, 페이지 진입 데이터, URL 상태 관리 작업 시 활성화. React Router 규칙과 안티패턴을 제공."
user-invocable: true
---

# React Router Rules & Anti-Patterns

페이지 진입 데이터는 loader/clientLoader를 우선 사용한다. 공식 문서를 우선 참조한다.

## 핵심 규칙

- 페이지 로딩 데이터는 loader/clientLoader를 먼저 검토한다.
- 페이지 컴포넌트는 라우팅 조합과 화면 배치에 집중하고, 비즈니스 로직은 features/entities로 내린다.
- 사용자 변경 작업은 action/clientAction 또는 TanStack Query mutation을 사용한다.

---

## 안티패턴 1. 페이지 진입 데이터를 컴포넌트 mount 후 useEffect로 로드

Router는 데이터 로딩, action, revalidation을 제공한다. page component에서 fetch lifecycle을 직접 관리할 이유를 줄여야 한다.

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

---

## 안티패턴 2. URL state를 React state에 복제하고 다시 동기화

React Router는 URL search params를 상태의 자연스러운 저장소로 설명한다. URL과 local state를 이중 관리하면 동기화 버그가 생긴다.

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

---

## 안티패턴 3. pending/submission/navigation 상태를 별도 local state로 중복 관리

Router는 `useNavigation`, `useFetcher`, loaderData, actionData를 제공한다. 네트워크 관련 상태를 별도 React state로 들고 있으면 중복이다.

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
