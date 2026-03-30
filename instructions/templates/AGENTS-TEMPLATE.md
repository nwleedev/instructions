# 지시사항 문서

본 문서는 이 레포지터리에서 Codex, Claude가 작업할 때 따라야 할 기본 지시사항 템플릿입니다.
사람을 위한 README와 달리, 에이전트가 즉시 실행 가능한 명령, 규칙, 검증 절차 중심으로 유지합니다.

**Codex는 Codex CLI를 지칭합니다. Claude는 Claude Code를 지칭합니다.**

## 공통 필독

Codex, Claude를 처음 실행할 때와 컨텍스트가 압축되었을 때 아래 문서를 반드시 다시 읽습니다.

- `AGENTS.md`
- `instructions/INDEX.md`
- `instructions/SESSIONS.md`
- `instructions/FAILURE.md`

## 진입점 규칙

- 이 프로젝트의 루트 진입점은 `AGENTS.md`입니다.
- `CLAUDE.md`는 별도 규칙 저장소가 아니라 `AGENTS.md`를 가리키는 얇은 shim으로 유지합니다.
- 공통 규칙은 가능한 한 `AGENTS.md`와 `instructions/*`에만 두고, 도구별 예외 규칙은 최소화합니다.

## 작업 분야 하네스 선택

모든 작업은 아래 순서로 필요한 하네스를 추가 적용합니다.

1. 공통 규칙 확인
   - `AGENTS.md`
   - `instructions/INDEX.md`
   - `instructions/SESSIONS.md`
   - `instructions/FAILURE.md`
2. 프로젝트 로컬 작업 분야 하네스 확인
   - `instructions/<task_type>/INDEX.md` 같은 로컬 하네스가 있으면 그것과 연결된 상세 문서까지 읽습니다.
3. 도메인이 낯선 경우 학습 모드 병행 여부 판정
   - 사용자가 해당 분야에 익숙하지 않다고 밝혔거나 프로젝트 분야가 낯설면 `instructions/learning-mode/*`를 주 작업 하네스와 함께 적용합니다.
4. 로컬 하네스가 없으면 생성 또는 보강
   - 필요한 작업 분야 하네스가 없으면 `harness-engine` 스킬로 생성하거나 보강합니다.

규칙:

- 기존 로컬 하네스로 설명 가능한 작업이면 새 작업 분야를 만들지 않습니다.
- 기존 로컬 하네스로 설명되지 않는 반복 작업만 새 하네스 후보로 봅니다.
- 하네스 생성/보강/감사 뒤 다음 구현 티켓을 열기 전에는 validation artifact를 남깁니다.

## 세션

장시간 작업과 컨텍스트 압축 이후 재개를 위해 세션을 사용합니다.

- 세션 정의와 기록 규칙은 `instructions/SESSIONS.md`를 따릅니다.
- 시작 기록 없이 실질 작업을 진행하지 않습니다.
- 종료 기록 없이 완료 보고를 하지 않습니다.
- `harness-engine` 검증을 마쳤다면 `store/<session_id>/temps/validation/` 또는 `temps/validation/`에 validation artifact를 저장합니다.

## 레포지터리 추가 지침

- `instructions/REPOSITORY.md`가 있으면 반드시 읽고 반영합니다.
- 이 파일은 각 프로젝트의 로컬 운영 규칙을 담는 자리입니다.

## 주석

- 코드 추가 또는 수정 시 필요한 주석을 유지합니다.
- 주석은 동작 설명만이 아니라 설계 의도, 제약 조건, 입력 가정까지 포함해야 합니다.
- 상세 기준은 `instructions/COMMENTS.md`를 따릅니다.

<!--
프로젝트 전용 작업 분야 하네스가 안정화되면 아래처럼 명시 섹션을 추가합니다.

## 프론트엔드

- `instructions/frontend/INDEX.md`
- `instructions/frontend/ARCHITECTURE.md`
- `instructions/frontend/ANTI_PATTERNS.md`
- `instructions/frontend/VALIDATION.md`

## 조사

- `instructions/research/INDEX.md`
- `instructions/research/ARCHITECTURE.md`
- `instructions/research/VALIDATION.md`

## 학습 모드

- `instructions/learning-mode/INDEX.md`
- `instructions/learning-mode/core/ARCHITECTURE.md`
- `instructions/learning-mode/core/VALIDATION.md`
-->
