---
name: harness-engine
description: 사용자가 언급한 작업 분야에 맞춰 `instructions/<task_type>/*.md` 하네스 문서를 만들거나 보강하는 스킬. 본 에이전트가 판정과 사용자 상호작용을 담당하고, 서브에이전트가 도메인 조사와 하네스 생성을 수행한다.
---

# Harness Engine

이 스킬의 목적은 사용자가 언급한 작업 분야에 대해 Codex, Claude가 반복적으로 참고할 수 있는 하네스 문서를 `instructions/<task_type>/*.md`에 세팅하는 것이다.

본 에이전트는 판정, 사용자 상호작용, 세션 관리를 담당하고, 하네스 생성과 검증은 서브에이전트에 위임한다.

## 언제 사용하는가

- 새 작업 분야에 대한 하네스가 아직 없을 때
- 기존 `instructions/<task_type>` 문서가 너무 약해서 실제 작업 기준으로 쓰기 어려울 때
- 특정 분야에 대해 안티패턴, 아키텍처, 검증 기준, 템플릿을 보강해야 할 때
- 사용자가 "이 분야 작업 전에 Codex, Claude가 뭘 참고해야 하는가"를 문서화하려 할 때
- 다른 프로젝트에 portable core만 sync한 뒤, 그 프로젝트 전용 작업 분야 하네스를 처음 만들 때

## 빠른 절차 (본 에이전트)

1. 사용자 요청에서 목적과 작업 분야를 추출한다.
2. 대표 분류 집합에서 후보 `task_type`를 먼저 고른다.
3. 기존 `instructions/<task_type>` 하네스가 있는지 확인한다.
4. 기존 하네스가 있으면 최소 계약 충족 여부를 먼저 판정한다.
5. 최소 계약 미달이면 기존 하네스를 재사용하지 말고 보강 모드로 전환한다.
6. 산출물을 `portable core`, `project adapter`, `local evidence pack` 중 어디에 둘지 먼저 판정한다.
7. 도메인 어댑터를 로드하고 Coverage 갭 체크를 수행한다.
8. Coverage 갭 또는 bootstrap이 필요하면 사용자 검증을 수행한다 (human-in-the-loop).
9. **하네스 생성 서브에이전트를 실행한다.**
10. **검증 서브에이전트를 실행한다.**
11. 검증 결과를 확인하고, 보강이 필요하면 9~10을 반복한다.
12. 새 `task_type`를 만들었다면 `AGENTS.md`와 `instructions/INDEX.md`를 갱신한다.
13. 세션 기록(TICKETS.md, PROGRESS.md, DECISIONS.md)을 갱신한다.

## 작업 시작 전 확인

- 루트 `AGENTS.md`, `instructions/*.md`를 읽었는지 확인한다.
- `instructions/REPOSITORY.md`가 있으면 읽었는지 확인한다.
- 사용자 요청만으로 범위가 닫히는지 확인한다.
- 최종 산출물이 어느 `task_type` 아래에 위치할지 결정한다.
- 프로젝트 전용 예시나 검증 이력을 코어 문서에 넣을지 여부를 먼저 검토하지 않는다. 먼저 `instructions/HARNESS_PORTABILITY.md`의 분리 원칙을 적용한다.
- 이미 있는 하네스가 있다면 우선 읽고, 덮어쓰지 말고 보강 방향을 잡는다.
- 다른 프로젝트에서 core만 sync한 상태라면, 이 스킬이 해당 프로젝트의 첫 로컬 작업 분야 하네스를 만드는 공식 경로임을 전제로 한다.
- 사용자가 해당 도메인에 익숙하지 않다고 명시했다면, `learning-mode`를 병행 적용할지 먼저 판정한다.
- `references/examples/<task_type>/`가 있으면 참고용 evidence로만 읽고, portable core 규칙처럼 복사하지 않는다.
- 기존 하네스가 있더라도 아래 최소 계약을 충족하지 못하면 `재사용 가능`으로 판정하지 않는다.
  - `INDEX/ARCHITECTURE/ANTI_PATTERNS/VALIDATION` 묶음 존재
  - 작업 분야에 맞는 직접 예시 코드 또는 직접 사례 존재
  - 출처와 설계 근거 직접 포함
  - 세션 재개 순서와 구현 시작 전 체크리스트 존재

## 작업 분야 Intake

`references/TASK_INTAKE.md`를 읽고 아래를 먼저 판정한다.

- 어떤 `task_type`인지
- 기존 하네스를 재사용하는지
- 새 하네스를 만들어야 하는지
- 어떤 문서 묶음이 필요한지

대표 분류 집합을 기본값으로 먼저 검토한다.

실질적인 후보가 2개 이상이면 자동 확정하지 말고 사용자에게 선택지를 제시하고 대기한다.

## 도메인 어댑터 로드 + Coverage 갭 체크

`task_type` 판정 후, 기존 하네스의 품질을 먼저 판정하고 해당 도메인의 어댑터를 로드한다.

### 기존 하네스 품질 판정

기존 `instructions/<task_type>`가 있으면 아래를 먼저 확인한다.

- `INDEX/ARCHITECTURE/ANTI_PATTERNS/VALIDATION` 문서가 모두 존재하는가
- 작업 분야에 맞는 직접 예시 코드 또는 직접 사례가 있는가
- 출처와 설계 근거가 문서 내부에 직접 있는가
- 세션 재개 순서와 구현 시작 전 체크리스트가 보이는가

위 항목 중 하나라도 아니면, 기존 하네스는 `존재하지만 재사용 불가`로 판정하고 보강 모드로 전환한다.

### 어댑터가 있는 경우

`references/adapters/<task_type>.md`가 존재하면 로드한다.

어댑터 로드 후, **Coverage 갭 체크**를 수행한다. 다음 중 **2개 이상** 해당하면 bootstrap 보충을 실행한다.

- 이 프로젝트의 1차 근거 소스를 즉시 3개 이상 나열할 수 없다
- 이 프로젝트의 핵심 지표/메트릭을 즉시 정의할 수 없다
- 어댑터의 Coverage Contract 필수 축에서 이 프로젝트에 적합한 항목이 절반 미만이다
- 사용자가 해당 프로젝트의 도메인에 대한 지식이 부족하다고 명시했다

### bootstrap 보충 (Coverage 갭 감지 시)

`references/adapters/bootstrap.md`를 **보충 모드**로 실행한다. 본 에이전트가 사용자 검증(human-in-the-loop)을 수행하고, 확정된 Coverage Contract를 서브에이전트에 전달한다.

### 공식 MCP 권장안 (선택)

- Tavily MCP: 최신 웹 검색과 원문 추출 보강에 적합하다.
- Context7 MCP: 라이브러리/프레임워크 문서 문맥 보강에 적합하다.
- 둘 다 선택형 도구이며, 최종 규칙과 인용은 공식 문서 또는 실제 소스 코드로 다시 확인한다.

### 어댑터가 없는 경우

1. **대표 분류 집합에 해당하지만 어댑터가 아직 없는 경우**: Coverage Contract 초안을 직접 구성하고 서브에이전트에 전달한다.
2. **미지 도메인인 경우**: `references/adapters/bootstrap.md`를 신규 모드로 실행한다. 본 에이전트가 Role-Goal-Backstory 정의와 사용자 검증을 수행한 뒤, 확정된 내용을 서브에이전트에 전달한다.

### 스택 분기 (해당 시)

어댑터에 스택 분기 섹션이 있으면 `references/stacks/<stack>.md`를 확인한다.

- 스택 감지 순서: 프로젝트 AGENTS.md/CLAUDE.md 선언 → 설정 파일 확인 → 사용자에게 선택 요청
- 스택 정보를 서브에이전트에 함께 전달한다.

## 이식성 판정

하네스를 만들거나 보강하기 전에, 추가할 내용을 아래 셋 중 어디에 두어야 하는지 먼저 판정한다.

1. `portable core`
   - 다른 프로젝트에도 그대로 유지될 규칙
   - 진입점, 작업 흐름, 금지 패턴, 완료 기준
2. `project adapter`
   - 경로, 검증 명령, 로컬 정책, 프로젝트 스택 같은 연결 지점
3. `local evidence pack`
   - 현재 저장소 전용 드라이런, 샘플, 과거 실패 기록

규칙:

- 현재 저장소의 예시, 절대경로, 기존 실패 이력은 기본적으로 `local evidence pack` 후보로 본다.
- 특정 프로젝트의 연결부는 코어로 올리지 말고 adapter 성격의 문서나 템플릿으로 민다.
- 다른 프로젝트에서 하네스를 복사해 쓴 뒤 생긴 문제를 되돌릴 때는 `instructions/HARNESS_PORTABILITY.md`의 change request packet 형식을 따른다.
- 실제 프로젝트에서 하네스 계층 문제를 만나면 `instructions/templates/HARNESS-ISSUE-REPORT-TEMPLATE.md`로 로컬 보고서를 먼저 남긴다.

## 하네스 생성 서브에이전트 실행

사용자 상호작용이 완료되고 모든 결정 사항이 확정되면, 하네스 생성 서브에이전트를 실행한다.

### 실행 설정

```
Agent tool 호출:
  subagent_type: general-purpose
  isolation: worktree
  run_in_background: false (포그라운드)
```

### 서브에이전트에 전달할 프롬프트 구성

```
다음 파일을 읽고 하네스 산출물을 생성해주세요.

1. 생성 지침: .agents/skills/harness-engine/references/GENERATION.md
2. 산출물 규칙: .agents/skills/harness-engine/references/OUTPUT_CONTRACT.md

작업 정보:
- task_type: {task_type}
- adapter_path: {adapter_path}
- coverage_contract: {coverage_contract 내용}
- user_decisions: {사용자 확정 사항}
- existing_harness_path: {기존 하네스 경로 또는 "없음"}
- session_path: {세션 디렉터리 경로}
- stack: {스택 정보 또는 "해당 없음"}
```

### 서브에이전트 결과 처리

서브에이전트가 반환하는 정보:
- 생성/수정된 파일 목록
- 조사 근거 요약
- Coverage 충족 상태
- Anti/Good 쌍 충족 상태
- 미충족 항목
- worktree_path (worktree 격리 사용 시)

결과를 확인하고, 미충족 항목이 있으면 사용자에게 보고한 뒤 대응을 결정한다.
`통과`가 아니면 구현 티켓을 시작하지 않는다.

## 검증 서브에이전트 실행

하네스 생성 서브에이전트가 완료되면, 검증 서브에이전트를 실행한다.

### 실행 설정

```
Agent tool 호출:
  subagent_type: general-purpose
  isolation: 없음 (worktree 미사용 — 읽기만 수행)
  run_in_background: false (포그라운드)
```

### 검증 서브에이전트 프롬프트

```
다음 경로의 하네스 문서만 읽고 검증을 수행해주세요.

하네스 경로: {worktree_path}/instructions/{task_type}/
검증 기준: .agents/skills/harness-engine/references/VALIDATION.md

검증 방법:
1. 하네스 문서만 읽고, 다음 가상 작업을 수행해보세요: {가상 작업 시나리오}
2. 하네스에서 빠진 정보, 모호한 지시, 충돌하는 규칙을 보고해주세요.
3. VALIDATION.md의 최소 체크리스트를 항목별로 통과 여부를 판정해주세요.

보고 형식:
- 누락 항목: [목록]
- 모호 지점: [목록]
- 충돌 규칙: [목록]
- 체크리스트 통과 여부: [항목별]
- 종합 판정: [통과/보강 필요]
- 구현 시작 허용: [yes/no]
```

### 검증 결과 처리

- **통과**: worktree 유지. 사용자에게 결과 보고. discovery 등록(AGENTS.md, INDEX.md) 필요 시 수행. 본 에이전트는 validation artifact를 세션 경로에 저장한 뒤에만 구현 티켓을 시작한다.
- **보강 필요**: 검증 보고의 누락/모호/충돌 항목을 하네스 생성 서브에이전트에 전달하여 재실행. 또는 본 에이전트가 직접 보강. 구현은 금지한다.

## 세션 관리 (본 에이전트 책임)

서브에이전트는 세션 파일을 갱신하지 않는다. 본 에이전트가 다음을 담당한다.

- TICKETS.md: 작업 상태 갱신
- PROGRESS.md: 작업 로그 기록
- DECISIONS.md: 결정 사항 기록
- RESEARCH.md: 서브에이전트가 반환한 조사 근거 요약을 기록
- validation artifact: `store/<session_id>/temps/validation/` 또는 `temps/validation/`에 저장
- AGENTS.md, instructions/INDEX.md: 새 task_type 생성 시 discovery 등록
- 다른 프로젝트 환류 요청이 있으면 change request packet의 핵심 필드를 DECISIONS 또는 RESEARCH에 남긴다.
- 실제 프로젝트에서 수집한 보고서가 있으면 원문 전체 대신 핵심 필드만 추려 upstream 판단 자료로 사용한다.

## 기존 하네스 재사용 원칙

- 이미 현재 프로젝트에 충분한 `instructions/<task_type>` 로컬 하네스가 있으면 새 디렉터리를 만들지 않는다.
- “충분한 하네스”는 최소 계약과 검증 통과를 모두 만족하는 경우만 의미한다.
- 부족한 섹션만 보강한다.
- 새 하네스는 기존 하네스로는 반복적으로 커버되지 않는 경우에만 만든다.
- 새 하네스를 만들었다면 discovery를 위해 `AGENTS.md`와 `instructions/INDEX.md` 갱신까지 완료해야 한다.
- 기존 하네스를 보강할 때도 portable core와 local evidence를 섞지 않는다.

## 금지

- `task_type` 판단 없이 바로 새 디렉터리 생성
- 최종 산출물을 `temps/`에만 남기고 종료
- 서브에이전트에 사용자 확정 전의 미결 사항을 전달하기
- 검증 서브에이전트를 생략하기
- 최소 계약 미달 기존 하네스를 그대로 재사용하기
- 검증 결과가 `통과`가 아닌데 구현 티켓을 시작하기
- Anti/Good 쌍의 한쪽만 작성하고 완료로 처리하기
- 최종 문서에 출처를 남기지 않고 `RESEARCH.md`에만 근거를 두기
- 현재 저장소 전용 예시를 portable core 규칙으로 승격하기
- 복사형 사용 중 생긴 문제를 재현 정보 없이 코어 변경 요청으로 올리기

## 참고 파일

- Intake 기준: `references/TASK_INTAKE.md`
- 생성 지침 (서브에이전트용): `references/GENERATION.md`
- 산출물 기준: `references/OUTPUT_CONTRACT.md`
- 검증 기준: `references/VALIDATION.md`
- 도메인 어댑터: `references/adapters/<task_type>.md`
- 스택별 지침: `references/stacks/<stack>.md`
- 미지 도메인 시작점: `references/adapters/bootstrap.md`
