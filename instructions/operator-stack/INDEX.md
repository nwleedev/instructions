# 운영 스택 하네스 INDEX

이 문서는 Claude Code, Codex 같은 코딩 에이전트를 현업 수준으로 운영하기 위한 환경, 규칙, 배포 구조를 설계할 때 적용하는 repo-local 하네스의 진입점이다.

## 목적

- 내부 전용 기능을 추정하는 대신, 외부 사용자가 실제로 구축 가능한 최고 수준의 운영 체계를 정의한다.
- 개인 설정, 저장소 지침, 세션 규율, 스킬, MCP, 승인/샌드박스, 검증 루프, 배포 모델을 하나의 운영 스택으로 본다.
- 현재의 복사형 하네스 배포와 장기적인 패키지형 배포를 비교하고 전환 전략을 남긴다.

## 적용 대상

- Claude Code/Codex 운영 환경 설계
- 팀/개인 공용 하네스 구조 설계
- `sync-harness.sh` 같은 복사형 배포 모델의 한계 분석
- `npx` 기반 초기화/업데이트 CLI 설계
- portable core / project adapter / local evidence pack 경계 재정의

## 시작 전 필수 확인

1. 현재 저장소에서 이미 유지 중인 코어 자산이 무엇인지 확인한다.
2. 사용자가 바꾸고 싶은 것은 “운영 규칙”인지 “배포 메커니즘”인지 분리한다.
3. 벤더 내부 기능 재현이 목표가 아님을 명시한다.
4. 비교 대상 운영 표면을 공식 문서 기준으로 모은다.
5. 세션 산출물의 최소 묶음을 먼저 확정한다.

## Coverage Contract

운영 스택 하네스는 아래 6개 축을 반드시 닫아야 한다.

1. **환경 계층**
   - 머신/사용자/저장소/세션/팀/배포 계층 구분
2. **지속 설정**
   - 사용자 기본값, 프로젝트 오버라이드, 일회성 플래그의 경계
3. **운영 루프**
   - 조사, 구현, 검증, 리뷰, 재개, 장기 작업 절차
4. **권한과 통제**
   - 승인 정책, 샌드박스, MCP, 훅/스킬, 로깅
5. **배포 모델**
   - 현재 복사형 구조의 장단점
   - 패키지형 배포 구조와 업그레이드 흐름
6. **유지 판단**
   - 무엇을 유지하고 무엇을 바꿀지
   - 코어/어댑터/evidence 경계

## 최소 산출물

- `INDEX.md`
- `ARCHITECTURE.md`
- `ANTI_PATTERNS.md`
- `VALIDATION.md`
- 세션 경로의 운영 RFC 묶음
  - `SYSTEM-SETUP.md`
  - `WORKFLOW-PLAYBOOK.md`
  - `HARNESS-DECISION.md`
  - `DISTRIBUTION-RFC.md`
  - `PACKAGE-ARCHITECTURE.md`
  - `MIGRATION-PLAN.md`

## 판단 원칙

- 내부 직원 전용 기능을 모방하는 계획은 운영 스택 목표에서 제외한다.
- 높은 품질의 외부 운영 체계는 `지속 설정 + 저장소 지침 + 공유 스킬 + 도구 연결 + 승인/검증 루프`로 설명해야 한다.
- 배포 메커니즘을 바꾼다고 코어 하네스를 버리지는 않는다.
- 장기 방향은 패키지화일 수 있어도, 현재 복사형 모델이 제공하는 안정성을 무시하지 않는다.

## 읽는 순서

1. `ARCHITECTURE.md`
2. `ANTI_PATTERNS.md`
3. `VALIDATION.md`
4. 세션 경로의 `HARNESS-DECISION.md`
5. 세션 경로의 `DISTRIBUTION-RFC.md`
6. 세션 경로의 `PACKAGE-ARCHITECTURE.md`

## 설계 근거

- Claude Code 공식 문서는 `.claude`, hooks, skills, MCP, settings를 공개 운영 표면으로 설명한다.
- Codex 공식 문서는 `~/.codex/config.toml`, `.codex/config.toml`, MCP, AGENTS.md, skills, review 루프를 일관성의 핵심으로 설명한다.
- 따라서 외부 사용자의 강한 운영 환경은 “내부 기능 복제”보다 “설정과 작업 규율의 다층 구조화”에 가깝다.
