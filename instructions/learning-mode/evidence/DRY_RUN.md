# 학습 모드 드라이런 요약

## 드라이런 목적

`instructions/learning-mode` 하네스가 실제 학습 세션에서 아래 흐름을 재현하는지 확인한다.

- 목표와 수준 진단
- 단계적 설명
- 이해도 점검
- 자료 활용
- 최종 산출물 적용

샘플 주제는 `실제 사람들이 좋아할 수 있는 웹 애플리케이션 아이디어를 조사하고 설계 문서를 작성할 수 있는 AI 에이전트 개발`이다.

## 가정한 학습자 프로필

- 웹 애플리케이션과 제품 기획 문서에 대한 기본 이해는 있다.
- LLM API, 툴 호출, 에이전트 오케스트레이션은 낯설다.
- 최종적으로는 시장 신호를 바탕으로 아이디어를 고르고, 설계 문서를 쓰는 AI 에이전트의 MVP 설계를 직접 설명할 수 있어야 한다.

## 드라이런 결과

### 1. 진단

- 학습자의 강점:
  - 웹앱 아이디어와 사용자 문제를 제품 문서 형태로 정리하는 감각은 있다.
  - 문서형 산출물의 필요성은 이해한다.
- 학습자의 약점:
  - 에이전트의 역할 분해 기준이 없다.
  - `조사 결과를 그대로 답변`하는 시스템과 `구조화된 산출물을 만드는 에이전트`의 차이를 명확히 구분하지 못한다.
  - 평가와 가드레일을 나중 일로 미루려는 경향이 있다.

### 2. 단계 학습

- Step 1: 문제 정의와 에이전트 경계
  - 왜 이 에이전트가 필요한지, 단순 채팅과 어떻게 다른지 정리했다.
  - Product Hunt의 최근 신호를 바탕으로 `product-aware`, `shared context`, `rules/governance`, `one prompt workflow` 수요를 포착했다.
- Step 2: 워크플로와 출력 구조
  - OpenAI 공식 문서 기준으로 Responses API의 상태 관리, Structured Outputs, function calling의 역할을 분리했다.
  - 입력 자료 수집, 신호 클러스터링, 아이디어 스코어링, PRD 초안 생성으로 흐름을 나눴다.
- Step 3: 평가와 운영 안전장치
  - OpenAI Cookbook의 agent best practices를 참고해 모듈화, 명확한 도구 정의, 가드레일, tracing, eval을 설계 문서에 반영했다.

### 3. 이해도 점검

- 개방형 질문 1:
  - 왜 이 시스템은 단일 에이전트보다 역할 분해가 유리한가
- 개방형 질문 2:
  - 시장 신호 수집과 설계 문서 생성을 같은 출력 스키마로 처리하면 어떤 오류가 생기는가
- 개방형 질문 3:
  - 아이디어 추천이 좋아 보여도 바로 제품화하면 안 되는 이유는 무엇인가

이 질문들에 답하도록 유도하면서, 학습자가 `역할 분리`, `출력 구조`, `평가/가드레일`을 분리해서 설명할 수 있게 조정했다.

## 생성된 산출물

- [SAMPLE_IDEA_RESEARCH.md](./SAMPLE_IDEA_RESEARCH.md)
- [SAMPLE_AGENT_DESIGN.md](./SAMPLE_AGENT_DESIGN.md)
- [SAMPLE_LEARNING_LOG.md](./SAMPLE_LEARNING_LOG.md)

## 검증 판정

- 진단 기록 있음: 통과
- 질문 기반 단계 학습 3회 이상 있음: 통과
- 개방형 이해도 점검 2회 이상 있음: 통과
- 공식 문서와 실제 시장 신호 활용: 통과
- 최종 산출물 존재: 통과
- 다음 세션 재개 가능성: 통과

## 남은 한계

- 이 드라이런은 문서형 하네스 검증이며, 실제 런타임 자동화는 범위 밖이다.
- 시장성 판단은 Product Hunt 같은 공개 신호 기반의 초기 가설이며, 실제 결제 검증이나 인터뷰 데이터는 포함하지 않는다.

## 사용 근거

- ChatGPT Study Mode FAQ: https://help.openai.com/en/articles/11780217-chatgpt-study-mode-faq
- OpenAI Responses Overview: https://developers.openai.com/api/reference/responses/overview/
- OpenAI Responses migration differences: https://developers.openai.com/api/docs/guides/migrate-to-responses/
- OpenAI Structured Outputs guide: https://developers.openai.com/api/docs/guides/structured-outputs/
- OpenAI Cookbook, Best Practices When Building Agents: https://developers.openai.com/cookbook/examples/agents_sdk/multi-agent-portfolio-collaboration/multi_agent_portfolio_collaboration
- Product Hunt weekly leaderboard, week of February 16, 2026: https://www.producthunt.com/leaderboard/weekly/2026/8/all
