# Task Intake

## 목적

사용자 요청을 어떤 `task_type`으로 다뤄야 하는지, 기존 하네스를 재사용할지 새 하네스를 만들지 일관되게 판정한다.

## 판정 순서

1. 사용자가 직접 지목한 작업 분야가 있는지 확인한다.
2. 아래 대표 분류 집합을 먼저 검토해 후보를 만든다.
3. 기존 `instructions/<task_type>` 하네스가 있는지 확인한다.
4. 기존 하네스로 커버 가능한지 본다.
5. 실질적 후보가 2개 이상이면 사용자에게 선택지를 제시하고 대기한다.
6. 대표 분류 집합으로 설명되지 않는 경우에만 새 하네스 생성을 검토한다.

## 대표 분류 집합

- `frontend`
- `research`
- `backend`
- `testing`
- `security`
- `ops`

이 집합을 기본값으로 사용하되, 반복 사용될 독자적 작업 흐름이 있고 기존 분류로 설명하기 어려운 경우에만 새 `task_type`를 만든다.

## 승격 규칙

- 새 분야가 한 번 등장했다고 바로 대표 분류 집합에 넣지 않는다.
- 예외적 `task_type`가 실제 작업에서 반복적으로 다시 등장하고, 기존 분류로 계속 설명하기 어렵다는 근거가 쌓이면 그때 대표 분류 집합 승격을 검토한다.
- 승격 여부는 사용자 확인 또는 명시적 작업 범위 안에서 결정한다.

## 기존 하네스 재사용 신호

- 이미 같은 작업 흐름을 다루는 문서가 있다.
- 약간의 섹션 보강만으로 충분하다.
- 안티패턴, 검증 기준, 아키텍처 흐름이 기존 틀 안에서 설명 가능하다.

예:

- UI 개발/테스트 중심 요청 -> `instructions/frontend`
- 자료 조사/비교/교차검증 중심 요청 -> `instructions/research`

## 새 하네스 생성 신호

- 기존 하네스로는 반복적으로 커버되지 않는다.
- 독자적인 작업 흐름이 필요하다.
- 별도의 안티패턴과 검증 기준이 계속 필요하다.
- 향후 같은 분야 작업에서 반복 재사용될 가능성이 높다.
- 대표 분류 집합의 어느 항목으로도 자연스럽게 설명되지 않는다.

## 기본 우선순위

복합 요청이면 아래 순서로 먼저 주도 분야를 고른다.

1. 조사
2. 교차 검증
3. 코드 작성
4. 사용자가 명시한 특수 분야

이 우선순위는 하네스 세팅의 시작점을 정하는 용도다. 실제 작업이 여러 분야를 포함할 수는 있다.

## 공통 research phase + 실행 경로 판정

`task_type` 판정 후, 먼저 `references/common/RESEARCH_PHASE.md`를 적용한다.

그 다음 `references/adapters/<task_type>.md` 존재 여부를 확인한다.

- **어댑터 있음**: `project-harness generation` 경로로 진행한다. 어댑터를 로드하고 Coverage Contract, Anti/Good 필수 쌍, 드라이런 예시를 하네스 생성에 적용한다.
- **정식 어댑터 있음**: `references/examples/<task_type>/`의 paired example pack도 함께 확인한다.
- **어댑터 없음 + 대표 분류**: 일반 하네스 생성으로 보내지 않는다. `engine-asset bootstrap` 경로로 전환하고, 해당 도메인의 `instructions/<task_type>` 하네스와 어댑터, paired example pack, 필요한 stack doc까지 한 세트로 생성한다.
- **어댑터 없음 + 미지 도메인**: `references/common/BOOTSTRAP_PHASE.md`의 절차를 따르고, 기본값은 `project-harness generation` 경로에서 로컬 하네스만 생성한다. 대표 분류 승격은 별도 결정이 있을 때만 한다.

스택 분기가 필요한 도메인(예: frontend)은 어댑터의 스택 분기 섹션에 따라 `references/stacks/<stack>.md`도 확인한다.

## 결과

판정 결과로 최소한 아래를 정한다.

- `task_type`
- 기존 하네스 재사용 여부
- 새로 만들 문서 묶음 범위
- 최종 산출물 경로
- 실행 경로 (`project-harness generation` / `engine-asset bootstrap`)
- 사용자 확인이 필요했는지 여부
- 대표 분류 집합으로 처리했는지, 예외적 새 `task_type`인지 여부
- 예외적 새 `task_type`라면 향후 승격 후보인지 여부
- **공통 research phase 적용 여부**
- **어댑터 로드 여부 (있음/없음/bootstrap)**
- **paired example pack 경로 또는 부재 여부**
- **스택 분기 필요 여부 (해당 시 스택명)**
- **stack reference 경로 또는 부재 사유**
