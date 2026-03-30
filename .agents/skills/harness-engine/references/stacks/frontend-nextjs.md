# Frontend Stack: Next.js

## 목적

이 문서는 `frontend` task adapter를 사용할 때 프로젝트가 Next.js App Router 계열이면 추가로 확인해야 하는 스택 분기 규칙을 정리한다.

## 추가 확인 항목

- Server Components와 Client Components 경계를 어디서 나누는가
- 페이지 진입 데이터가 Server Component, Route Handler, Server Action 중 어디에 있어야 하는가
- mutation 이후 revalidation 전략을 무엇으로 잡는가
- 브라우저 전용 API와 hydration 민감 로직을 어디에 두는가

## 기본 규칙

- 서버에서 해결 가능한 데이터 로딩은 Server Component 또는 서버 계층을 우선 검토한다.
- Client Component는 상호작용과 브라우저 상태에 집중한다.
- hydration mismatch를 피하기 위해 렌더 결과가 환경에 따라 달라지는 로직을 분리한다.
- cache/revalidate 전략은 Next.js 공식 문서 기준으로 확정한다.

## 조사 시 우선 출처

- Next.js 공식 App Router 문서
- React 공식 Server Components / client boundaries 문서
- 사용하는 데이터 계층(TanStack Query 등)의 Next.js 연동 문서
