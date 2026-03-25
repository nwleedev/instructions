# 샘플 아이디어 조사 결과

## 조사 질문

`실제 사람들이 좋아할 수 있는 웹 애플리케이션 아이디어를 조사하고 설계 문서를 작성할 수 있는 AI 에이전트`를 만든다면, 어떤 문제를 우선 해결해야 하는가

## 핵심 관찰

### 시장 신호

- Product Hunt 2026-02-16 주간 보드에는 `Figr AI`가 `Product-aware AI that thinks through UX`로 소개되어 있다.
- 같은 주간 보드에는 `Boost.space v5`가 `Shared Context for your AI Agents & Automations`로, `Straion`이 `Manage Rules for AI Coding Agents`로 소개되어 있다.
- `Origami.chat`은 `Find your perfect leads with one prompt`라는 메시지로, 긴 조사 과정을 하나의 목표 지향 워크플로로 압축하는 수요를 보여준다.
- 같은 페이지의 Trending categories에는 `Vibe Coding Tools`, `AI notetakers`, `No-code Platforms`가 들어 있다.

### 해석

- 사용자는 단순 챗봇보다 `도메인 맥락을 알고`, `여러 단계를 한 번에 이어주며`, `출력을 바로 재사용할 수 있는` 에이전트를 선호하는 신호를 보인다.
- 특히 AI 코딩/제품 기획 영역에서는 다음 세 가지 수요가 겹친다.
  - 아이디어 탐색을 더 빠르게 하고 싶다.
  - 에이전트가 맥락을 잃지 않기를 원한다.
  - 결과를 설계 문서나 실행 계획 형태로 받고 싶다.

## 기회 후보

### 후보 A. Signal-to-Spec

- 설명:
  - 공개 시장 신호를 수집하고, 사용자 페르소나별 문제를 클러스터링한 뒤, 우선순위가 높은 웹앱 아이디어와 PRD 초안을 생성하는 에이전트
- 장점:
  - 아이디어 탐색과 설계 문서화가 한 워크플로로 연결된다.
  - `Figr AI`, `Origami.chat` 같은 최근 제품 신호와 맞닿아 있다.
- 리스크:
  - 시장 신호만으로 PMF를 과대평가할 수 있다.

### 후보 B. Shared Context Product Scout

- 설명:
  - 여러 데이터 소스와 작업 세션을 연결해, 반복적인 아이디어 검토와 문서 업데이트를 지원하는 에이전트
- 장점:
  - `Boost.space v5`의 shared context 수요와 맞다.
- 리스크:
  - 초기 MVP가 데이터 통합 제품처럼 무거워질 수 있다.

### 후보 C. Agent Governance for Product Discovery

- 설명:
  - 아이디어 조사/평가/문서화 에이전트의 규칙과 검토 과정을 관리하는 도구
- 장점:
  - `Straion`의 rules 관리 수요와 맞다.
- 리스크:
  - 실제 탐색 가치보다 운영 관리 가치가 먼저 와서 초기 사용자에게 덜 직관적일 수 있다.

## 추천 후보

추천은 `후보 A. Signal-to-Spec`이다.

### 추천 이유

- 문제 정의가 명확하다:
  - 사람들은 아이디어 탐색과 문서 초안 작성을 따로 한다.
- 결과물이 바로 쓸모 있다:
  - 아이디어 리스트가 아니라 설계 문서 초안까지 나온다.
- 최근 시장 신호와 자연스럽다:
  - product-aware AI, one prompt workflow, shared context 수요를 한 제품 가설로 묶을 수 있다.

## 초기 성공 기준

- 입력:
  - 관심 도메인, 타깃 사용자, 제약 조건
- 출력:
  - 우선순위가 매겨진 웹앱 아이디어 3~5개
  - 선택된 아이디어 1개에 대한 설계 문서 초안
- 품질 기준:
  - 아이디어 근거가 공개 신호와 연결된다.
  - 설계 문서에 사용자 문제, 핵심 워크플로, 데이터/도구 구조, 평가 계획이 포함된다.

## 한계와 반대 근거

- Product Hunt 노출은 관심 신호이지 결제 신호가 아니다.
- 공개 출시 신호는 maker community 편향이 있다.
- 따라서 이 조사 결과는 `초기 가설`로만 사용하고, 실제 고객 인터뷰나 결제 검증 전에는 확정 결론으로 쓰지 않는다.

## 사용 근거

- Product Hunt weekly leaderboard, week of February 16, 2026:
  - https://www.producthunt.com/leaderboard/weekly/2026/8/all
- Product Hunt Origami.chat page:
  - https://www.producthunt.com/products/origami-chat

