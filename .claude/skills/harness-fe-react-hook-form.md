---
name: harness-fe-react-hook-form
description: "React Hook Form, useForm, useController, useFieldArray, useWatch, useFormState, useFormContext, FormProvider, register, defaultValues, reset, setValue, 폼 상태 관리, validation 작업 시 활성화. RHF 규칙과 안티패턴을 제공."
user-invocable: true
---

# React Hook Form Rules & Anti-Patterns

폼의 단일 진실 공급원은 React Hook Form이다. 공식 문서를 우선 참조한다.

## 핵심 규칙

- 초기값은 `useForm({ defaultValues })` 또는 명시적 `reset` 1회 진입점으로 넣는다.
- 각 input에서 제각각 `defaultValue`를 흩뿌리지 않는다.
- `useEffect + setValue/reset` 반복 호출로 폼을 동기화하지 않는다.
- 폼 상태를 Zustand 또는 일반 React state에 중복 저장하지 않는다.

### 훅 선택 기준

| 상황 | 선택 |
|------|------|
| 깊은 중첩에서 form methods 필요 | `FormProvider` + `useFormContext` |
| 외부 UI 라이브러리 controlled field | `useController` |
| 동적 배열 필드 추가/삭제/정렬 | `useFieldArray` |
| 특정 필드 값만 반응형 읽기 | `useWatch` |
| dirty/errors/isSubmitting만 읽기 | `useFormState` |
| 단순 네이티브 input | `register` |

### API 데이터 기반 기본값 순서

1. React Router loader/clientLoader에서 먼저 해결
2. `queryClient.ensureQueryData` 또는 `fetchQuery`로 데이터 확보
3. `useForm({ defaultValues })` 또는 명시적 `reset` 1회 진입점에 전달
4. effect에서 setValue 분산 주입 금지

---

## 안티패턴 1. API 응답을 useEffect + setValue로 여러 번 분산 주입

RHF는 `defaultValues`를 단일 기준값으로 사용한다. effect에서 필드별로 주입하면 dirty/touched 기준이 흐려진다.

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

---

## 안티패턴 2. defaultValue와 defaultValues를 제각각 섞어 사용

RHF는 `defaultValues`를 전체 폼의 단일 기준으로 권장한다. 필드별 `defaultValue` 남발은 초기값 출처를 분산시킨다.

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

---

## 안티패턴 3. 단순 네이티브 입력도 전부 Controller/useController로 감싸기

RHF는 기본적으로 uncontrolled input과 잘 맞는다. 단순 input까지 모두 controlled 패턴으로 만들면 코드량과 복잡성이 증가한다.

나쁜 예시:

```tsx
const { field } = useController({ name: "firstName", control });
<input value={field.value} onChange={field.onChange} />;
```

권장 대체:

```tsx
<input {...register("firstName")} />
```

---

## 안티패턴 4. root에서 watch()로 전체 폼 값을 광범위하게 구독

필요한 값만 `useWatch`로 구독하는 편이 리렌더 범위 관리에 유리하다.

나쁜 예시:

```tsx
const values = watch();
return <Preview values={values} />;
```

권장 대체:

```tsx
const selectedRole = useWatch({ control, name: "role" });
return <RolePreview role={selectedRole} />;
```

---

## 안티패턴 5. 동적 배열 필드를 일반 state 배열로 따로 관리

RHF는 `useFieldArray`를 제공한다. 별도 state 배열과 RHF 값을 이중 관리하면 동기화 버그가 생긴다.

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
