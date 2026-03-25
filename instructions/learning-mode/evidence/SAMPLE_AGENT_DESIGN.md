# 샘플 에이전트 설계 문서 초안

## 문서 목적

`Signal-to-Spec`이라는 AI 에이전트의 MVP 설계 초안을 정의한다. 이 에이전트는 공개 시장 신호를 수집해 웹 애플리케이션 아이디어를 제안하고, 선택된 아이디어에 대한 제품/에이전트 설계 문서를 생성한다.

## 문제 정의

초기 창업자, 인디 해커, 제품 팀은 다음 두 작업을 반복해서 수행한다.

- 어떤 웹앱 아이디어가 실제로 관심을 받을지 탐색
- 선택한 아이디어를 문서화해 팀이나 에이전트가 바로 이어서 실행할 수 있게 정리

현재는 이 과정이 검색, 메모, 비교, 문서 작성으로 분절되어 있어 시간이 많이 들고 맥락 손실이 잦다.

## 타깃 사용자

- 인접 개발 경험은 있으나 AI 에이전트 설계는 낯선 창업자
- PM/디자이너/개발자 1~3인 소규모 제품 팀
- 아이디어 탐색에서 설계 문서 초안까지 빠르게 이어가고 싶은 사용자

## 핵심 사용자 작업

1. 관심 분야와 타깃 사용자 입력
2. 시장 신호 기반 아이디어 후보 생성
3. 아이디어별 근거와 리스크 비교
4. 우선순위 아이디어 1개 선택
5. 설계 문서 초안 생성
6. 사람이 검토하고 후속 수정

## MVP 산출물

- 아이디어 후보 리스트 3~5개
- 각 아이디어의 근거 신호, 예상 사용자, 리스크
- 선택된 아이디어 1개에 대한 설계 문서 초안

## 시스템 구조

### 1. Input Normalizer

- 역할:
  - 사용자의 관심 도메인, 타깃 사용자, 금지 조건, 산출물 강도를 구조화한다.
- 구현 메모:
  - Structured Outputs를 사용해 입력 스키마를 강제한다.

### 2. Signal Collector

- 역할:
  - Product Hunt, 공식 제품 문서, 공개 출시 설명, 검색 결과 같은 신호를 수집한다.
- 구현 메모:
  - 외부 검색/웹 도구는 function calling 또는 built-in tools로 연결한다.
  - 데이터 수집과 해석을 분리한다.

### 3. Opportunity Synthesizer

- 역할:
  - 수집된 신호를 문제군, 사용자군, 경쟁 강도, 차별화 가능성 기준으로 묶는다.
- 구현 메모:
  - Structured Outputs로 후보 아이디어를 같은 스키마로 정규화한다.

### 4. Spec Writer

- 역할:
  - 선택된 아이디어를 제품/에이전트 설계 문서 초안으로 바꾼다.
- 포함 항목:
  - 문제 정의
  - 사용자
  - 핵심 워크플로
  - 데이터/도구 구조
  - 평가 지표
  - 리스크와 범위 밖

### 5. Guardrail and Review Layer

- 역할:
  - 과도한 추론, 근거 없는 시장성 단정, 중복 아이디어, 불완전 문서 생성을 차단한다.
- 구현 메모:
  - OpenAI Cookbook의 agent best practices처럼 guardrails, tracing, clear tool definitions를 기본으로 둔다.

## 추천 기술 방향

### 오케스트레이션

- OpenAI Cookbook의 agent best practices 기준으로, 모듈화된 역할 분리와 명확한 도구 정의를 우선한다.
- 단일 거대 프롬프트보다 입력 정규화, 신호 수집, 아이디어 합성, 설계 문서 작성 단계를 분리한다.

### 상태 관리

- Responses API는 상태 유지형 상호작용과 `previous_response_id` 기반 체이닝을 지원한다.
- 긴 세션에서는 문서화된 checkpoint와 요약을 남겨 재개 가능성을 높인다.

### 출력 구조

- OpenAI Structured Outputs 가이드 기준으로:
  - 도구와 연결되는 부분은 function calling
  - 최종 사용자/시스템 응답 스키마는 structured `text.format`
- 따라서 신호 수집기 호출은 function calling, 아이디어 카드와 설계 문서는 structured outputs로 분리한다.

## 예시 출력 스키마

### Idea Card

- title
- target_user
- core_problem
- why_now
- evidence_signals
- novelty
- risks
- score

### Spec Draft

- summary
- user_persona
- jobs_to_be_done
- workflow
- data_sources
- tools_and_functions
- output_schema
- eval_metrics
- guardrails
- out_of_scope

## 평가 지표

- 아이디어 후보 적합성:
  - 사용자가 `탐색 가치가 있다`고 판단한 비율
- 문서 품질:
  - 설계 문서 필수 항목 충족률
- 근거 품질:
  - 각 아이디어 카드에 근거 신호 2개 이상 포함 비율
- 운영 품질:
  - 도구 실패 시 graceful fallback 존재 여부

## 주요 리스크

- 공개 신호 편향:
  - Product Hunt 중심 데이터는 maker community 편향이 있다.
- 과도한 자신감:
  - 시장 관심 신호를 결제 의향으로 착각할 수 있다.
- 출력 일관성:
  - 구조화 스키마가 약하면 아이디어 비교가 어려워진다.

## 범위 밖

- 실제 웹앱 자동 구현
- 배포 자동화
- 고객 인터뷰 자동 실행
- 결제 실험 자동 운영

## 근거

- Product Hunt weekly leaderboard, week of February 16, 2026:
  - https://www.producthunt.com/leaderboard/weekly/2026/8/all
- Product Hunt Origami.chat:
  - https://www.producthunt.com/products/origami-chat
- OpenAI Responses Overview:
  - https://developers.openai.com/api/reference/responses/overview/
- OpenAI Responses migration differences:
  - https://developers.openai.com/api/docs/guides/migrate-to-responses/
- OpenAI Structured Outputs guide:
  - https://developers.openai.com/api/docs/guides/structured-outputs/
- OpenAI Cookbook, Best Practices When Building Agents:
  - https://developers.openai.com/cookbook/examples/agents_sdk/multi-agent-portfolio-collaboration/multi_agent_portfolio_collaboration

