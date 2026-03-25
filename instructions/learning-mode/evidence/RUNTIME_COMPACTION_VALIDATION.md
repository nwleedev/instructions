# 학습 모드 런타임 compaction 검증

이 문서는 `portable core`의 필수 규칙 문서가 아니라 현재 저장소의 `local evidence pack`에 속한 런타임 검증 기록이다.

새 프로젝트에서는 동일한 이벤트와 복원 필드를 관측하는 자체 런타임 증빙을 새로 만드는 편이 맞다.

## 목적

문서형 재개 검증이 실제 Codex App Server의 `thread/compact/start` 이후에도 같은 수준으로 유지되는지 확인한다. 이 문서는 실제 app-server 이벤트와 compaction 이후 후속 턴의 상태 복원 결과를 기록한다.

## 검증 기준

아래를 모두 만족하면 통과로 본다.

- `thread/compact/start` 요청이 실제로 수락된다.
- `contextCompaction` 아이템의 `item/started`와 `item/completed`가 관측된다.
- compaction 뒤 후속 턴에서 이전 상태의 핵심 필드가 복원된다.
- 문서형 재개 검증에서 요구한 `목표`, `오개념`, `산출물 상태`, `다음 단계`가 후속 턴에서 다시 드러난다.

## 사용한 공식 근거

- OpenAI Codex App Server API overview:
  - `thread/resume`, `thread/compact/start`가 공식 API로 문서화되어 있다.
- OpenAI Codex App Server trigger-thread-compaction section:
  - `thread/compact/start`는 즉시 `{}`를 반환하고, 같은 `threadId`에서 `contextCompaction` 아이템 lifecycle이 흘러온다고 설명한다.

출처:

- https://developers.openai.com/codex/app-server/
- https://developers.openai.com/codex/app-server/#trigger-thread-compaction

## 실제 프로브 환경

- 도구:
  - `codex app-server --listen stdio://`
- 작업 디렉터리:
  - `/Users/nwlee/.codex/memories/runtime-compaction-clean`
- 이유:
  - 저장소 내부 경로에서는 상위 `AGENTS.md`와 프로젝트 지침이 자동 반영되어 순수 상태 복원 시험에 잡음이 생겼다.
  - 따라서 레포 밖의 허용 경로에서 최소 JSON-RPC 프로브를 수행했다.

위 경로는 현재 저장소에서 사용한 예시일 뿐, portable core의 필수 요건은 아니다. 중요한 점은 `저장소 전용 지침이 섞이지 않는 깨끗한 cwd`를 별도로 확보했다는 사실이다.

## 실제 요청 흐름

1. `initialize`
2. `thread/start`
3. `turn/start`
   - 학습 상태를 명시적으로 저장하도록 요청
   - 저장된 필드:
     - Goal
     - Misconception
     - Artifact status
     - Next step
4. `thread/compact/start`
5. compaction 완료 후 `turn/start`
   - 이전 상태를 4줄 형식으로 복원하도록 요청

## 관측 결과

### 1. compaction 이벤트 자체

- `thread/compact/start` 요청은 즉시 `{}`를 반환했다.
- 같은 `threadId`에서 아래 이벤트가 순서대로 관측됐다.
  - `turn/started`
  - `item/started` with `type: "contextCompaction"`
  - `item/completed` with `type: "contextCompaction"`
  - `thread/compacted`
  - `turn/completed`

### 2. compaction 뒤 상태 복원

compaction 이후 후속 턴에서 모델은 아래 4개 필드를 모두 복원했다.

- Goal:
  - `explain what a p-value does and does not mean`
- Misconception:
  - `the learner thinks a p-value is the probability the null hypothesis is true`
- Artifact status:
  - `draft memo exists but the next-action line is missing`
- Next step:
  - `write one sentence explaining why statistical significance is not the same as practical importance`

## 판정

- 실제 app-server 수준의 `contextCompaction` 이벤트 관측: 통과
- compaction 뒤 핵심 상태 복원: 통과
- 문서형 재개 검증과 실제 런타임 재개 사이의 핵심 주장 일치: 통과

## 문서형 검증과의 차이

- 문서형 검증은 `학습 로그 + RESEARCH + PROGRESS`를 사람이 다시 읽는 구조다.
- 런타임 검증은 app-server가 내부적으로 compaction한 뒤 후속 턴이 상태를 얼마나 유지하는지 본다.
- 두 검증은 성격이 다르지만, 핵심 복원 필드가 같다는 점에서 서로 보완적이다.

## 확인된 보강 포인트

- 학습 로그에 `다음에 바로 재개할 가장 작은 단계`를 남긴 선택은 유효했다.
- 런타임 검증을 할 때는 저장소 내부 경로보다 지침 간섭이 적은 깨끗한 cwd가 더 적합하다.

## 남은 한계

- 이번 검증은 작은 수동 JSON-RPC 프로브 1건이다.
- 실제 장기 학습 세션처럼 여러 턴과 더 큰 문맥을 누적한 뒤 compaction하는 시나리오는 후속 확인이 가능하다.
- `thread/resume`까지 포함한 별도 프로브는 아직 하지 않았다.
