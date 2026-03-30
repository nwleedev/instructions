# Frontend Anti/Good Reference

## 1. 서버 상태 복제

나쁜 예시:

```tsx
const [profile, setProfile] = useState<User | null>(null);

useEffect(() => {
  fetch("/api/profile")
    .then((res) => res.json())
    .then(setProfile);
}, []);
```

좋은 예시:

```tsx
function ProfileScreen() {
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });

  if (profileQuery.isLoading) return <Spinner />;
  return <ProfileCard profile={profileQuery.data} />;
}
```

의도:

- 서버 데이터를 로컬 state로 복제하지 않는다.
- Query 계층이 서버 상태의 단일 진실 공급원이 되게 한다.

## 2. useEffect fetch 남용

나쁜 예시:

```tsx
useEffect(() => {
  let cancelled = false;

  fetch(`/api/posts?tag=${tag}`)
    .then((res) => res.json())
    .then((posts) => {
      if (!cancelled) setPosts(posts);
    });

  return () => {
    cancelled = true;
  };
}, [tag]);
```

좋은 예시:

```tsx
const postsQuery = useQuery({
  queryKey: ["posts", tag],
  queryFn: () => fetchPosts(tag),
});
```

의도:

- fetch를 effect 생명주기에 묶지 않는다.
- 캐시, 로딩, 오류, 재검증을 데이터 계층에서 처리한다.

## 3. 폼 초기값 분산 주입

나쁜 예시:

```tsx
const form = useForm<UserForm>();

useEffect(() => {
  if (!profile) return;
  form.setValue("name", profile.name);
  form.setValue("email", profile.email);
}, [profile, form]);
```

좋은 예시:

```tsx
const form = useForm<UserForm>({
  values: profile
    ? { name: profile.name, email: profile.email }
    : undefined,
});
```

또는:

```tsx
useEffect(() => {
  if (!profile) return;
  form.reset({ name: profile.name, email: profile.email });
}, [profile, form]);
```

의도:

- 초기값 주입 시점을 문서로 명확히 고정한다.
- `setValue` 반복 호출로 필드별 동기화를 하지 않는다.
