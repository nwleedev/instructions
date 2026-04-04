---
name: use-repo-skills
description: "이 프로젝트 전용 스킬 목록. SessionStart 훅으로 자동 주입된다. 도메인 하네스 등 프로젝트별 스킬은 이 파일에 등록한다."
user-invocable: false
---

# Project-Local Skills

이 파일은 현재 프로젝트에서만 사용되는 스킬 목록이다.
sync.sh로 다른 프로젝트에 배포되지 않는다.
새 하네스를 harness-engine으로 생성하면 이 파일에 등록한다.

---

## 도메인 하네스 (description 매칭 자동 활성화)

### 프론트엔드
- **harness-fe-tanstack-query** — TanStack Query 서버 상태 관리
- **harness-fe-react-hook-form** — React Hook Form 폼 관리
- **harness-fe-react-router** — React Router 라우팅
- **harness-fe-zustand** — Zustand 클라이언트 상태 관리
- **harness-fe-fsd** — Feature-Sliced Design 아키텍처
- **harness-fe-useeffect-props** — useEffect Props 패턴
- **harness-fe-testing** — 프론트엔드 테스트 (TDD 프로토콜)
- **harness-fe-test-antipatterns** — 프론트엔드 테스트 안티패턴

### 수동 활성화
- 자동 활성화가 안 되면 `/harness-fe-<name>` 명령으로 수동 활성화할 수 있다.
