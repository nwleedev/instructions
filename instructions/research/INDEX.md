# 조사 하네스 INDEX

이 문서는 Codex가 실무형 범용 조사 작업을 수행할 때 따라야 하는 기본 진입점이다.

## 목적

- 특정 서비스 사례에 끌려가지 않고, 다양한 실무 주제를 조사할 수 있는 공통 하네스를 제공한다.
- 컨텍스트 압축, 세션 재개, 도구 변경이 있어도 조사 품질과 기록 구조를 유지한다.
- 문서 템플릿을 강제형 틀이 아니라 선택형 모듈로 제공해 템플릿 경직성을 줄인다.

## 적용 대상

- 소프트웨어 아키텍처 조사
- 도구 및 상용 서비스 비교
- 운영 이슈 조사
- 제품/워크플로우 대체 가능성 평가
- 문서, 코드, 의존성, 표준, 보안, 성능 관련 사전 검토

## 조사 시작 전 필수 확인

1. `PLANS.md`에 조사 목적, 포함 범위, 범위 밖, 완료 기준이 있는지 확인한다.
2. 조사 결과를 어떤 산출물로 남길지 확인한다.
3. 세션 재개를 위해 `TICKETS.md`, `PROGRESS.md`, `RESEARCH.md`의 기록 방식이 준비되어 있는지 확인한다.
4. 외부 도구 사용 여부를 확인한다.
   - MCP는 선택 사항이다.
   - Tavily MCP는 예시 도구이지 필수 의존성이 아니다.

## Coverage Contract

- 단일 키워드 검색으로 끝내지 않는다.
- 모든 조사 주제는 아래 공통 축을 우선 검토한다.
  - 문제 적합성
  - 실제 사용 맥락 또는 운영 맥락
  - 제약과 실패 모드
  - 적용 가능성 또는 의사결정 영향
- 소프트웨어 관련 주제는 아래 확장 축을 추가 검토한다.
  - 비용 또는 성능 영향
  - 권한/보안 모델
  - 운영/관측 가능성
  - 구조 또는 구현 영향
- 비교 조사에서는 최소 2개 이상의 비교 축을 정의한다.
- 운영 이슈 조사에서는 증상, 재현 조건, 영향 범위, 추정 원인을 분리한다.

## 범용 Perspective Matrix

소프트웨어 주제가 아닐 수도 있으므로, 아래 관점은 고정 목록이 아니라 기본 후보군으로 사용한다.

- 문제 적합성
  - 이 도구나 서비스가 애초에 해결하려는 문제가 무엇인가
- 맥락 유지와 연속성
  - 긴 세션, 재개, 상태 보존, 압축 이후 연속성이 어떤가
- 조사 품질
  - 다양한 관점, 검색 폭, 출처 추적, 근거 검증이 가능한가
- 운영 사용성
  - 오래 쓸 때 느려지는지, 인터페이스 마찰이 있는지, 세션 이동이 쉬운지
- 통제 가능성
  - 사용자가 기록 구조, 템플릿, 도구, 승인 흐름을 제어할 수 있는가
- 확장 가능성
  - MCP, 외부 도구, 스크립트, 자동화와 연결 가능한가
- 한계와 실패 모드
  - 어떤 상황에서 품질이 떨어지거나 맥락이 무너지는가

규칙:
- 조사 주제마다 위 후보군 중 최소 4개를 선택한다.
- 소프트웨어 관련 주제라면 비용, 권한/보안, 운영/관측을 추가 관점으로 넣는다.
- 제품 대체 가능성 평가라면 `맥락 유지와 연속성`, `조사 품질`, `운영 사용성`, `통제 가능성`을 필수 관점으로 넣는다.

## Source Fallback Rule

1. 공식 문서
2. 표준 문서
3. 실제 소스 코드
4. 공개 이슈 트래커, 벤더 기술 자료, 보조 자료

규칙:
- 블로그 단독 근거로 결론 내리지 않는다.
- 제품 마케팅 문구는 사용 방식의 단서로만 쓰고, 기술적 결론은 공식 문서나 실제 코드로 보강한다.
- 최신성이 중요한 항목은 반드시 현재 시점 기준으로 다시 확인한다.

## Exploration Expansion Rule

- 첫 검색 결과가 한 방향으로만 몰리면 관점을 늘린다.
- 다음 중 2개 이상이 비어 있으면 조사 폭을 확장한다.
  - 실패 사례
  - 권한/보안 모델
  - 운영 및 관측 가능성
  - 비용/성능 트레이드오프
  - 실제 구성 예시

## Claim-to-Evidence Map

- 중요한 주장마다 근거를 분리해 기록한다.
- 하나의 근거로 여러 결론을 동시에 밀어붙이지 않는다.
- 고영향 주장은 가능하면 독립된 근거 2개 이상으로 보강한다.
- 근거 메모와 최종 결론을 같은 문단에 섞지 않는다.

## Question-to-Evidence Budget

- 핵심 질문마다 최소 증빙 예산을 배정한다.
- 기본 규칙:
  - 공식 문서 또는 1차 근거 1개 이상
  - 보강 근거 1개 이상
  - 최신성 확인 정보 1개 이상
- 최신성 확인 정보는 다음 중 하나를 포함한다.
  - 문서의 게시/수정 날짜
  - 제품/모델/라이브러리 버전
  - 현재 시점 재검색 사실
- 공식 문서가 존재하지 않는 주제라면 그 사실 자체를 기록하고, 왜 대체 근거를 썼는지 남긴다.
- 질문별 최소 증빙을 채우지 못한 경우에는 `미확정` 또는 `추가 조사 필요`로 표시한다.

## Contradiction Rule

- 주요 주장마다 반대 근거, 제한 사항, 불확실성 중 최소 1개를 기록한다.
- 반대 근거를 찾지 못했더라도 `현재 찾지 못함`과 검색 범위를 남긴다.
- 비교 조사에서는 각 비교 축마다 `이 축만 보면 오판할 수 있는 이유`를 한 줄 이상 기록한다.
- 제품/워크플로우 대체 평가에서는 `대체가 안 되는 영역`을 별도 항목으로 분리한다.

## 산출물 원칙

- 결과는 문서 + 템플릿으로 남긴다.
- 템플릿은 필수 섹션과 선택 섹션으로 나눈다.
- 선택 섹션은 주제에 맞을 때만 활성화한다.
- 템플릿에 맞추기 위해 조사 내용을 억지로 평탄화하지 않는다.

## 문서 순서

1. [ARCHITECTURE.md](/Users/nwlee/Desktop/instructions/instructions/research/ARCHITECTURE.md)
2. [ANTI_PATTERNS.md](/Users/nwlee/Desktop/instructions/instructions/research/ANTI_PATTERNS.md)
3. [VALIDATION.md](/Users/nwlee/Desktop/instructions/instructions/research/VALIDATION.md)
4. 템플릿
   - [PLANS-RESEARCH-TEMPLATE.md](/Users/nwlee/Desktop/instructions/instructions/research/templates/PLANS-RESEARCH-TEMPLATE.md)
   - [RESEARCH-ENTRY-TEMPLATE.md](/Users/nwlee/Desktop/instructions/instructions/research/templates/RESEARCH-ENTRY-TEMPLATE.md)
   - [CLAIM-MAP-TEMPLATE.md](/Users/nwlee/Desktop/instructions/instructions/research/templates/CLAIM-MAP-TEMPLATE.md)

## 설계 근거

- OpenAI Responses API 개요는 상태 유지형 상호작용과 도구 확장을 전제로 한다.
  - https://developers.openai.com/api/reference/responses/overview
- OpenAI Codex App Server 문서는 `thread/start`, `thread/resume`, `thread/compact/start`, `contextCompaction` 이벤트를 제공한다.
  - https://developers.openai.com/codex/app-server/
- Model Context Protocol 문서는 민감한 작업에 대한 사용자 확인, 입력 표시, 결과 검증, 감사 로그를 권장한다.
  - https://modelcontextprotocol.io/docs/concepts/tools
- Tavily MCP 문서는 검색, 추출, 도메인 제한 검색, 뉴스 검색 같은 조사 보강 패턴을 예시로 제시한다.
  - https://docs.tavily.com/documentation/mcp
