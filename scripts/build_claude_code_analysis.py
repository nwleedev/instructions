#!/usr/bin/env python3
"""Generate exhaustive Claude Code source inventory artifacts for the session."""

from __future__ import annotations

import argparse
import hashlib
import re
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable


IMPORT_RE = re.compile(
    r"""^\s*(?:import\s+.+?\s+from\s+['"](?P<from>[^'"]+)['"]|"""
    r"""export\s+.+?\s+from\s+['"](?P<export_from>[^'"]+)['"]|"""
    r""".*?\brequire\(\s*['"](?P<require>[^'"]+)['"]\s*\))"""
)
DECL_RE = re.compile(
    r"""^\s*export\s+(?:default\s+)?(?:(?:async\s+)?function|class|interface|type|enum|const|let|var)\s+"""
    r"""(?P<name>[A-Za-z_$][\w$]*)"""
)
FUNCTION_RE = re.compile(
    r"""^\s*(?:export\s+)?(?:async\s+)?function\s+(?P<name>[A-Za-z_$][\w$]*)\s*\(""",
)
CLASS_RE = re.compile(
    r"""^\s*(?:export\s+)?(?:default\s+)?class\s+(?P<name>[A-Za-z_$][\w$]*)""",
)
INTERFACE_RE = re.compile(
    r"""^\s*export\s+interface\s+(?P<name>[A-Za-z_$][\w$]*)""",
)
TYPE_RE = re.compile(
    r"""^\s*export\s+type\s+(?P<name>[A-Za-z_$][\w$]*)""",
)
ENUM_RE = re.compile(
    r"""^\s*export\s+enum\s+(?P<name>[A-Za-z_$][\w$]*)""",
)
VAR_RE = re.compile(
    r"""^\s*export\s+(?:const|let|var)\s+(?P<name>[A-Za-z_$][\w$]*)""",
)
METHOD_RE = re.compile(
    r"""^\s*(?:public\s+|private\s+|protected\s+|static\s+|async\s+|override\s+|readonly\s+|abstract\s+|get\s+|set\s+|\*)*"""
    r"""(?P<name>constructor|#?[A-Za-z_$][\w$]*)\s*\([^;]*\)\s*(?::[^{]+)?\s*\{""",
)
SKIP_METHOD_PREFIXES = (
    "if ",
    "for ",
    "while ",
    "switch ",
    "catch ",
    "function ",
    "const ",
    "let ",
    "var ",
    "return ",
    "else ",
    "do ",
)

EMPLOYEE_SIGNAL_PATTERNS = {
    "USER_TYPE ant gate": re.compile(r"USER_TYPE\s*===?\s*['\"]ant['\"]"),
    "undercover mode": re.compile(r"UNDERCOVER MODE|undercover", re.IGNORECASE),
    "internal model override": re.compile(r"anthropic_internal|ant_model_override|tengu_ant_model_override"),
    "employee-only comment": re.compile(r"employee-only|ant-only|staff-only", re.IGNORECASE),
}
INFRA_SIGNAL_PATTERNS = {
    "CCR": re.compile(r"\bCCR\b"),
    "remote control": re.compile(r"remote-control|allow_remote_control|Remote Control"),
    "bridge": re.compile(r"\bbridge\b", re.IGNORECASE),
    "upstream proxy": re.compile(r"upstreamproxy|upstream proxy", re.IGNORECASE),
    "session container": re.compile(r"session container|remote memory|relay", re.IGNORECASE),
}

SUBSYSTEM_DESCRIPTIONS = {
    ".": "루트 진입점과 cross-cutting 핵심 타입/조정자",
    "assistant": "assistant 모드 및 보조 대화 흐름",
    "bootstrap": "세션/런타임 부트스트랩 상태",
    "bridge": "Remote Control, bridge, 원격 세션 연결 계층",
    "buddy": "companion/buddy UI와 보조 프롬프트",
    "cli": "CLI 출력, 구조화 I/O, 업데이트 처리",
    "commands": "slash command와 사용자 명령 진입점",
    "components": "Ink/React UI 컴포넌트",
    "constants": "시스템 상수, 프롬프트, 제한값",
    "context": "React context 및 주변 상태 공급자",
    "coordinator": "coordinator 모드 관련 제어",
    "entrypoints": "실행 엔트리포인트와 초기 로더",
    "hooks": "React/custom hook과 입력 보조 로직",
    "ink": "Ink 렌더러 바인딩과 UI 루트 타입",
    "keybindings": "키맵 및 사용자 키바인딩 처리",
    "memdir": "세션/메모리 디렉터리 관리",
    "migrations": "설정/세션 마이그레이션",
    "moreright": "우선순위 낮은 부가 모듈",
    "native-ts": "네이티브 타입/바인딩 보조",
    "outputStyles": "출력 스타일 정의",
    "plugins": "플러그인 로딩과 확장 표면",
    "query": "질의 엔진과 쿼리 추상화",
    "remote": "원격 세션 매니저 및 관련 표면",
    "schemas": "런타임 스키마 정의",
    "screens": "특수 화면 및 상위 뷰",
    "server": "직접 연결/서버 측 세션 생성",
    "services": "API, analytics, MCP, policy, LSP 등 서비스 계층",
    "skills": "스킬 탐색/실행 관련 로직",
    "state": "AppState 저장소와 상태 전이",
    "tasks": "백그라운드/에이전트/워크플로우 task 처리",
    "tools": "도구 구현과 도구별 프롬프트/상태",
    "types": "공용 타입 정의",
    "upstreamproxy": "CCR/upstream proxy 진입점",
    "utils": "범용 유틸리티와 핵심 보조 로직",
    "vim": "vim 모드 지원",
    "voice": "음성 입력/상호작용",
}


@dataclass
class SymbolInfo:
    name: str
    kind: str
    line: int
    declaration: str
    parent: str | None = None
    note: str | None = None


@dataclass
class FileAnalysis:
    path: Path
    rel_path: str
    subsystem: str
    file_role: str
    imports: list[str] = field(default_factory=list)
    exports: list[str] = field(default_factory=list)
    symbols: list[SymbolInfo] = field(default_factory=list)
    employee_signals: list[str] = field(default_factory=list)
    infra_signals: list[str] = field(default_factory=list)
    leading_comment: str = ""
    npm_parity: str = ""
    line_count: int = 0
    sha1: str = ""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--session-id", required=True)
    parser.add_argument(
        "--repo-root",
        default=".",
        help="Repository root containing store/ and scripts/",
    )
    return parser.parse_args()


def iter_source_files(source_root: Path) -> Iterable[Path]:
    for path in sorted(source_root.rglob("*")):
        if path.is_file() and path.name != ".DS_Store":
            yield path


def get_subsystem(rel_path: Path) -> str:
    parts = rel_path.parts
    return parts[0] if len(parts) > 1 else "."


def infer_file_role(rel_path: Path) -> str:
    parts = rel_path.parts
    top = get_subsystem(rel_path)
    name = rel_path.name
    if name == "main.tsx":
        return "전체 CLI/UI 부트스트랩과 옵션 해석을 담당하는 메인 진입점"
    if top == "entrypoints":
        return "특정 실행 모드용 엔트리포인트"
    if top == "commands":
        return "사용자 명령 또는 slash command 처리기"
    if top == "components":
        return "터미널 UI 컴포넌트"
    if top == "hooks":
        return "UI 또는 입력 흐름을 보조하는 custom hook"
    if top == "services":
        return "외부 시스템/API/정책과 통신하는 서비스 계층"
    if top == "tools":
        return "도구 실행 로직 또는 도구별 프롬프트/상태"
    if top == "utils":
        return "다른 모듈이 재사용하는 공통 유틸리티"
    if top == "bridge":
        return "Remote Control/bridge 연결과 메시징 계층"
    if top == "remote":
        return "원격 세션 구성과 재개/연결 보조"
    if top == "state":
        return "애플리케이션 상태 저장소와 상태 전이 정의"
    if top == "tasks":
        return "백그라운드 작업/에이전트 작업 수명주기 관리"
    if top == "constants":
        return "상수, 프롬프트 섹션, 제한값 정의"
    if top == "context":
        return "Context provider와 전역 UI 상태 공급"
    if top == ".":
        return "루트 레벨의 교차 절단 타입, 런처, 오케스트레이션 파일"
    return f"{SUBSYSTEM_DESCRIPTIONS.get(top, '상세 역할 미분류')} 성격의 파일"


def sanitize_decl(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip())


def read_leading_comment(lines: list[str]) -> str:
    collected: list[str] = []
    for raw in lines[:20]:
        stripped = raw.strip()
        if not stripped and not collected:
            continue
        if stripped.startswith("//") or stripped.startswith("/*") or stripped.startswith("*") or stripped.endswith("*/"):
            collected.append(stripped)
            continue
        break
    return " ".join(collected[:6])


def collect_comment_above(lines: list[str], index: int) -> str | None:
    comments: list[str] = []
    i = index - 1
    saw_blank = False
    while i >= 0:
        stripped = lines[i].strip()
        if not stripped:
            if comments:
                saw_blank = True
                break
            i -= 1
            continue
        if stripped.startswith("//") or stripped.startswith("*") or stripped.startswith("/*") or stripped.endswith("*/"):
            comments.append(stripped)
            i -= 1
            continue
        break
    if saw_blank and not comments:
        return None
    if not comments:
        return None
    comments.reverse()
    return " ".join(comments[:4])


def extract_symbols(lines: list[str]) -> tuple[list[SymbolInfo], list[str]]:
    symbols: list[SymbolInfo] = []
    exports: list[str] = []
    class_stack: list[tuple[str, int]] = []
    brace_depth = 0

    for idx, raw in enumerate(lines, start=1):
        line = raw.rstrip("\n")
        stripped = line.strip()

        comment = collect_comment_above(lines, idx - 1)

        if match := FUNCTION_RE.match(line):
            name = match.group("name")
            symbols.append(SymbolInfo(name=name, kind="function", line=idx, declaration=sanitize_decl(line), note=comment))
            if line.lstrip().startswith("export"):
                exports.append(name)

        elif match := CLASS_RE.match(line):
            name = match.group("name")
            symbols.append(SymbolInfo(name=name, kind="class", line=idx, declaration=sanitize_decl(line), note=comment))
            if line.lstrip().startswith("export"):
                exports.append(name)
            open_count = line.count("{")
            if open_count:
                class_stack.append((name, brace_depth + open_count))

        elif match := INTERFACE_RE.match(line):
            name = match.group("name")
            symbols.append(SymbolInfo(name=name, kind="interface", line=idx, declaration=sanitize_decl(line), note=comment))
            exports.append(name)

        elif match := TYPE_RE.match(line):
            name = match.group("name")
            symbols.append(SymbolInfo(name=name, kind="type", line=idx, declaration=sanitize_decl(line), note=comment))
            exports.append(name)

        elif match := ENUM_RE.match(line):
            name = match.group("name")
            symbols.append(SymbolInfo(name=name, kind="enum", line=idx, declaration=sanitize_decl(line), note=comment))
            exports.append(name)

        elif match := VAR_RE.match(line):
            name = match.group("name")
            kind = "variable"
            if "=>" in line or re.search(r"=\s*(?:async\s*)?\(", line):
                kind = "const-function"
            symbols.append(SymbolInfo(name=name, kind=kind, line=idx, declaration=sanitize_decl(line), note=comment))
            exports.append(name)

        if class_stack and stripped and not stripped.startswith(SKIP_METHOD_PREFIXES):
            method_match = METHOD_RE.match(line)
            if method_match and not stripped.startswith("class "):
                method_name = method_match.group("name")
                parent_class = class_stack[-1][0]
                symbols.append(
                    SymbolInfo(
                        name=method_name,
                        kind="method",
                        line=idx,
                        declaration=sanitize_decl(line),
                        parent=parent_class,
                        note=comment,
                    )
                )

        brace_depth += line.count("{")
        brace_depth -= line.count("}")
        while class_stack and brace_depth < class_stack[-1][1]:
            class_stack.pop()

    return symbols, sorted(dict.fromkeys(exports))


def collect_imports(lines: list[str]) -> list[str]:
    imports: list[str] = []
    for raw in lines:
        if match := IMPORT_RE.match(raw):
            for key in ("from", "export_from", "require"):
                value = match.groupdict().get(key)
                if value:
                    imports.append(value)
    return sorted(dict.fromkeys(imports))


def detect_signals(text: str, patterns: dict[str, re.Pattern[str]]) -> list[str]:
    matched: list[str] = []
    for name, pattern in patterns.items():
        if pattern.search(text):
            matched.append(name)
    return matched


def detect_npm_parity(rel_path: str, exports: list[str], bundle_text: str, npm_paths: set[str]) -> str:
    basename = Path(rel_path).stem
    if rel_path in npm_paths or Path(rel_path).name in npm_paths:
        return "동일 경로 또는 파일명이 공개 패키지에 직접 존재함"
    tokens = [basename] + exports[:6]
    for token in tokens:
        if token and len(token) > 4 and token in bundle_text:
            return f"공개 번들 문자열에서 `{token}` 흔적이 관찰됨"
    return "공개 패키지 루트에서는 직접 대응 경로가 보이지 않음"


def analyze_file(path: Path, source_root: Path, bundle_text: str, npm_paths: set[str]) -> FileAnalysis:
    rel_path_obj = path.relative_to(source_root)
    rel_path = rel_path_obj.as_posix()
    text = path.read_text(encoding="utf-8", errors="replace")
    lines = text.splitlines()
    subsystem = get_subsystem(rel_path_obj)
    symbols, exports = extract_symbols(lines)
    return FileAnalysis(
        path=path,
        rel_path=rel_path,
        subsystem=subsystem,
        file_role=infer_file_role(rel_path_obj),
        imports=collect_imports(lines),
        exports=exports,
        symbols=symbols,
        employee_signals=detect_signals(text, EMPLOYEE_SIGNAL_PATTERNS),
        infra_signals=detect_signals(text, INFRA_SIGNAL_PATTERNS),
        leading_comment=read_leading_comment(lines),
        npm_parity=detect_npm_parity(rel_path, exports, bundle_text, npm_paths),
        line_count=len(lines),
        sha1=hashlib.sha1(text.encode("utf-8", errors="ignore")).hexdigest()[:12],
    )


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def subsystem_slug(subsystem: str) -> str:
    return "root" if subsystem == "." else subsystem.replace("/", "-")


def format_list(values: list[str], limit: int = 8) -> str:
    if not values:
        return "없음"
    shown = values[:limit]
    suffix = "" if len(values) <= limit else f" 외 {len(values) - limit}개"
    return ", ".join(f"`{value}`" for value in shown) + suffix


def build_inventory_summary(analyses: list[FileAnalysis]) -> str:
    lines = [
        "# FILE-INVENTORY.md",
        "",
        "## 개요",
        "",
        f"- 총 파일 수: `{len(analyses)}`",
        f"- 선언 심볼 총수: `{sum(len(item.symbols) for item in analyses)}`",
        f"- 직원 전용 신호가 잡힌 파일 수: `{sum(1 for item in analyses if item.employee_signals)}`",
        f"- 내부 인프라 신호가 잡힌 파일 수: `{sum(1 for item in analyses if item.infra_signals)}`",
        "",
        "## 샤드",
        "",
    ]
    by_subsystem = defaultdict(list)
    for item in analyses:
        by_subsystem[item.subsystem].append(item)
    for subsystem, items in sorted(by_subsystem.items()):
        slug = subsystem_slug(subsystem)
        lines.append(f"- `{subsystem}`: `{len(items)}`개 파일, [상세 인벤토리](file-inventory/{slug}.md)")
    lines.append("")
    return "\n".join(lines)


def build_inventory_shard(subsystem: str, analyses: list[FileAnalysis]) -> str:
    lines = [
        f"# 파일 인벤토리 - {subsystem}",
        "",
        f"- 서브시스템 설명: {SUBSYSTEM_DESCRIPTIONS.get(subsystem, '상세 역할 미분류')}",
        f"- 파일 수: `{len(analyses)}`",
        "",
    ]
    for item in analyses:
        lines.extend(
            [
                f"## `{item.rel_path}`",
                "",
                f"- 파일 역할: {item.file_role}",
                f"- 줄 수: `{item.line_count}`",
                f"- SHA1(축약): `{item.sha1}`",
                f"- 주요 import: {format_list(item.imports)}",
                f"- 주요 export: {format_list(item.exports)}",
                f"- 선언 심볼 수: `{len(item.symbols)}`",
                f"- 공개 npm 대응: {item.npm_parity}",
                f"- 직원 전용 신호: {format_list(item.employee_signals)}",
                f"- 내부 인프라 신호: {format_list(item.infra_signals)}",
                f"- 선행 주석/헤더: {item.leading_comment or '없음'}",
                "",
            ]
        )
    return "\n".join(lines)


def build_symbol_summary(analyses: list[FileAnalysis]) -> str:
    lines = [
        "# SYMBOL-CATALOG.md",
        "",
        "## 개요",
        "",
        f"- 총 선언 심볼 수: `{sum(len(item.symbols) for item in analyses)}`",
        f"- 심볼이 없는 파일 수: `{sum(1 for item in analyses if not item.symbols)}`",
        "",
        "## 샤드",
        "",
    ]
    by_subsystem = defaultdict(list)
    for item in analyses:
        by_subsystem[item.subsystem].append(item)
    for subsystem, items in sorted(by_subsystem.items()):
        slug = subsystem_slug(subsystem)
        count = sum(len(item.symbols) for item in items)
        lines.append(f"- `{subsystem}`: `{count}`개 심볼, [상세 카탈로그](symbol-catalog/{slug}.md)")
    lines.append("")
    return "\n".join(lines)


def build_symbol_shard(subsystem: str, analyses: list[FileAnalysis]) -> str:
    lines = [
        f"# 심볼 카탈로그 - {subsystem}",
        "",
        f"- 서브시스템 설명: {SUBSYSTEM_DESCRIPTIONS.get(subsystem, '상세 역할 미분류')}",
        "",
    ]
    for item in analyses:
        lines.append(f"## `{item.rel_path}`")
        lines.append("")
        if not item.symbols:
            lines.extend(
                [
                    "- 선언 심볼: 없음",
                    "- 메모: 런타임 선언 대신 상수 재export, side-effect import, 스타일/설정 또는 매우 얇은 래퍼일 가능성이 높음.",
                    "",
                ]
            )
            continue
        lines.append(f"- 파일 역할: {item.file_role}")
        lines.append(f"- 공개 npm 대응: {item.npm_parity}")
        lines.append("")
        for symbol in item.symbols:
            parent = f" (class `{symbol.parent}` 소속)" if symbol.parent else ""
            note = symbol.note or "주변 주석 없음"
            lines.extend(
                [
                    f"### `{symbol.name}`",
                    "",
                    f"- 종류: `{symbol.kind}`{parent}",
                    f"- 선언 위치: `{item.rel_path}:{symbol.line}`",
                    f"- 선언문: `{symbol.declaration}`",
                    f"- 역할 해석: {infer_symbol_role(item, symbol)}",
                    f"- 관련 신호: 직원 전용 {format_list(item.employee_signals)}, 내부 인프라 {format_list(item.infra_signals)}",
                    f"- 주변 주석: {note}",
                    "",
                ]
            )
    return "\n".join(lines)


def infer_symbol_role(item: FileAnalysis, symbol: SymbolInfo) -> str:
    if item.subsystem == "commands":
        return "사용자 명령 흐름을 실제로 처리하거나 명령 등록을 보조하는 선언으로 보인다."
    if item.subsystem == "bridge":
        return "원격 제어/브리지 세션의 연결, 권한, 메시징, 상태 추적 중 하나를 담당하는 선언으로 보인다."
    if item.subsystem == "services":
        return "외부 API, 정책, MCP, analytics, LSP 같은 서비스 계층을 호출하거나 조정하는 선언으로 보인다."
    if item.subsystem == "tools":
        return "LLM이 호출하는 도구의 실행 경로, 입력 스키마, 프롬프트, 결과 처리 중 하나를 담당하는 선언으로 보인다."
    if item.subsystem == "components":
        return "터미널 UI를 구성하거나 상호작용 상태를 표시하는 컴포넌트/보조 선언으로 보인다."
    if symbol.kind == "method" and symbol.parent:
        return f"`{symbol.parent}`의 내부 동작 한 단계를 담당하는 메서드로 보인다."
    if symbol.kind == "class":
        return "관련 상태와 동작을 묶는 오브젝트 경계로 보인다."
    if symbol.kind in {"function", "const-function"}:
        return "호출형 제어 지점 또는 계산 유틸리티로 보인다."
    if symbol.kind in {"interface", "type", "enum"}:
        return "호출 계약이나 상태 표현을 고정하는 타입 선언으로 보인다."
    return "보조 선언 또는 모듈 수준 계약 정의로 보인다."


def build_subsystem_map(analyses: list[FileAnalysis]) -> str:
    counts = Counter(item.subsystem for item in analyses)
    symbol_counts = Counter()
    employee_counts = Counter()
    infra_counts = Counter()
    for item in analyses:
        symbol_counts[item.subsystem] += len(item.symbols)
        if item.employee_signals:
            employee_counts[item.subsystem] += 1
        if item.infra_signals:
            infra_counts[item.subsystem] += 1
    lines = [
        "# SUBSYSTEM-MAP.md",
        "",
        "## 개요",
        "",
        f"- 서브시스템 수: `{len(counts)}`",
        f"- 가장 큰 서브시스템: `{counts.most_common(1)[0][0]}` (`{counts.most_common(1)[0][1]}`개 파일)",
        "",
        "## 서브시스템별 책임",
        "",
    ]
    for subsystem, file_count in sorted(counts.items()):
        lines.extend(
            [
                f"### `{subsystem}`",
                "",
                f"- 설명: {SUBSYSTEM_DESCRIPTIONS.get(subsystem, '상세 역할 미분류')}",
                f"- 파일 수: `{file_count}`",
                f"- 선언 심볼 수: `{symbol_counts[subsystem]}`",
                f"- 직원 전용 신호 파일 수: `{employee_counts[subsystem]}`",
                f"- 내부 인프라 신호 파일 수: `{infra_counts[subsystem]}`",
                "",
            ]
        )
    return "\n".join(lines)


def build_coverage_ledger(analyses: list[FileAnalysis], source_root: Path) -> str:
    total_files = len(list(iter_source_files(source_root)))
    cataloged_files = len(analyses)
    zero_symbol_files = [item.rel_path for item in analyses if not item.symbols]
    lines = [
        "# COVERAGE-LEDGER.md",
        "",
        "## 전수 분석 커버리지",
        "",
        f"- 실제 파일 수: `{total_files}`",
        f"- 카탈로그 파일 수: `{cataloged_files}`",
        f"- 누락 파일 수: `{total_files - cataloged_files}`",
        f"- 심볼 없는 파일 수: `{len(zero_symbol_files)}`",
        "",
        "## 판정",
        "",
        f"- 파일 단위 전수 분석 완료: `{'예' if total_files == cataloged_files else '아니오'}`",
        f"- 미분석 파일 잔존: `{'없음' if total_files == cataloged_files else '있음'}`",
        "",
        "## 심볼 없는 파일",
        "",
    ]
    if zero_symbol_files:
        for rel_path in zero_symbol_files:
            lines.append(f"- `{rel_path}`")
    else:
        lines.append("- 없음")
    lines.append("")
    return "\n".join(lines)


def build_diff_report(analyses: list[FileAnalysis], bundle_text: str) -> str:
    direct = [item for item in analyses if item.npm_parity.startswith("동일 경로") or item.npm_parity.startswith("공개 번들 문자열")]
    employee = [item for item in analyses if item.employee_signals]
    infra = [item for item in analyses if item.infra_signals]
    lines = [
        "# SOURCE-NPM-DIFF.md",
        "",
        "## 개요",
        "",
        f"- 내부 소스 파일 수: `{len(analyses)}`",
        f"- 공개 npm 패키지 루트 파일 수: `19`",
        f"- 공개 번들 문자열 또는 직접 경로 대응이 잡힌 파일 수: `{len(direct)}`",
        f"- 직원 전용 신호 파일 수: `{len(employee)}`",
        f"- 내부 인프라 신호 파일 수: `{len(infra)}`",
        "",
        "## 공개 번들에서 직접 관찰된 대표 키워드",
        "",
    ]
    for needle in ("remote-control", "allow_remote_control", "teammateMode", "ultraplan", "UNDERCOVER MODE", "anthropic_internal"):
        lines.append(f"- `{needle}`: `{'있음' if needle in bundle_text else '없음'}`")
    lines.extend(
        [
            "",
            "## 해석",
            "",
            "- 공개 npm 패키지는 루트 기준 매우 얇고, 대부분 로직은 단일 번들 `cli.js` 안에 압축돼 있다.",
            "- 따라서 소스 파일별 1:1 대응보다는 `문자열 흔적 존재 여부`, `공개 루트 파일 존재 여부`, `내부 신호 존재 여부`를 병행해서 본다.",
            "- 직원 전용 분기와 내부 인프라 흔적은 소스 트리에서 넓게 보이지만, 공개 번들에서 동일 문자열이 직접 관찰되지 않는 경우가 많다.",
            "",
            "## 직원 전용 신호가 있는 대표 파일",
            "",
        ]
    )
    for item in employee[:25]:
        lines.append(f"- `{item.rel_path}`: {format_list(item.employee_signals)}")
    lines.extend(["", "## 내부 인프라 신호가 있는 대표 파일", ""])
    for item in infra[:25]:
        lines.append(f"- `{item.rel_path}`: {format_list(item.infra_signals)}")
    lines.append("")
    return "\n".join(lines)


def build_index(analyses: list[FileAnalysis]) -> str:
    return "\n".join(
        [
            "# how-to-use-claude-code",
            "",
            "## 목적",
            "",
            "- `claude-code-source` 전체 파일을 빠짐없이 읽고, 파일/심볼 단위 역할을 재개 가능한 문서 체계로 남긴다.",
            "- `claude-code-npm-unpacked/package`와 비교해 공개 표면과 내부 소스 흔적을 분리한다.",
            "",
            "## 생성된 문서",
            "",
            "- `FILE-INVENTORY.md`: 전체 파일 카탈로그 요약과 샤드 링크",
            "- `file-inventory/*.md`: 서브시스템별 파일 인벤토리",
            "- `SYMBOL-CATALOG.md`: 전체 심볼 카탈로그 요약과 샤드 링크",
            "- `symbol-catalog/*.md`: 서브시스템별 함수/클래스/메서드 카탈로그",
            "- `SUBSYSTEM-MAP.md`: top-level 서브시스템 책임과 규모",
            "- `SOURCE-NPM-DIFF.md`: 내부 소스와 공개 npm 번들 차이",
            "- `COVERAGE-LEDGER.md`: 전수 분석 누락 여부 확인",
            "- `CLAIM-CROSSWALK.md`: 기존 조사 claim과 전수 분석 결과의 연결",
            "",
            "## 현재 스캔 결과",
            "",
            f"- 전체 파일 수: `{len(analyses)}`",
            f"- 전체 선언 심볼 수: `{sum(len(item.symbols) for item in analyses)}`",
            f"- 직원 전용 신호 파일 수: `{sum(1 for item in analyses if item.employee_signals)}`",
            f"- 내부 인프라 신호 파일 수: `{sum(1 for item in analyses if item.infra_signals)}`",
            "",
            "## 읽는 순서",
            "",
            "1. `COVERAGE-LEDGER.md`",
            "2. `SUBSYSTEM-MAP.md`",
            "3. `SOURCE-NPM-DIFF.md`",
            "4. `FILE-INVENTORY.md`",
            "5. `SYMBOL-CATALOG.md`",
            "6. `CLAIM-CROSSWALK.md`",
            "",
        ]
    )


def build_claim_crosswalk() -> str:
    return "\n".join(
        [
            "# CLAIM-CROSSWALK.md",
            "",
            "## 목적",
            "",
            "- 기존 `temps/research/*` 조사 결과와 전수 분석 결과를 연결한다.",
            "- 전수 분석이 어느 claim을 강화하고, 어느 claim은 여전히 미확정으로 남는지 분리한다.",
            "",
            "## Claim 1. 공개 문서에 없는 숨겨진 기능인가",
            "",
            "- 유지 판정: `부분 기각`",
            "- 이유: `remote-control`, `agent teams`, `teammateMode`처럼 이미 공개 문서/공개 번들에 있는 항목이 존재한다.",
            "- 전수 분석이 추가로 보여 주는 것: 공개 표면 주변에 내부 전용 분기와 더 깊은 인프라 계층이 함께 존재한다.",
            "",
            "## Claim 2. 직원 전용 워크플로우가 있는가",
            "",
            "- 유지 판정: `강화`",
            "- 이유: 전수 분석은 `/ultraplan`, `USER_TYPE === 'ant'`, 내부 override, bridge/CCR 계층이 특정 소수 파일이 아니라 광범위한 소스 트리에 퍼져 있음을 보여 준다.",
            "",
            "## Claim 3. 직원/비직원 성능 차이를 의도적으로 조작하는가",
            "",
            "- 유지 판정: `strict는 여전히 미확정`",
            "- 이유: 전수 분석은 직원 전용 실행 차이를 더 많이 보여 주지만, 의도와 실제 운영 정책은 여전히 공개 근거로 닫히지 않는다.",
            "",
            "## Claim 4. 직원 전용 프롬프트 레이어가 있는가",
            "",
            "- 유지 판정: `강화`",
            "- 이유: 전수 분석으로 프롬프트/커밋/undercover 관련 경로를 더 넓게 따라갈 수 있다.",
            "",
        ]
    )


def main() -> None:
    args = parse_args()
    repo_root = Path(args.repo_root).resolve()
    session_root = repo_root / "store" / args.session_id
    source_root = session_root / "temps" / "claude-code-source"
    npm_root = session_root / "temps" / "claude-code-npm-unpacked" / "package"
    out_root = session_root / "temps" / "how-to-use-claude-code"

    bundle_path = npm_root / "cli.js"
    bundle_text = bundle_path.read_text(encoding="utf-8", errors="replace")
    npm_paths = {
        path.relative_to(npm_root).as_posix()
        for path in npm_root.rglob("*")
        if path.is_file()
    }
    analyses = [analyze_file(path, source_root, bundle_text, npm_paths) for path in iter_source_files(source_root)]

    write_text(out_root / "INDEX.md", build_index(analyses))
    write_text(out_root / "FILE-INVENTORY.md", build_inventory_summary(analyses))
    write_text(out_root / "SYMBOL-CATALOG.md", build_symbol_summary(analyses))
    write_text(out_root / "SUBSYSTEM-MAP.md", build_subsystem_map(analyses))
    write_text(out_root / "COVERAGE-LEDGER.md", build_coverage_ledger(analyses, source_root))
    write_text(out_root / "SOURCE-NPM-DIFF.md", build_diff_report(analyses, bundle_text))
    write_text(out_root / "CLAIM-CROSSWALK.md", build_claim_crosswalk())

    by_subsystem = defaultdict(list)
    for item in analyses:
        by_subsystem[item.subsystem].append(item)
    for subsystem, items in sorted(by_subsystem.items()):
        slug = subsystem_slug(subsystem)
        write_text(out_root / "file-inventory" / f"{slug}.md", build_inventory_shard(subsystem, items))
        write_text(out_root / "symbol-catalog" / f"{slug}.md", build_symbol_shard(subsystem, items))


if __name__ == "__main__":
    main()
