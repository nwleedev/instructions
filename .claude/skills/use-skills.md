---
name: use-skills
description: "스킬 사용 규칙, 스킬 탐색, 스킬 활성화, 누락 스킬 보고 — 모든 작업에서 적용 가능한 스킬을 반드시 확인하는 메타 규칙. Use when starting any task to check for applicable skills."
user-invocable: true
---

# Skill Usage Rules

이 스킬은 SessionStart 훅에서 자동 주입된다.

---

## HARD RULE: Always Check Skills

모든 작업을 시작하기 전에 `.claude/skills/` 폴더의 사용 가능한 스킬을 확인한다.

- 적용 가능성이 1%라도 있으면 반드시 해당 스킬을 invoke한다.
- "아마 필요 없을 것 같다"는 판단으로 스킬 확인을 건너뛰지 않는다.
- 스킬이 적용 가능한지 불확실하면 invoke한다.

---

## Red Flags — 스킬 미사용 합리화 금지

다음은 스킬을 건너뛰는 잘못된 합리화다:

| 합리화 | 왜 잘못인가 |
|---|---|
| "이 작업은 단순해서 스킬이 필요 없다" | 단순한 작업에서도 안티패턴을 범할 수 있다 |
| "이미 이 분야를 잘 알고 있다" | 스킬에는 프로젝트 고유 규칙이 있다 |
| "스킬 내용을 기억하고 있다" | 컨텍스트 압축 후 기억은 신뢰할 수 없다 |
| "시간이 부족하다" | 스킬 invoke는 몇 초밖에 안 걸린다 |
| "사용자가 빨리 끝내라고 했다" | 스킬 확인은 작업 품질을 위한 것이다 |
| "먼저 코드를 살펴보겠다" | 스킬부터 확인한 뒤 코드를 본다 |

---

## Available Skills

### 항상 활성 (CLAUDE.md @ref로 시스템 프롬프트에 포함)
- **core-rules** — 모든 작업에 적용되는 핵심 규칙 (언어, 보안, 도구 안전, 출력 스타일, 검증, 주석 등)

### SessionStart 자동 주입
- **session-management** — 세션 라이프사이클 (SESSION.md 관리, preflight/postflight)
- **use-skills** — 이 스킬 자체

### 오류 시 자동 활성화 (description 매칭)
- **failure-response** — 실패 대응, blocked 상태, 목표 불변성

### 도메인 하네스 (description 매칭 자동 활성화)
- **harness-fe-tanstack-query** — TanStack Query 서버 상태 관리
- **harness-fe-react-hook-form** — React Hook Form 폼 관리
- **harness-fe-react-router** — React Router 라우팅
- **harness-fe-zustand** — Zustand 클라이언트 상태 관리
- **harness-fe-fsd** — Feature-Sliced Design 아키텍처
- **harness-fe-useeffect-props** — useEffect Props 패턴
- **harness-fe-testing** — 프론트엔드 테스트
- **harness-fe-test-antipatterns** — 프론트엔드 테스트 안티패턴

### 학습
- **deep-study** — 도메인 심층 학습 (밑바닥부터 체계적 강의)

### 하네스 생성 엔진
- **harness-engine** — 새 도메인 하네스 스킬 생성/보강

### 커스텀 에이전트 (.claude/agents/)
- **work-reviewer** — 작업 완료 후 독립 품질 검토 (읽기 전용)
- **domain-tutor** — 대화형 도메인 튜터 (deep-study 스킬 + memory)
- **harness-researcher** — 하네스 생성용 도메인 조사 에이전트

---

## Missing Skill Protocol

필요한 스킬이 없으면:
1. 사용자에게 어떤 분야의 스킬이 부족한지 보고한다.
2. `harness-engine` 스킬로 새 스킬 생성을 제안한다.
3. 사용자 승인 후 진행한다.

---

## Skill Feedback Protocol

기존 스킬에 부족한 점을 발견하면:
1. 어떤 스킬의 어떤 부분이 부족한지 구체적으로 보고한다.
2. 개선 제안을 포함한다 (누락된 규칙, 잘못된 안티패턴, 새로운 조합 패턴 등).
3. 사용자 승인 후 스킬 파일을 수정한다.
