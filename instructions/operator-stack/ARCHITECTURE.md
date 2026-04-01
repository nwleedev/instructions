# 운영 스택 하네스 ARCHITECTURE

## 목표

이 하네스는 `운영 표면 수집 -> 계층 모델링 -> 현재 자산 평가 -> 배포 구조 비교 -> 패키지 아키텍처 제안 -> 마이그레이션 계획` 흐름을 재현 가능하게 유지하기 위한 구조다.

## 계층 모델

### 1. Machine Layer

- 에이전트 런타임 설치
- 브라우저/CLI/MCP 실행 기반
- 로컬 보안 정책과 네트워크 조건

### 2. User Defaults Layer

- 개인 기본 모델, 승인 정책, 샌드박스, 로그 경로
- 개인 스킬과 개인 단축 흐름
- 사용자 단위의 안전 기본값

### 3. Repository Runtime Layer

- `AGENTS.md`, `instructions/*.md`, 프로젝트 `.codex` 또는 `.claude` 설정
- 프로젝트별 스킬, 템플릿, 세션 구조
- 로컬 검증 명령과 리뷰 루프

### 4. Session And Evidence Layer

- `PLANS/TICKETS/PROGRESS/DECISIONS/RESEARCH`
- 장시간 작업 재개를 위한 contract packet, validation artifact, evidence pack
- 장기 RFC와 조사 산출물

### 5. Team Distribution Layer

- 코어 자산을 여러 프로젝트에 배포하는 방식
- 현재는 복사형 sync, 장기적으로는 패키지형 init/update
- portable core / project adapter / local evidence pack 분리

## 운영 흐름

### 1. Baseline Setup

- 사용자 기본 설정을 먼저 닫는다.
- 저장소 지침과 프로젝트 오버라이드를 붙인다.
- 반복 작업은 스킬/템플릿으로 승격한다.

### 2. Work Loop

- 작업 시작 전 세션 기록
- 조사/구현/검증/리뷰
- 중간 상태 문서화
- 종료 전 세션 postflight

### 3. Governance Loop

- 권한 승인과 샌드박스 정책
- MCP 서버 등록과 사용 범위
- 로그와 실패 보고
- 하네스 validation artifact

### 4. Distribution Loop

- 코어 자산의 버전 관리
- 프로젝트별 adapter 생성 또는 업데이트
- 차기 패키지 버전으로의 업그레이드
- 로컬 evidence는 동기화하지 않고 남김

## 자산 경계

### Portable Core

- `AGENTS.md`
- top-level `instructions/*.md`
- `instructions/templates/*`
- `harness-engine`

### Project Adapter

- 프로젝트별 `instructions/<task_type>/*`
- 로컬 검증 명령
- 스택별 contract packet

### Local Evidence Pack

- 세션 `store/*`
- 임시 RFC, 조사 산출물, validation artifact
- 특정 프로젝트에서만 의미 있는 드라이런

## 패키지화 방향

- 장기적으로는 복사형 스크립트 하나보다 `npx` CLI가 더 적합하다.
- 하지만 패키지화의 핵심은 “새 UX”가 아니라 아래 4개다.
  - 버전 고정
  - 선택적 설치
  - 업그레이드 경로
  - 프로젝트 override 보존

## 해석 안전장치

- 공식 공개 표면과 내부 추정 표면을 혼합한 운영 권장안을 만들지 않는다.
- 현재 저장소에서 잘 되는 로컬 흐름을 곧바로 모든 프로젝트의 기본값으로 승격하지 않는다.
- 배포 메커니즘 변경과 규칙층 변경을 같은 문제로 취급하지 않는다.

## 다음 구현 단계 연결

- 이 하네스는 즉시 `package.json`을 도입하라는 문서가 아니다.
- 먼저 RFC와 contract packet으로 패키지 구조를 decision-complete 수준으로 정리한다.
- 실제 CLI 구현, registry 배포, upgrade command, doctor command는 후속 티켓으로 분리한다.
