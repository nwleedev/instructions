# 학습 모드 구현 가능성 검토 보고서

이 문서는 `portable core`의 필수 규칙 문서가 아니라 현재 저장소의 `local evidence pack`에 속한 검토 보고서다.

새 프로젝트에 `learning-mode`를 붙일 때 이 문서를 필수로 복사할 필요는 없으며, 필요하다면 해당 프로젝트 기준의 검토 보고서로 다시 작성한다.

## 결론

Codex에서 ChatGPT Study Mode와 `학습 성과 동등성` 수준의 학습 모드를 구현하는 것은 가능하다. 다만 이는 ChatGPT의 제품 UI와 내부 토글을 복제한다는 뜻이 아니라, 목표/수준 진단, 단계적 설명, 이해도 점검, 자료 활용, 산출물 적용, 세션 재개를 문서 하네스와 세션 운영 규칙으로 재현한다는 뜻이다.

## 왜 가능하다고 보는가

1. Study Mode 자체가 특수 모델이 아니라 학습 지향 동작 묶음으로 설명된다.
   - OpenAI는 Study Mode를 목표와 수준을 묻고, 질문 기반으로 단계적으로 안내하며, 이해도를 점검하는 학습 경험으로 설명한다.
   - 또한 2025-07-29 릴리스 노트는 이 동작이 커스텀 시스템 지침 기반이며 아직 일관성 한계가 있다고 밝힌다.
2. Codex는 세션 보존과 재개에 강하다.
   - Codex App Server는 `thread/resume`과 `thread/compact/start`를 제공한다.
   - 이 저장소는 별도로 `PLANS.md`, `TICKETS.md`, `PROGRESS.md`, `RESEARCH.md`, `DECISIONS.md`를 통해 장기 맥락을 파일로 유지한다.
3. 학습 하네스는 제품 기능보다 절차 설계가 중요하다.
   - 학습 성과 동등성을 목표로 하면, 핵심은 UI가 아니라 진단, 설명 순서, 이해도 점검, 적용 과제, 회고 구조다.
4. 학습 결과를 실제 산출물로 연결할 수 있다.
   - Codex는 조사, 문서 작성, 코드/설계 초안 작성까지 한 워크플로 안에서 처리할 수 있어 학습 종료 조건을 `실제 결과물`로 둘 수 있다.
5. 동일한 학습 루프가 다른 도메인에도 유지된다.
   - 첫 번째 드라이런은 AI 에이전트 설계처럼 IT 인접 주제를 다루고, 두 번째 드라이런은 `가설검정과 실험 해석`처럼 도메인 일반적인 학습 주제를 다룬다.
   - 두 경우 모두 진단, 단계적 설명, 개방형 이해도 점검, 최종 산출물 적용 구조가 유지된다.
6. 반복 사용을 위한 운영 기준을 명시할 수 있다.
   - 두 드라이런을 비교해 주제 조건, 학습자 수준별 분기, `research` 병행 조건, 세션 재개 질문을 체크리스트로 정리할 수 있다.
   - 이는 세 번째 주제를 무작정 추가하기 전에 어떤 조건에서 현재 하네스를 그대로 재사용할 수 있는지 보여준다.
7. 조사 의존성이 큰 비IT 주제도 보조 하네스와 함께 다룰 수 있다.
   - 세 번째 드라이런은 GHG Protocol과 EPA 공식 자료를 먼저 조사 하네스로 정리한 뒤 학습 루프로 재배열했다.
   - 이 결과 `learning-mode`는 단독 만능이 아니라, 필요 시 `research`를 앞단에 두는 상위 하네스로 작동한다는 점이 더 명확해졌다.
8. 학습자 수준이 낮아질 때 단계 크기를 줄이는 방식도 문서화할 수 있다.
   - 같은 통계 해석 주제를 완전 초심자 프로필로 다시 돌리자, 용어보다 오해 방지에 집중하고 산출물을 짧은 체크메모로 줄이는 편이 적합했다.
   - 이는 `learning-mode`가 주제만이 아니라 학습자 수준에 따라도 분기할 수 있음을 보여준다.
9. 문서형 재개 검증이 실제 런타임 compaction과도 연결된다.
   - 실제 app-server에 `thread/compact/start`를 보내 `contextCompaction` 아이템 lifecycle을 확인했고, 후속 턴에서 핵심 상태를 복원했다.
   - 따라서 이 하네스의 세션 보존 주장은 문서 설계 차원에만 머물지 않고 실제 런타임 흐름과도 맞물린다.

## 어디까지는 어렵거나 범위 밖인가

- ChatGPT의 제품 UI 토글과 동일한 사용 경험
- Projects 내부에서의 Study Mode 제약/동작 복제
- 파일 업로드 UX와 메모리 기능의 제품 수준 복제
- 런타임 자동화나 새 제품 기능 개발

## 구현 전략

1. 새 `instructions/learning-mode` 하네스를 만든다.
2. 공식 Study Mode 설명을 학습 루프로 재구성한다.
3. `research` 하네스를 보조 계층으로 재사용한다.
4. 샘플 주제로 실제 드라이런을 수행한다.
5. 드라이런 산출물과 학습 로그를 통해 하네스가 작동하는지 검증한다.

## 여러 프로젝트에 복사할 때의 원칙

- `learning-mode`의 성능을 유지하려면 코어 문서와 저장소 전용 증빙을 분리해야 한다.
- 코어는 역할, 단계, 금지 패턴, 고위험 경계, 일반 검증 규칙처럼 안정적인 부분만 포함해야 한다.
- 프로젝트마다 달라지는 세션 문서 구조, discovery 연결, 검증 명령은 adapter 문서에서만 처리해야 한다.
- 현재 저장소의 드라이런과 런타임 검증은 `local evidence pack`으로 남기고, 새 프로젝트에서는 해당 프로젝트의 local evidence를 새로 만들어야 한다.

## 현재 판단의 한계

- ChatGPT 내부 시스템 지침이나 비공개 랭킹 로직은 직접 확인할 수 없다.
- 따라서 `동일한 내부 구현`이 아니라 `학습 성과와 워크플로의 실질적 동등성` 기준으로만 판단해야 한다.
- 메모리, 파일 업로드, 모델 선택 같은 제품 기능은 사용자 환경에 따라 차이가 난다.
- 현재 검증은 문서형 드라이런 6건, 문서형 재개 검증 1건, 실제 런타임 compaction 검증 1건, 고위험 주제 경계 검증 1건 기준이다.
- 고위험 주제에서는 투자 concept-only 드라이런 1건과 의료 정보 읽기 드라이런 1건으로 경계 규칙이 실제 질문 흐름과 산출물에서도 유지됨을 확인했다.
- portable core 관점에서는 위 검증 묶음이 필수 규칙이 아니라 현재 저장소의 `local evidence pack`이다.
- 따라서 새 프로젝트에서는 이 증빙을 복사하기보다, 코어 + adapter를 먼저 붙이고 해당 프로젝트의 대표 주제로 local evidence를 다시 만드는 편이 맞다.

## 핵심 근거

- Study Mode FAQ: https://help.openai.com/en/articles/11780217-chatgpt-study-mode-faq
- ChatGPT Release Notes: https://help.openai.com/en/articles/6825453-chatgpt-user-guide
- OpenAI product post, 2026-03-10: https://openai.com/index/new-ways-to-learn-math-and-science-in-chatgpt/
- Responses Overview: https://developers.openai.com/api/reference/responses/overview/
- Codex App Server API overview: https://developers.openai.com/codex/app-server/
- OpenAI Safety best practices: https://developers.openai.com/api/docs/guides/safety-best-practices/
- OpenAI Safety in building agents: https://developers.openai.com/api/docs/guides/agent-builder-safety/
