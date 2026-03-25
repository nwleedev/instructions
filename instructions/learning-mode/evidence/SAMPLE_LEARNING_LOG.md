# 샘플 학습 로그

## Session Goal

- 오늘의 학습 목표:
  - `시장 신호를 바탕으로 웹앱 아이디어를 고르고 설계 문서 초안을 만드는 AI 에이전트`를 어떻게 설계해야 하는지 이해한다.
- 최종 산출물:
  - 아이디어 조사 결과
  - 에이전트 설계 문서 초안

## Diagnosis

- 학습자가 알고 있던 것:
  - 웹앱 아이디어, PRD, 기본적인 사용자 문제 정의
- 학습자가 헷갈린 것:
  - 에이전트의 역할 분해 기준
  - function calling과 structured outputs의 차이
  - 조사 결과와 설계 문서의 경계
- 난이도 판단:
  - 제품 문서 초안은 작성 가능하지만 에이전트 시스템 설계는 중간 난이도 이상

## Step Log

### Step 1

- 다룬 개념:
  - 왜 이 문제를 단순 챗봇이 아니라 에이전트로 다루는가
- 사용한 질문:
  - `아이디어 추천만 하는 도구와 설계 문서까지 작성하는 도구의 차이는 무엇인가`
  - `어떤 순간에 맥락 손실이 가장 크게 발생하는가`
- 이해도 점검 결과:
  - 학습자는 `검색 + 요약`까지만 떠올렸고, 문서 구조와 후속 실행 연결을 별도 문제로 보지 못했다.
- 조정 사항:
  - Product Hunt 사례를 보여주며 `product-aware`, `shared context`, `rules` 수요를 분리해서 설명했다.

### Step 2

- 다룬 개념:
  - 도구 호출과 구조화 출력의 역할 분리
- 사용한 질문:
  - `외부 데이터를 가져오는 단계와 최종 아이디어 카드를 생성하는 단계는 왜 분리해야 하는가`
  - `왜 function calling과 structured outputs를 같은 용도로 쓰면 안 되는가`
- 이해도 점검 결과:
  - 학습자는 처음에 모든 출력을 단일 JSON으로 만들면 충분하다고 봤다.
- 조정 사항:
  - OpenAI Structured Outputs 가이드의 구분을 적용해,
    - 데이터/도구 연결은 function calling
    - 최종 응답 스키마는 structured `text.format`
    로 재설명했다.

### Step 3

- 다룬 개념:
  - 역할 분해, 가드레일, 평가
- 사용한 질문:
  - `한 에이전트가 수집, 해석, 문서화를 모두 하면 어디서 오류가 커질까`
  - `사람들이 좋아할 아이디어라는 판단을 어떤 지표 없이 믿으면 어떤 문제가 생길까`
- 이해도 점검 결과:
  - 학습자는 평가와 가드레일을 구현 후반 문제로 생각했다.
- 조정 사항:
  - OpenAI Cookbook의 agent best practices를 근거로 모듈화, clear tool definitions, guardrails, tracing, eval을 초기에 설계 문서에 넣도록 수정했다.

## Artifact Progress

- 지금까지 나온 산출물:
  - `Signal-to-Spec` 후보 아이디어
  - 시장 신호 기반 아이디어 조사 결과
  - MVP 설계 문서 초안
- 아직 부족한 항목:
  - 실제 사용자 인터뷰 데이터
  - 비용 추정
  - 프로덕션용 평가 세트

## Evidence Notes

- 사용한 핵심 출처:
  - ChatGPT Study Mode FAQ
  - OpenAI Responses / Structured Outputs / migration docs
  - OpenAI Cookbook agent best practices
  - Product Hunt weekly leaderboard
- 반대 근거 또는 한계:
  - Product Hunt는 관심 신호이지 구매 신호가 아니다.
  - 공개 시장 신호만으로 PMF를 확정할 수 없다.

## Next

- 다음 세션에서 이어야 할 질문:
  - 실제 사용자 인터뷰나 결제 실험을 어떤 단계에서 붙일 것인가
  - 아이디어 스코어링 기준을 어떻게 더 엄격하게 만들 것인가
- 즉시 실행할 작업:
  - 아이디어 카드 스키마와 설계 문서 스키마를 더 엄격하게 정의
  - 평가용 골든셋 초안 만들기

