# Frontend Stack: React SPA

## 목적

이 문서는 `frontend` task adapter를 사용할 때 프로젝트가 React SPA라면 추가로 확인해야 하는 스택 분기 규칙을 정리한다.

## 추가 확인 항목

- 라우트 진입 데이터가 React Router loader/clientLoader에 잘 배치되는가
- CSR 환경에서 Query 캐시와 라우트 데이터의 책임이 충돌하지 않는가
- mutation 이후 invalidate/revalidate 흐름이 문서화되는가
- 브라우저 전용 상태와 서버 상태를 분리하는가

## 기본 규칙

- 페이지 진입 데이터는 React Router loader/clientLoader를 먼저 검토한다.
- 서버 상태는 TanStack Query 같은 서버 상태 도구를 우선 검토한다.
- 브라우저 상호작용 때문에 생긴 로컬 상태를 서버 상태나 글로벌 상태로 불필요하게 올리지 않는다.
- 네트워크 흐름을 `useEffect`에 묶지 않는다.

## 조사 시 우선 출처

- React Router 공식 문서
- React 공식 문서
- 사용하는 서버 상태/폼 도구 공식 문서
