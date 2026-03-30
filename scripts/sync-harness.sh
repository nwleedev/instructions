#!/bin/sh
set -eu

MANIFEST_FILE=".harness-sync-manifest.json"
DRY_RUN=0
TARGET_DIR=""

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
SOURCE_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"
TEMPLATE_AGENTS_SOURCE="instructions/templates/AGENTS-TEMPLATE.md"
TEMPLATE_REPOSITORY_SOURCE="instructions/templates/REPOSITORY-TEMPLATE.md"

usage() {
  cat <<'EOF'
사용법:
  scripts/sync-harness.sh --target <project-path> [--source <harness-source>] [--dry-run]

설명:
  현재 저장소의 하네스 자산을 다른 프로젝트에 설치하거나 업데이트합니다.

관리 대상:
  - AGENTS.md (대상 프로젝트에서는 template override 적용)
  - CLAUDE.md
  - sessions/*
  - instructions/*.md (instructions/REPOSITORY.md는 template override 적용)
  - instructions/templates/*
  - .agents/skills/harness-engine/*

비관리 대상:
  - store/*
  - instructions/research/*
  - instructions/frontend/*
  - instructions/learning-mode/*
  - 대상 프로젝트의 다른 .agents 자산
  - 대상 프로젝트의 instructions/<task_type>/* 로컬 하네스
EOF
}

json_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

log_action() {
  kind="$1"
  path="$2"
  printf '%s %s\n' "$kind" "$path"
}

fail() {
  echo "$*" >&2
  exit 1
}

ensure_source_layout() {
  [ -d "$SOURCE_DIR" ] || fail "source 디렉터리가 없습니다: $SOURCE_DIR"
  [ -f "$SOURCE_DIR/AGENTS.md" ] || fail "source에 AGENTS.md가 없습니다: $SOURCE_DIR"
  [ -d "$SOURCE_DIR/instructions" ] || fail "source에 instructions 디렉터리가 없습니다: $SOURCE_DIR"
  [ -f "$SOURCE_DIR/$TEMPLATE_AGENTS_SOURCE" ] || fail "source에 AGENTS 템플릿이 없습니다: $SOURCE_DIR/$TEMPLATE_AGENTS_SOURCE"
  [ -f "$SOURCE_DIR/$TEMPLATE_REPOSITORY_SOURCE" ] || fail "source에 REPOSITORY 템플릿이 없습니다: $SOURCE_DIR/$TEMPLATE_REPOSITORY_SOURCE"
}

collect_source_paths() {
  (
    cd "$SOURCE_DIR"

    [ -f "AGENTS.md" ] && printf '%s\n' "AGENTS.md"
    [ -f "CLAUDE.md" ] && printf '%s\n' "CLAUDE.md"

    if [ -d "sessions" ]; then
      find "sessions" -type f | LC_ALL=C sort
    fi

    for path in instructions/*.md; do
      [ -f "$path" ] && printf '%s\n' "$path"
    done | LC_ALL=C sort

    if [ -d "instructions/templates" ]; then
      find "instructions/templates" -type f | LC_ALL=C sort
    fi

    if [ -d ".agents/skills/harness-engine" ]; then
      find ".agents/skills/harness-engine" -type f | LC_ALL=C sort
    fi
  ) | sed 's#^\./##' | awk 'NF && !seen[$0]++'
}

collect_source_directories() {
  collect_source_paths | while IFS= read -r path; do
    dir=$(dirname "$path")
    if [ "$dir" != "." ]; then
      printf '%s\n' "$dir"
    fi
  done | awk '!seen[$0]++' | LC_ALL=C sort
}

manifest_entries_from_section() {
  section="$1"
  manifest_path="$TARGET_DIR/$MANIFEST_FILE"

  [ -f "$manifest_path" ] || return 0

  awk -v section="$section" '
    $0 ~ "\"" section "\"[[:space:]]*:" { in_section = 1; next }
    in_section && /^[[:space:]]*\]/ { in_section = 0; exit }
    in_section {
      line = $0
      sub(/^[[:space:]]*"/, "", line)
      sub(/",[[:space:]]*$/, "", line)
      if (length(line) > 0) {
        print line
      }
    }
  ' "$manifest_path"
}

list_contains() {
  needle="$1"
  haystack="${2:-}"

  [ -n "$haystack" ] || return 1
  printf '%s\n' "$haystack" | grep -Fqx -- "$needle"
}

ensure_parent_dir() {
  rel_path="$1"
  parent_dir=$(dirname "$rel_path")

  [ "$parent_dir" = "." ] && return 0

  if [ "$DRY_RUN" -eq 1 ]; then
    return 0
  fi

  mkdir -p "$TARGET_DIR/$parent_dir"
}

set_file_mode() {
  src="$1"
  dst="$2"

  if [ -x "$src" ]; then
    chmod 755 "$dst"
  else
    chmod 644 "$dst"
  fi
}

sync_path() {
  rel_path="$1"
  src="$SOURCE_DIR/$rel_path"
  dst="$TARGET_DIR/$rel_path"

  [ -f "$src" ] || fail "source 파일이 없습니다: $src"

  if [ -d "$dst" ]; then
    fail "대상 경로가 디렉터리라서 파일을 덮어쓸 수 없습니다: $dst"
  fi

  if [ ! -e "$dst" ]; then
    log_action "CREATE" "$rel_path"
    if [ "$DRY_RUN" -eq 0 ]; then
      ensure_parent_dir "$rel_path"
      cp "$src" "$dst"
      set_file_mode "$src" "$dst"
    fi
    return 0
  fi

  if cmp -s "$src" "$dst"; then
    log_action "KEEP" "$rel_path"
    return 0
  fi

  log_action "UPDATE" "$rel_path"
  if [ "$DRY_RUN" -eq 0 ]; then
    ensure_parent_dir "$rel_path"
    cp "$src" "$dst"
    set_file_mode "$src" "$dst"
  fi
}

sync_override() {
  src_rel_path="$1"
  dst_rel_path="$2"
  src="$SOURCE_DIR/$src_rel_path"
  dst="$TARGET_DIR/$dst_rel_path"

  [ -f "$src" ] || fail "override source 파일이 없습니다: $src"

  if [ -d "$dst" ]; then
    fail "대상 경로가 디렉터리라서 파일을 덮어쓸 수 없습니다: $dst"
  fi

  if [ ! -e "$dst" ]; then
    log_action "CREATE" "$dst_rel_path"
    if [ "$DRY_RUN" -eq 0 ]; then
      ensure_parent_dir "$dst_rel_path"
      cp "$src" "$dst"
      set_file_mode "$src" "$dst"
    fi
    return 0
  fi

  if cmp -s "$src" "$dst"; then
    log_action "KEEP" "$dst_rel_path"
    return 0
  fi

  log_action "UPDATE" "$dst_rel_path"
  if [ "$DRY_RUN" -eq 0 ]; then
    ensure_parent_dir "$dst_rel_path"
    cp "$src" "$dst"
    set_file_mode "$src" "$dst"
  fi
}

prune_empty_parents() {
  rel_path="$1"
  dir=$(dirname "$rel_path")

  while [ "$dir" != "." ] && [ "$dir" != "/" ]; do
    target_dir="$TARGET_DIR/$dir"

    [ -d "$target_dir" ] || break

    if ! rmdir "$target_dir" 2>/dev/null; then
      break
    fi

    dir=$(dirname "$dir")
  done
}

remove_stale_path() {
  rel_path="$1"
  dst="$TARGET_DIR/$rel_path"

  [ -e "$dst" ] || return 0

  if [ -d "$dst" ]; then
    fail "manifest가 파일로 관리하던 경로가 디렉터리로 바뀌어 제거를 중단합니다: $dst"
  fi

  log_action "REMOVE" "$rel_path"

  if [ "$DRY_RUN" -eq 0 ]; then
    rm -f "$dst"
    prune_empty_parents "$rel_path"
  fi
}

write_manifest() {
  current_paths="$1"
  current_directories="$2"
  manifest_path="$TARGET_DIR/$MANIFEST_FILE"
  tmp_manifest="$manifest_path.tmp.$$"
  source_commit=$(git -C "$SOURCE_DIR" rev-parse --short HEAD 2>/dev/null || printf '%s' "unknown")

  [ "$DRY_RUN" -eq 0 ] || return 0

  mkdir -p "$TARGET_DIR"

  {
    printf '{\n'
    printf '  "format_version": 1,\n'
    printf '  "source_label": "%s",\n' "$(json_escape "$SOURCE_DIR")"
    printf '  "last_synced_commit": "%s",\n' "$(json_escape "$source_commit")"
    printf '  "managed_paths": [\n'

    first=1
    printf '%s\n' "$current_paths" | while IFS= read -r path; do
      [ -n "$path" ] || continue
      if [ "$first" -eq 1 ]; then
        first=0
        printf '    "%s"' "$(json_escape "$path")"
      else
        printf ',\n    "%s"' "$(json_escape "$path")"
      fi
    done

    printf '\n  ],\n'
    printf '  "managed_directories": [\n'

    first=1
    printf '%s\n' "$current_directories" | while IFS= read -r path; do
      [ -n "$path" ] || continue
      if [ "$first" -eq 1 ]; then
        first=0
        printf '    "%s"' "$(json_escape "$path")"
      else
        printf ',\n    "%s"' "$(json_escape "$path")"
      fi
    done

    printf '\n  ]\n'
    printf '}\n'
  } > "$tmp_manifest"

  mv "$tmp_manifest" "$manifest_path"
  log_action "WRITE" "$MANIFEST_FILE"
}

while [ $# -gt 0 ]; do
  case "$1" in
    --target)
      [ $# -ge 2 ] || fail "--target 값이 없습니다."
      TARGET_DIR="$2"
      shift 2
      ;;
    --source)
      [ $# -ge 2 ] || fail "--source 값이 없습니다."
      SOURCE_DIR="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      fail "알 수 없는 옵션입니다: $1"
      ;;
  esac
done

[ -n "$TARGET_DIR" ] || {
  usage
  exit 1
}

ensure_source_layout

CURRENT_PATHS=$(collect_source_paths)
CURRENT_DIRECTORIES=$(collect_source_directories)
OLD_PATHS=$(manifest_entries_from_section "managed_paths")

[ -n "$CURRENT_PATHS" ] || fail "복사할 관리 대상이 없습니다."

printf 'SOURCE %s\n' "$SOURCE_DIR"
printf 'TARGET %s\n' "$TARGET_DIR"

if [ "$DRY_RUN" -eq 0 ]; then
  mkdir -p "$TARGET_DIR"
fi

printf '%s\n' "$OLD_PATHS" | while IFS= read -r old_path; do
  [ -n "$old_path" ] || continue
  if ! list_contains "$old_path" "$CURRENT_PATHS"; then
    remove_stale_path "$old_path"
  fi
done

printf '%s\n' "$CURRENT_PATHS" | while IFS= read -r rel_path; do
  [ -n "$rel_path" ] || continue
  if [ "$rel_path" = "AGENTS.md" ] || [ "$rel_path" = "instructions/REPOSITORY.md" ]; then
    continue
  fi
  sync_path "$rel_path"
done

sync_override "$TEMPLATE_AGENTS_SOURCE" "AGENTS.md"
sync_override "$TEMPLATE_REPOSITORY_SOURCE" "instructions/REPOSITORY.md"

write_manifest "$CURRENT_PATHS" "$CURRENT_DIRECTORIES"

if [ "$DRY_RUN" -eq 1 ]; then
  echo "DRY RUN 완료"
else
  echo "SYNC 완료"
fi
