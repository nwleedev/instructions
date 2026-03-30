# Output Contract

## 목적

`harness-engine` 작업의 최종 산출물과 임시 산출물을 분리하고, `instructions/<task_type>` 아래에 어떤 문서를 남겨야 하는지 정의한다.

## 경로 규칙

- 최종 산출물: `instructions/<task_type>/*.md`
- 임시 메모: `store/<session_id>/temps/*`
- project contract packet: `store/<session_id>/temps/contracts/<task_type>-contract.md`
- 스킬 자체 보강 지침: `.agents/skills/harness-engine/**`
- 공통 phase 문서: `.agents/skills/harness-engine/references/common/*.md`
- task adapter: `.agents/skills/harness-engine/references/adapters/<task_type>.md`
- 스킬 내부 reference example: `.agents/skills/harness-engine/references/examples/<task_type>/*`
- 스택 seed 지침: `.agents/skills/harness-engine/references/stacks/<stack>.md`
- contract packet 템플릿: `instructions/templates/HARNESS-CONTRACT-PACKET-TEMPLATE.md`
- validation artifact 템플릿: `instructions/templates/HARNESS-VALIDATION-REPORT-TEMPLATE.md`
- 새 `task_type` 생성 시 discovery용 루트 진입점으로 `AGENTS.md`와 `instructions/INDEX.md`를 함께 갱신

세션이 없는 환경에서는 `temps/contracts/<task_type>-contract.md`를 사용한다.

## 실행 경로 규칙

`harness-engine`의 생성 작업은 아래 둘 중 하나로 분류한다.

1. `project-harness generation`
   - 대상 프로젝트의 `instructions/<task_type>/*.md`를 생성/보강하는 일반 경로
   - 기존 adapter가 있거나, 비대표 분류/미지 도메인에 대해 로컬 하네스만 우선 세팅할 때 사용
   - 이 경로에서도 contract packet은 필수다
2. `engine-asset bootstrap`
   - 대표 분류에 adapter가 없을 때, 엔진 자산과 대상 프로젝트 하네스를 한 번에 닫는 경로
   - `instructions/<task_type>/*.md`와 함께 thin adapter, 필요 시 example pack, stack seed doc까지 생성할 수 있다

대표 분류인데 adapter가 없는 경우에는 일반 경로로 처리하지 않는다.

## 이식성 패키징 규칙

하네스 산출물은 가능한 한 아래 3층을 구분한다.

1. `portable core`
   - 다른 프로젝트로 복사해도 유지될 규칙
2. `project adapter`
   - 현재 프로젝트의 경로, 검증 명령, 스택 연결부
3. `local evidence pack`
   - 현재 저장소 전용 샘플, 드라이런, 과거 검증 기록

규칙:

- 현재 저장소의 예시와 검증 이력을 코어 문서의 필수 규칙처럼 적지 않는다.
- 특정 저장소에만 맞는 경로/명령/예시는 adapter나 evidence로 밀어낸다.
- 새 하네스를 만들 때 project adapter나 local evidence가 필요하면 템플릿 또는 안내 섹션으로 분리한다.
- 스킬 내부 reference example은 조사와 문서 구조의 참고 자료로만 사용하고, 최종 산출물의 필수 규칙으로 승격하지 않는다.
- 프로젝트별 세부 stack/library 규칙은 코어 문서보다 contract packet에 먼저 기록한다.

## discovery 등록 형식

- `AGENTS.md` 등록 시 현재 문서가 사용하는 섹션형 서술 포맷을 따른다.
- 새 하네스가 기존 큰 범주에 자연스럽게 들어가면 해당 범주 아래 참고 문서 목록에 추가한다.
- 기존 큰 범주로 설명되지 않으면 현재 `AGENTS.md`와 같은 톤의 새 섹션을 추가한다.
- `instructions/INDEX.md`에는 공통 규칙 진입점 성격을 해치지 않는 짧은 안내 또는 링크만 추가한다.

## 최종 산출물 기본 묶음

새 하네스를 만들 때 기본 후보는 아래와 같다.

- `INDEX.md`
- `ARCHITECTURE.md`
- `ANTI_PATTERNS.md`
- `VALIDATION.md`

필요할 때만 추가:

- `templates/*.md`
- `evidence/*.md`
- 테스트 전용 문서
- 도메인별 세부 문서

정식 adapter를 만들거나 크게 보강할 때 추가:

- `references/adapters/<task_type>.md`
- `references/examples/<task_type>/README.md`
- `references/examples/<task_type>/ANTI_GOOD_REFERENCE.md`
- `references/examples/<task_type>/VALIDATION_REFERENCE.md`

## 각 문서의 역할

- `INDEX.md`
  - 목적, 적용 대상, 시작 전 확인, 문서 안내, 참고 출처
- `ARCHITECTURE.md`
  - 작업 흐름, 계층, 역할 분리, 세션/도구 사용 방식, 설계 근거
- `ANTI_PATTERNS.md`
  - 피해야 할 구현/조사/운영 패턴과 차단 규칙, 근거 출처
- `VALIDATION.md`
  - 완료 기준, 드라이런, 검증 체크리스트, 검증 근거

## 최소 섹션 계약

최종 문서 묶음에는 아래 정보가 드러나야 한다.

- 무엇을 위한 하네스인가
- 언제 적용하는가
- 어떤 절차로 진행하는가
- 무엇을 금지하는가
- 무엇을 보면 완료라고 판단하는가
- 세션 재개 시 무엇을 읽으면 되는가
- 출처와 설계 근거가 어디에 있는가
- 프로젝트 전용 연결부가 코어와 어떻게 분리되는가
- contract packet에서 확정한 프로젝트 스택과 검증 포인트가 어떻게 반영되는가

## Anti/Good 쌍 완성도 규칙

- 어댑터가 정의한 최소 Anti/Good 필수 쌍 목록의 모든 케이스에 대해, ANTI_PATTERNS.md에 Anti와 Good이 **반드시** 존재해야 한다.
- contract packet이 정의한 프로젝트별 Anti/Good 필수 쌍도 모두 존재해야 한다.
- 한쪽(Anti만 또는 Good만)만 있으면 산출물이 불완전한 것으로 판정한다.
- 각 쌍에는 케이스명을 명시하여 Anti와 Good의 대응 관계가 명확해야 한다.

## Example Pack 규칙

- example pack은 선택형 engine-internal reference 자산이다.
- example pack은 adapter의 규범 계약이나 contract packet을 대체하지 않는다.
- example pack이 없어도 생성/검증 경로는 성립해야 한다.
- example pack이 있다면 adapter 또는 contract packet과 충돌하지 않아야 한다.
- example pack은 대상 프로젝트 runtime 문서로 sync하지 않는다.

## Contract Packet 규칙

- 모든 생성/보강/검증 작업은 contract packet을 기준으로 한다.
- contract packet은 세션 산출물이지만, 이번 프로젝트에 대한 생성/검증의 표준 진실원천이다.
- thin adapter는 최소 하한선을 제공하고, contract packet은 실제 프로젝트 stack/library 조합을 닫는다.
- validator는 contract packet 경로, revision, engine follow-up 필요 여부를 artifact에 남겨야 한다.

## 예시 코드 규칙

- 예시 코드는 Markdown 코드 블록으로 제시한다.
- 소스 코드 파일을 예시 용도로 직접 생성하지 않는다.
- 예시가 특정 프레임워크나 도구에 묶이면, 그 전제 조건을 함께 적는다.

## 어댑터 연동 규칙

- 모든 하네스 생성은 먼저 공통 `research` phase를 적용한다.
- 하네스 생성 시 해당 도메인 어댑터의 최소 Coverage Contract가 모두 산출물에 반영되어야 한다.
- contract packet의 프로젝트별 필수 작업 축과 금지 패턴이 산출물에 반영되어야 한다.
- 어댑터가 정의한 1차 근거 소스를 산출물의 출처 체계에 반영한다.
- 대표 분류인데 adapter가 없다면 `engine-asset bootstrap` 경로로 전환해 어댑터 파일과 필요 시 example pack, stack seed doc까지 함께 생성한다.
- stack seed reference가 있으면 참고하되, 산출물의 최종 기준은 contract packet으로 고정한다.

## 서브에이전트 산출물 규칙

- `project-harness generation` 경로의 서브에이전트는 `instructions/<task_type>/*.md` 파일을 생성/수정한다.
- `engine-asset bootstrap` 경로이거나 현재 작업이 harness-engine 자체의 재사용 자산 보강이라면 `references/adapters/<task_type>.md`, `references/examples/<task_type>/*`, `references/stacks/<stack>.md`, `references/common/*.md`도 생성/수정할 수 있다.
- 세션 파일(TICKETS.md, PROGRESS.md, DECISIONS.md)은 서브에이전트가 갱신하지 않는다 (본 에이전트 책임).
- AGENTS.md, instructions/INDEX.md는 서브에이전트가 갱신하지 않는다 (본 에이전트 책임).
- worktree 격리 사용 시, 산출물은 worktree 내 `instructions/<task_type>/` 경로에 생성된다.
- 서브에이전트는 완료 시 생성/수정 파일 목록, 실행 경로, Coverage 충족 상태, Anti/Good 쌍 충족 상태, contract packet 사용 상태, engine follow-up 필요 여부, 미충족 항목을 보고한다.

## 환류 패킷 규칙

복사된 프로젝트에서 하네스 변경 요청을 되돌릴 때는 아래 필드가 있어야 한다.

- source project
- copied artifact scope
- failure or friction
- expected behavior
- reproduction task
- local constraint
- proposed generalization
- evidence

재현 정보와 일반화 판단이 없으면 코어 변경 요청으로 승격하지 않는다.

## 실제 프로젝트 보고 템플릿

하네스를 다른 프로젝트에 복사해 사용할 수 있도록, 아래 템플릿을 portable core의 기본 부속물로 유지한다.

- `instructions/templates/HARNESS-ISSUE-REPORT-TEMPLATE.md`
- `instructions/templates/HARNESS-CONTRACT-PACKET-TEMPLATE.md`
- `instructions/templates/HARNESS-VALIDATION-REPORT-TEMPLATE.md`

역할:

- 실제 프로젝트에서 하네스 계층 문제가 발생했을 때 즉시 구조화 리포트를 남긴다.
- contract packet 템플릿은 프로젝트별 stack/library 계약을 정리하는 임시 진실원천 역할을 한다.
- validation report 템플릿은 하네스 검증 통과 여부와 구현 시작 허용 여부를 세션 산출물로 남기는 역할을 한다.
- validation artifact에는 이번 실행이 `project-harness generation`인지 `engine-asset bootstrap`인지, `engine_followup_required`가 있는지도 남긴다.
