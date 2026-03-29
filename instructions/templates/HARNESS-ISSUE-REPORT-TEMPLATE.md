# Harness Issue Report Template

이 템플릿은 실제 프로젝트에서 작업 중 `AGENTS.md`, `instructions/*`, `harness-engine`, 세션 규칙, 하네스 생성/검증 흐름에 문제가 발생했을 때 즉시 작성하는 보고서다.

## 사용 규칙

- 하네스 계층 문제를 확인하면 가능한 한 같은 세션 안에서 바로 작성한다.
- 프롬프트 전문만 붙여넣지 말고, 재현 가능한 실패 보고 형태로 정리한다.
- 실제 프로젝트 전용 민감정보는 마스킹한다.
- 보고서 작성 후, 필요한 핵심 내용만 원본 저장소의 change request packet으로 승격한다.

## 권장 파일명

- `HARNESS-ISSUE-YYYYMMDD-HHMM-{slug}.md`

## Source Project

- repo:
- branch:
- session_id:
- task_type:
- environment:

## Harness Scope

- impacted layer:
  - `AGENTS.md`
  - `instructions/*`
  - `harness-engine`
  - session files
  - validation flow
- copied artifact scope:
- related local adapter or evidence:

## User Goal

- 원래 달성하려던 작업:
- 사용자 가시적 성공 조건:

## Input Snapshot

- user prompt summary:
- if needed, prompt excerpt:
- files/rules loaded before failure:

## Failure Or Friction

- observed behavior:
- why this is a problem:
- impact on current task:

## Expected Behavior

- expected agent behavior:
- expected document or harness behavior:

## Reproduction

1.
2.
3.

## Local Constraints

- project-specific constraints:
- tooling / permission constraints:
- stack-specific assumptions:

## Evidence

- logs:
- screenshots:
- related files:
- external references:

## Proposed Generalization

- local adapter fix candidate:
- portable core fix candidate:
- local evidence only:

## Change Request Packet Draft

- source project:
- copied artifact scope:
- failure or friction:
- expected behavior:
- reproduction task:
- local constraint:
- proposed generalization:
- evidence:

## Triage

- severity:
- blocked / degraded / advisory:
- repeatable across projects:
- next action:
