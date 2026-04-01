#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const DEFAULT_BATCH_SIZE = 50;
const CODE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

const EMPLOYEE_SIGNAL_PATTERNS = [
  ['USER_TYPE ant gate', /USER_TYPE\s*===?\s*['"]ant['"]/i],
  ['undercover mode', /UNDERCOVER MODE|undercover/i],
  ['internal model override', /anthropic_internal|ant_model_override|tengu_ant_model_override/i],
  ['employee-only comment', /employee-only|ant-only|staff-only/i],
];

const INFRA_SIGNAL_PATTERNS = [
  ['CCR', /\bCCR\b/],
  ['remote control', /remote-control|allow_remote_control|Remote Control/i],
  ['bridge', /\bbridge\b/i],
  ['upstream proxy', /upstreamproxy|upstream proxy/i],
  ['session container', /session container|remote memory|relay/i],
];

const SUBSYSTEM_DESCRIPTIONS = {
  '.': '루트 진입점과 교차 절단 오케스트레이션 계층',
  assistant: 'assistant 관련 상태와 세션 보조 로직',
  bootstrap: '런타임 초기화와 초기 상태 적재 계층',
  bridge: '브리지, 원격 제어, 원격 세션 연결 계층',
  buddy: '동료/버디 UI와 관련 보조 로직',
  cli: 'CLI 출력과 structured I/O 계층',
  commands: 'slash command와 명령 엔트리포인트 계층',
  components: 'Ink/React 기반 터미널 UI 컴포넌트 계층',
  constants: '프롬프트, 상수, 제한값 정의 계층',
  context: 'React context와 상위 상태 공급 계층',
  coordinator: 'coordinator 모드와 분기 제어 계층',
  entrypoints: '실행 엔트리포인트 계층',
  hooks: 'custom hook과 입력/렌더 보조 계층',
  ink: 'Ink 내부 바인딩과 렌더 루트 계층',
  keybindings: '키바인딩과 입력 단축키 계층',
  memdir: '세션/메모리 디렉터리 관리 계층',
  migrations: '설정/세션 마이그레이션 계층',
  moreright: '기타 부가 모듈',
  'native-ts': '네이티브 타입/바인딩 보조 계층',
  outputStyles: '출력 스타일 계층',
  plugins: '플러그인 확장 표면',
  query: '질의 엔진과 모델 질의 추상화',
  remote: '원격 세션 구성과 재개/연결 계층',
  schemas: '런타임 스키마와 타입 검증 계층',
  screens: '특수 화면 및 상위 뷰 계층',
  server: '서버 측 직접 연결/세션 생성 계층',
  services: 'API, MCP, analytics, 정책, LSP 등 서비스 계층',
  skills: '스킬 탐색과 실행 보조 계층',
  state: '애플리케이션 상태 저장소와 상태 전이 계층',
  tasks: '백그라운드 작업과 에이전트 작업 계층',
  tools: '도구 구현과 도구별 프롬프트/상태 계층',
  types: '공용 타입 정의 계층',
  upstreamproxy: 'CCR/upstream proxy 계층',
  utils: '광범위하게 재사용되는 공통 유틸리티 계층',
  vim: 'vim 모드 지원 계층',
  voice: '음성 입력/상호작용 계층',
};

const DEEP_DIVE_TARGETS = new Set([
  'main.tsx',
  'services/api/claude.ts',
  'tools/BashTool/BashTool.tsx',
  'bridge/initReplBridge.ts',
  'bridge/RemoteControlServer.ts',
]);

function parseArgs(argv) {
  const args = {
    sessionId: null,
    repoRoot: '.',
    sourceRoot: null,
    npmRoot: null,
    outputRoot: null,
    batchSize: DEFAULT_BATCH_SIZE,
    resumeFromBatch: 1,
    subsystems: null,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--session-id') {
      args.sessionId = next;
      i += 1;
    } else if (arg === '--repo-root') {
      args.repoRoot = next;
      i += 1;
    } else if (arg === '--source-root') {
      args.sourceRoot = next;
      i += 1;
    } else if (arg === '--npm-root') {
      args.npmRoot = next;
      i += 1;
    } else if (arg === '--output-root') {
      args.outputRoot = next;
      i += 1;
    } else if (arg === '--batch-size') {
      args.batchSize = Number(next);
      i += 1;
    } else if (arg === '--resume-from-batch') {
      args.resumeFromBatch = Number(next);
      i += 1;
    } else if (arg === '--subsystems') {
      args.subsystems = next.split(',').map(v => v.trim()).filter(Boolean);
      i += 1;
    }
  }

  if (!args.sessionId) {
    throw new Error('--session-id is required');
  }

  const repoRoot = path.resolve(args.repoRoot);
  args.repoRoot = repoRoot;
  args.sourceRoot = path.resolve(
    args.sourceRoot ?? path.join(repoRoot, 'store', args.sessionId, 'temps', 'claude-code-source')
  );
  args.npmRoot = path.resolve(
    args.npmRoot ?? path.join(repoRoot, 'store', args.sessionId, 'temps', 'claude-code-npm-unpacked', 'package')
  );
  args.outputRoot = path.resolve(
    args.outputRoot ?? path.join(repoRoot, 'store', args.sessionId, 'temps', 'how-to-use-claude-code-v2')
  );
  return args;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeText(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

function writeJson(filePath, value) {
  writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function listFiles(root) {
  const files = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries.reverse()) {
      if (entry.name === '.DS_Store') {
        continue;
      }
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  }
  return files.sort();
}

function relativePosix(root, filePath) {
  return path.relative(root, filePath).split(path.sep).join('/');
}

function getSubsystem(relPath) {
  const parts = relPath.split('/');
  return parts.length > 1 ? parts[0] : '.';
}

function slugifyPath(relPath) {
  return relPath.replace(/[\\/]/g, '__');
}

function subsystemDocName(subsystem) {
  return subsystem === '.' ? 'root' : subsystem;
}

function kindName(kind) {
  return ts.SyntaxKind[kind];
}

function isCodeFile(filePath) {
  return CODE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function getScriptKind(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.tsx') return ts.ScriptKind.TSX;
  if (ext === '.ts') return ts.ScriptKind.TS;
  if (ext === '.jsx') return ts.ScriptKind.JSX;
  if (ext === '.js' || ext === '.mjs' || ext === '.cjs') return ts.ScriptKind.JS;
  return ts.ScriptKind.Unknown;
}

function getLinePos(sourceFile, pos) {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(pos);
  return { line: line + 1, column: character + 1 };
}

function getSpan(sourceFile, node) {
  const start = getLinePos(sourceFile, node.getStart(sourceFile));
  const end = getLinePos(sourceFile, node.getEnd());
  return {
    startLine: start.line,
    startColumn: start.column,
    endLine: end.line,
    endColumn: end.column,
  };
}

function normalizeWhitespace(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function clampText(text, max = 220) {
  const clean = text.trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}…`;
}

function codeFence(text, lang = 'ts') {
  return `\`\`\`${lang}\n${text}\n\`\`\``;
}

function hasModifier(node, kind) {
  return Array.isArray(node.modifiers) && node.modifiers.some(mod => mod.kind === kind);
}

function getNodeName(node, sourceFile) {
  if (node.name && ts.isIdentifier(node.name)) return node.name.text;
  if (node.name && ts.isStringLiteral(node.name)) return node.name.text;
  if (node.name && ts.isPrivateIdentifier(node.name)) return node.name.text;
  if (ts.isConstructorDeclaration(node)) return 'constructor';
  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) return node.name.text;
  if (ts.isPropertyAssignment(node)) return node.name.getText(sourceFile);
  return null;
}

function getCallName(expr) {
  if (ts.isIdentifier(expr)) return expr.text;
  if (ts.isPropertyAccessExpression(expr)) return expr.getText();
  if (ts.isElementAccessExpression(expr)) return expr.getText();
  return clampText(expr.getText(), 80);
}

function getLeadingComment(sourceFile, node) {
  const text = sourceFile.getFullText();
  const ranges = ts.getLeadingCommentRanges(text, node.getFullStart()) || [];
  if (ranges.length === 0) return null;
  return ranges
    .slice(-2)
    .map(range => clampText(text.slice(range.pos, range.end), 240))
    .join(' ');
}

function detectSignals(text) {
  const employee = [];
  const infra = [];
  for (const [name, pattern] of EMPLOYEE_SIGNAL_PATTERNS) {
    if (pattern.test(text)) employee.push(name);
  }
  for (const [name, pattern] of INFRA_SIGNAL_PATTERNS) {
    if (pattern.test(text)) infra.push(name);
  }
  return { employee, infra };
}

function collectImportsAndExports(sourceFile) {
  const imports = [];
  const exports = [];

  sourceFile.forEachChild(node => {
    if (ts.isImportDeclaration(node) && node.moduleSpecifier) {
      imports.push(node.moduleSpecifier.getText(sourceFile).replace(/^['"]|['"]$/g, ''));
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
      exports.push(node.moduleSpecifier.getText(sourceFile).replace(/^['"]|['"]$/g, ''));
    } else if (ts.isExportAssignment(node)) {
      exports.push('default');
    } else if (
      (ts.isFunctionDeclaration(node) ||
        ts.isClassDeclaration(node) ||
        ts.isInterfaceDeclaration(node) ||
        ts.isTypeAliasDeclaration(node) ||
        ts.isEnumDeclaration(node)) &&
      hasModifier(node, ts.SyntaxKind.ExportKeyword)
    ) {
      const name = getNodeName(node, sourceFile);
      if (name) exports.push(name);
    } else if (ts.isVariableStatement(node) && hasModifier(node, ts.SyntaxKind.ExportKeyword)) {
      for (const decl of node.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) exports.push(decl.name.text);
      }
    }
  });

  return {
    imports: [...new Set(imports)].sort(),
    exports: [...new Set(exports)].sort(),
  };
}

function inferFileRole(relPath, sourceFile, imports, exportsList, text) {
  const basename = path.basename(relPath);
  const top = getSubsystem(relPath);
  const comment = getLeadingComment(sourceFile, sourceFile);
  const importCount = imports.length;
  const exportCount = exportsList.length;

  if (basename === 'main.tsx') {
    return {
      plain: '이 파일은 Claude Code CLI가 실제로 켜지기 전에 설정, 권한, 세션, 원격 연결, MCP, UI 진입을 한 번에 준비하는 메인 부트스트랩입니다.',
      technical: '프로세스 시작 후 초기 사이드이펙트, 설정 적재, 명령행 옵션 해석, 세션 준비, 원격 세션 구성, UI/헤드리스 분기를 오케스트레이션하는 루트 엔트리포인트다.',
    };
  }

  if (relPath.includes('/api/')) {
    return {
      plain: '이 파일은 외부 API에 보낼 요청이나 응답 처리 규칙을 정리하는 부분입니다.',
      technical: `서비스 계층 안에서 API 파라미터 조립, 인증, 재시도, 응답 변환, 사용량 추적 같은 책임을 가진 파일이다. import ${importCount}개, export ${exportCount}개를 가진다.`,
    };
  }

  if (/\/prompt\.(t|j)sx?$/.test(relPath)) {
    return {
      plain: '이 파일은 모델에게 전달할 문장 템플릿이나 도구 설명 문구를 모아 둔 곳입니다.',
      technical: `프롬프트 문자열, 가이드 문구, 도구 설명 또는 시스템 지시문을 구성하는 파일이다. export ${exportCount}개를 제공한다.`,
    };
  }

  if (/\/UI\.(t|j)sx?$/.test(relPath)) {
    return {
      plain: '이 파일은 화면에 무엇을 어떻게 보여줄지 결정하는 UI 구성 요소입니다.',
      technical: `Ink/React 계열 렌더링 컴포넌트 또는 UI 보조 파일이다. import ${importCount}개, export ${exportCount}개를 가진다.`,
    };
  }

  if (relPath.includes('/state') || basename.includes('state')) {
    return {
      plain: '이 파일은 현재 세션이나 화면이 어떤 상태인지 저장하고 갱신하는 규칙을 담습니다.',
      technical: '상태 저장소, 상태 전이, 세션 스냅샷, 복원 로직과 관련된 파일이다.',
    };
  }

  if (relPath.includes('/bridge') || relPath.includes('/remote')) {
    return {
      plain: '이 파일은 원격 세션이나 브리지 연결을 열고 유지하는 데 관여합니다.',
      technical: 'Remote Control, bridge, 원격 세션 토큰/메시지/연결 수명주기를 다루는 파일이다.',
    };
  }

  if (relPath.includes('/tools/')) {
    return {
      plain: '이 파일은 모델이 호출할 수 있는 도구 하나 또는 그 주변 보조 로직을 정의합니다.',
      technical: `도구 입력 스키마, 실행 경로, 결과 가공, UI 렌더링, 권한/백그라운드 처리 중 하나를 담당하는 tools 계층 파일이다.`,
    };
  }

  if (relPath.includes('/commands/')) {
    return {
      plain: '이 파일은 사용자가 입력하는 명령 하나 또는 명령 묶음의 동작을 정의합니다.',
      technical: 'slash command 또는 CLI command 등록/실행 로직을 담당하는 commands 계층 파일이다.',
    };
  }

  if (relPath.includes('/components/')) {
    return {
      plain: '이 파일은 터미널 화면 조각을 렌더링하는 UI 컴포넌트입니다.',
      technical: 'Ink/React 기반 UI 컴포넌트, 렌더 보조 훅, 시각적 상태 표현을 담당한다.',
    };
  }

  if (relPath.includes('/utils/')) {
    return {
      plain: '이 파일은 여러 곳에서 재사용하는 공통 도우미 함수를 모아 둔 유틸리티입니다.',
      technical: `utils 계층 파일로서 범용 계산, 변환, 파일/환경 처리, 보조 정책 로직을 제공한다. export ${exportCount}개를 가진다.`,
    };
  }

  return {
    plain: `이 파일은 ${SUBSYSTEM_DESCRIPTIONS[top] ?? '세부 역할 미분류 영역'} 안에서 특정 하위 책임을 맡습니다.`,
    technical: `${top} 서브시스템 파일이며 import ${importCount}개, export ${exportCount}개를 가진다.${comment ? ` 헤더 주석은 ${comment}` : ''}`,
  };
}

function getScopeLabel(scopeStack) {
  return scopeStack.length === 0 ? 'module' : scopeStack.join(' > ');
}

function scanUsage(node, sourceFile, declarationName) {
  const reads = new Set();
  const writes = new Set();
  const calls = new Set();

  function walk(current, isRoot = false) {
    if (!isRoot && (ts.isFunctionDeclaration(current) || ts.isFunctionExpression(current) || ts.isArrowFunction(current) || ts.isClassDeclaration(current))) {
      return;
    }

    if (ts.isCallExpression(current)) {
      calls.add(getCallName(current.expression));
    } else if (ts.isNewExpression(current)) {
      calls.add(`new ${getCallName(current.expression)}`);
    } else if (ts.isVariableDeclaration(current) && ts.isIdentifier(current.name)) {
      writes.add(current.name.text);
    } else if (ts.isBinaryExpression(current) && ts.isAssignmentOperator(current.operatorToken.kind)) {
      writes.add(clampText(current.left.getText(sourceFile), 80));
    } else if (ts.isIdentifier(current)) {
      reads.add(current.text);
    }

    ts.forEachChild(current, child => walk(child, false));
  }

  walk(node, true);
  if (declarationName) {
    reads.delete(declarationName);
    writes.delete(declarationName);
  }

  return {
    reads: [...reads].slice(0, 10),
    writes: [...writes].slice(0, 10),
    calls: [...calls].slice(0, 10),
  };
}

function inferCalledByContext(symbol) {
  if (symbol.exported) {
    return '이 선언은 export 표면에 있으므로 다른 파일이 import하거나 등록 테이블이 간접적으로 호출할 수 있습니다.';
  }
  if (symbol.scope !== 'module') {
    return `이 선언은 \`${symbol.scope}\` 내부에서만 쓰이는 지역 도우미일 가능성이 큽니다.`;
  }
  if (symbol.kind === 'method' || symbol.kind === 'constructor') {
    return `이 선언은 \`${symbol.parentName}\` 인스턴스/정적 사용 경로에서 소비됩니다.`;
  }
  return '이 선언은 같은 파일 안의 내부 흐름에서 사용될 가능성이 큽니다.';
}

function explainDeclarationKind(node, sourceFile) {
  if (ts.isFunctionDeclaration(node)) return '이름 있는 함수 선언';
  if (ts.isClassDeclaration(node)) return '클래스 선언';
  if (ts.isMethodDeclaration(node)) return '클래스 메서드';
  if (ts.isConstructorDeclaration(node)) return '클래스 생성자';
  if (ts.isGetAccessorDeclaration(node)) return 'getter';
  if (ts.isSetAccessorDeclaration(node)) return 'setter';
  if (ts.isInterfaceDeclaration(node)) return '인터페이스 선언';
  if (ts.isTypeAliasDeclaration(node)) return '타입 별칭 선언';
  if (ts.isEnumDeclaration(node)) return 'enum 선언';
  if (ts.isVariableDeclaration(node)) return '변수 선언';
  if (ts.isArrowFunction(node)) return '화살표 함수';
  if (ts.isFunctionExpression(node)) return '함수 표현식';
  return kindName(node.kind);
}

function summarizeInitializer(node, sourceFile) {
  if (ts.isVariableDeclaration(node) && node.initializer) {
    if (ts.isCallExpression(node.initializer)) {
      return `${getCallName(node.initializer.expression)} 호출 결과를 저장합니다.`;
    }
    if (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer)) {
      return '나중에 호출할 지역 함수를 변수에 담아 둡니다.';
    }
    if (ts.isObjectLiteralExpression(node.initializer)) {
      return '여러 값을 묶은 객체를 만듭니다.';
    }
    if (ts.isArrayLiteralExpression(node.initializer)) {
      return '여러 항목을 묶은 배열을 만듭니다.';
    }
  }
  return null;
}

function inferSymbolPlainExplanation(symbol, sourceFile) {
  const node = symbol.node;
  const name = symbol.name;
  if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isConstructorDeclaration(node)) {
    return `\`${name}\`는 ${symbol.scope === 'module' ? '이 파일의 주요 동작 한 단계' : `\`${symbol.scope}\` 안에서 쓰이는 지역 동작 한 단계`}를 수행하는 함수입니다.`;
  }
  if (ts.isClassDeclaration(node)) {
    return `\`${name}\`는 관련 데이터와 동작을 한 객체로 묶는 클래스입니다.`;
  }
  if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isEnumDeclaration(node)) {
    return `\`${name}\`는 이 파일 주변 코드가 어떤 모양의 데이터를 주고받는지 고정하는 타입 선언입니다.`;
  }
  if (ts.isVariableDeclaration(node)) {
    const initSummary = summarizeInitializer(node, sourceFile);
    if (symbol.kind === 'local-helper' || symbol.kind === 'callback') {
      return `\`${name}\`는 큰 함수 안에서 반복되는 일을 나눠 맡는 작은 도우미입니다.${initSummary ? ` ${initSummary}` : ''}`;
    }
    return `\`${name}\`는 이후 로직이 재사용할 값을 저장하는 변수입니다.${initSummary ? ` ${initSummary}` : ''}`;
  }
  if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
    return `\`${name}\`는 다른 함수에 전달되거나 나중에 실행되는 익명/콜백 함수입니다.`;
  }
  return `\`${name}\`는 ${explainDeclarationKind(node, sourceFile)}입니다.`;
}

function inferSymbolTechnicalExplanation(symbol, sourceFile) {
  const node = symbol.node;
  const usage = symbol.usage;
  const parts = [
    `${explainDeclarationKind(node, sourceFile)}로서 \`${symbol.scope}\` 스코프에 있다.`,
    usage.calls.length > 0 ? `주요 호출 대상은 ${usage.calls.map(v => `\`${v}\``).join(', ')}다.` : null,
    usage.writes.length > 0 ? `주요 write 대상은 ${usage.writes.map(v => `\`${v}\``).join(', ')}다.` : null,
    usage.reads.length > 0 ? `주요 read 식별자는 ${usage.reads.map(v => `\`${v}\``).join(', ')}다.` : null,
  ].filter(Boolean);
  return parts.join(' ');
}

function isAssignmentOperator(kind) {
  return kind >= ts.SyntaxKind.FirstAssignment && kind <= ts.SyntaxKind.LastAssignment;
}

function isTopLevel(node) {
  return node.parent && ts.isSourceFile(node.parent);
}

function isVariableFunctionLike(node) {
  return ts.isVariableDeclaration(node) && node.initializer && (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer));
}

function isFunctionLikeNode(node) {
  return ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isConstructorDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node) || ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node);
}

function inferAnonymousFunctionName(node, sourceFile) {
  const parent = node.parent;
  if (ts.isCallExpression(parent)) {
    return `callback for ${getCallName(parent.expression)} @${getLinePos(sourceFile, node.getStart(sourceFile)).line}`;
  }
  if (ts.isPropertyAssignment(parent)) {
    return `${parent.name.getText(sourceFile)} callback @${getLinePos(sourceFile, node.getStart(sourceFile)).line}`;
  }
  return `anonymous function @${getLinePos(sourceFile, node.getStart(sourceFile)).line}`;
}

function collectSymbols(sourceFile, relPath, fileSignals) {
  const symbols = [];
  const sourceText = sourceFile.getFullText();

  function pushSymbol(node, options) {
    const span = getSpan(sourceFile, node);
    const symbolText = sourceText.slice(node.getStart(sourceFile), node.getEnd());
    const localSignals = detectSignals(symbolText);
    const usageRoot = node.body || node.initializer || node;
    const usage = scanUsage(usageRoot, sourceFile, options.name);

    symbols.push({
      id: `${relPath}:${span.startLine}:${options.name}`,
      name: options.name,
      kind: options.kind,
      exported: options.exported,
      scope: getScopeLabel(options.scopeStack),
      parentName: options.parentName ?? null,
      declaration: clampText(node.getText(sourceFile), 220),
      line: span.startLine,
      span,
      node,
      plainExplanation: null,
      technicalExplanation: null,
      usage,
      calledByContext: null,
      localSignals: {
        employee: localSignals.employee,
        infra: localSignals.infra,
      },
      fileSignals,
      leadingComment: getLeadingComment(sourceFile, node),
    });
  }

  function visit(node, scopeStack = [], parentClass = null) {
    if (ts.isFunctionDeclaration(node) && node.name) {
      pushSymbol(node, {
        name: node.name.text,
        kind: scopeStack.length === 0 ? 'function' : 'nested-function',
        exported: hasModifier(node, ts.SyntaxKind.ExportKeyword),
        scopeStack,
      });
      const nextScope = [...scopeStack, node.name.text];
      ts.forEachChild(node, child => visit(child, nextScope, parentClass));
      return;
    }

    if (ts.isClassDeclaration(node) && node.name) {
      pushSymbol(node, {
        name: node.name.text,
        kind: 'class',
        exported: hasModifier(node, ts.SyntaxKind.ExportKeyword),
        scopeStack,
      });
      const nextScope = [...scopeStack, node.name.text];
      ts.forEachChild(node, child => visit(child, nextScope, node.name.text));
      return;
    }

    if (ts.isMethodDeclaration(node) || ts.isConstructorDeclaration(node) || ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node)) {
      const name = getNodeName(node, sourceFile);
      if (name) {
        pushSymbol(node, {
          name,
          kind: ts.isConstructorDeclaration(node) ? 'constructor' : 'method',
          exported: false,
          scopeStack,
          parentName: parentClass,
        });
      }
      const nextScope = name ? [...scopeStack, name] : scopeStack;
      ts.forEachChild(node, child => visit(child, nextScope, parentClass));
      return;
    }

    if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isEnumDeclaration(node)) {
      const name = getNodeName(node, sourceFile);
      if (name) {
        pushSymbol(node, {
          name,
          kind: ts.isInterfaceDeclaration(node) ? 'interface' : ts.isTypeAliasDeclaration(node) ? 'type' : 'enum',
          exported: hasModifier(node, ts.SyntaxKind.ExportKeyword),
          scopeStack,
        });
      }
      ts.forEachChild(node, child => visit(child, scopeStack, parentClass));
      return;
    }

    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) {
          const exported = hasModifier(node, ts.SyntaxKind.ExportKeyword);
          const name = decl.name.text;
          if (isVariableFunctionLike(decl)) {
            pushSymbol(decl, {
              name,
              kind: scopeStack.length === 0 ? 'const-function' : 'local-helper',
              exported,
              scopeStack,
            });
          } else {
            pushSymbol(decl, {
              name,
              kind: scopeStack.length === 0 ? 'variable' : 'local-variable',
              exported,
              scopeStack,
            });
          }
        }
      }
      ts.forEachChild(node, child => visit(child, scopeStack, parentClass));
      return;
    }

    if ((ts.isArrowFunction(node) || ts.isFunctionExpression(node)) && !ts.isVariableDeclaration(node.parent) && !ts.isMethodDeclaration(node.parent) && !ts.isPropertyAssignment(node.parent)) {
      pushSymbol(node, {
        name: inferAnonymousFunctionName(node, sourceFile),
        kind: 'callback',
        exported: false,
        scopeStack,
      });
      const nextScope = [...scopeStack, inferAnonymousFunctionName(node, sourceFile)];
      ts.forEachChild(node, child => visit(child, nextScope, parentClass));
      return;
    }

    ts.forEachChild(node, child => visit(child, scopeStack, parentClass));
  }

  visit(sourceFile, []);

  for (const symbol of symbols) {
    symbol.plainExplanation = inferSymbolPlainExplanation(symbol, sourceFile);
    symbol.technicalExplanation = inferSymbolTechnicalExplanation(symbol, sourceFile);
    symbol.calledByContext = inferCalledByContext(symbol);
  }

  return symbols;
}

function isInterestingExpressionNode(node) {
  return (
    ts.isVariableStatement(node) ||
    ts.isVariableDeclaration(node) ||
    ts.isExpressionStatement(node) ||
    ts.isReturnStatement(node) ||
    ts.isIfStatement(node) ||
    ts.isSwitchStatement(node) ||
    ts.isCaseClause(node) ||
    ts.isForStatement(node) ||
    ts.isForOfStatement(node) ||
    ts.isForInStatement(node) ||
    ts.isWhileStatement(node) ||
    ts.isDoStatement(node) ||
    ts.isTryStatement(node) ||
    ts.isCatchClause(node) ||
    ts.isThrowStatement(node) ||
    ts.isCallExpression(node) ||
    ts.isAwaitExpression(node) ||
    ts.isNewExpression(node) ||
    ts.isBinaryExpression(node) ||
    ts.isConditionalExpression(node) ||
    ts.isObjectLiteralExpression(node) ||
    ts.isArrayLiteralExpression(node) ||
    ts.isTemplateExpression(node) ||
    ts.isJsxElement(node) ||
    ts.isJsxSelfClosingElement(node) ||
    ts.isJsxFragment(node) ||
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isArrowFunction(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isClassDeclaration(node)
  );
}

function inferNodePlainExplanation(node, sourceFile) {
  if (ts.isVariableStatement(node)) return '이 줄은 이후에 재사용할 값이나 함수를 이름 붙여 저장합니다.';
  if (ts.isVariableDeclaration(node)) return summarizeInitializer(node, sourceFile) || '이 선언은 특정 이름에 값을 넣어 이후 코드가 참조하게 만듭니다.';
  if (ts.isExpressionStatement(node)) return '이 줄은 어떤 함수를 호출하거나 값을 계산해 바로 효과를 냅니다.';
  if (ts.isReturnStatement(node)) return '이 지점에서 현재 함수의 결과를 돌려주고 흐름을 끝냅니다.';
  if (ts.isIfStatement(node)) return `조건 \`${clampText(node.expression.getText(sourceFile), 100)}\`이 참일 때만 다른 경로로 보냅니다.`;
  if (ts.isSwitchStatement(node)) return `값 \`${clampText(node.expression.getText(sourceFile), 100)}\`에 따라 여러 갈래로 나눕니다.`;
  if (ts.isCaseClause(node)) return 'switch 안에서 특정 값에 대응하는 분기 조각입니다.';
  if (ts.isForStatement(node) || ts.isForOfStatement(node) || ts.isForInStatement(node) || ts.isWhileStatement(node) || ts.isDoStatement(node)) return '같은 종류의 작업을 여러 번 반복합니다.';
  if (ts.isTryStatement(node)) return '실패할 수 있는 작업을 감싸고, 오류가 나면 다른 경로에서 복구합니다.';
  if (ts.isCatchClause(node)) return 'try 블록에서 난 오류를 받아 처리합니다.';
  if (ts.isThrowStatement(node)) return '문제가 생겼다고 판단하고 오류를 즉시 위로 던집니다.';
  if (ts.isCallExpression(node)) return `\`${getCallName(node.expression)}\`를 호출해 다음 동작을 요청합니다.`;
  if (ts.isAwaitExpression(node)) return '비동기 작업이 끝날 때까지 기다린 뒤 다음 단계로 넘어갑니다.';
  if (ts.isNewExpression(node)) return `\`${getCallName(node.expression)}\` 객체를 새로 만듭니다.`;
  if (ts.isBinaryExpression(node)) {
    if (isAssignmentOperator(node.operatorToken.kind)) {
      return `왼쪽 대상에 새 값을 넣거나 덮어씁니다.`;
    }
    return `두 값을 \`${node.operatorToken.getText(sourceFile)}\` 규칙으로 계산하거나 비교합니다.`;
  }
  if (ts.isConditionalExpression(node)) return '조건에 따라 두 후보 중 하나를 고르는 삼항식입니다.';
  if (ts.isObjectLiteralExpression(node)) return '여러 속성을 묶어 하나의 객체를 만듭니다.';
  if (ts.isArrayLiteralExpression(node)) return '여러 항목을 순서대로 담은 배열을 만듭니다.';
  if (ts.isTemplateExpression(node)) return '문자열 조각과 변수를 섞어 새 문자열을 만듭니다.';
  if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) return '터미널 UI에 렌더링할 화면 조각을 정의합니다.';
  if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node) || ts.isMethodDeclaration(node)) return '다음에 호출될 함수/메서드 본문을 정의합니다.';
  if (ts.isClassDeclaration(node)) return '관련 데이터와 동작을 묶는 클래스 뼈대를 선언합니다.';
  return `${kindName(node.kind)} 노드입니다.`;
}

function inferNodeTechnicalExplanation(node, sourceFile) {
  const span = getSpan(sourceFile, node);
  const snippet = clampText(node.getText(sourceFile), 140);
  return `${kindName(node.kind)} 노드이며 ${span.startLine}:${span.startColumn}-${span.endLine}:${span.endColumn} 범위를 차지한다. 핵심 코드 조각은 \`${snippet}\`이다.`;
}

function gatherNodeSideEffects(node, sourceFile) {
  const effects = [];
  if (ts.isCallExpression(node)) effects.push('함수 호출');
  if (ts.isAwaitExpression(node)) effects.push('비동기 대기');
  if (ts.isThrowStatement(node)) effects.push('오류 전파');
  if (ts.isBinaryExpression(node) && isAssignmentOperator(node.operatorToken.kind)) effects.push('상태/변수 갱신');
  if (ts.isNewExpression(node)) effects.push('객체 생성');
  if (ts.isReturnStatement(node)) effects.push('현재 함수 종료');
  if (effects.length === 0) {
    if (/set|update|write|save|log|send|emit|connect|spawn|delete|remove|create/i.test(node.getText(sourceFile))) {
      effects.push('잠재적 부작용 가능');
    }
  }
  return effects;
}

function getParentContextStack(stack) {
  return stack.length === 0 ? 'module' : stack.join(' > ');
}

function collectExpressionEntries(sourceFile, relPath) {
  const entries = [];
  let counter = 1;

  function visit(node, scopeStack = []) {
    let nextScope = scopeStack;
    const named =
      (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node) || ts.isMethodDeclaration(node) || ts.isConstructorDeclaration(node)) &&
      getNodeName(node, sourceFile);
    if (named) {
      nextScope = [...scopeStack, getNodeName(node, sourceFile)];
    } else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && isVariableFunctionLike(node)) {
      nextScope = [...scopeStack, node.name.text];
    }

    if (isInterestingExpressionNode(node)) {
      const span = getSpan(sourceFile, node);
      const nodeText = node.getText(sourceFile);
      const localSignals = detectSignals(nodeText);
      entries.push({
        id: `E${String(counter).padStart(5, '0')}`,
        kind: kindName(node.kind),
        span,
        sourceText: clampText(nodeText, 800),
        plainExplanation: inferNodePlainExplanation(node, sourceFile),
        technicalExplanation: inferNodeTechnicalExplanation(node, sourceFile),
        parentContext: getParentContextStack(scopeStack),
        sideEffects: gatherNodeSideEffects(node, sourceFile),
        localSignals,
      });
      counter += 1;
    }

    ts.forEachChild(node, child => visit(child, nextScope));
  }

  visit(sourceFile, []);
  return entries;
}

function buildBatches(files, batchSize) {
  const batches = [];
  for (let i = 0; i < files.length; i += batchSize) {
    batches.push(files.slice(i, i + batchSize));
  }
  return batches;
}

function formatList(values, limit = 8) {
  if (!values || values.length === 0) return '없음';
  const shown = values.slice(0, limit).map(v => `\`${v}\``);
  const suffix = values.length > limit ? ` 외 ${values.length - limit}개` : '';
  return `${shown.join(', ')}${suffix}`;
}

function findHotspots(symbols, expressionEntries) {
  const hotspots = [];
  if (symbols.length > 0) hotspots.push(`심볼 ${symbols.length}개`);
  if (expressionEntries.length > 150) hotspots.push(`표현식 노드가 매우 많음(${expressionEntries.length}개)`);
  const signalCount = symbols.filter(s => s.localSignals.employee.length || s.localSignals.infra.length).length;
  if (signalCount > 0) hotspots.push(`국소 신호 심볼 ${signalCount}개`);
  return hotspots;
}

function loadBundleText(npmRoot) {
  const cliPath = path.join(npmRoot, 'cli.js');
  if (!fs.existsSync(cliPath)) return '';
  return fs.readFileSync(cliPath, 'utf8');
}

function detectNpmParity(relPath, exportsList, bundleText) {
  const basename = path.basename(relPath, path.extname(relPath));
  const candidates = [...new Set([basename, ...exportsList].filter(v => v && v.length > 3))].slice(0, 12);
  const hits = candidates.filter(token => bundleText.includes(token));
  if (hits.length > 0) {
    return {
      summary: `공개 번들 문자열에서 ${hits.slice(0, 4).map(v => `\`${v}\``).join(', ')} 흔적이 관찰됨`,
      hits,
    };
  }
  return {
    summary: '공개 패키지 루트에서는 직접 대응 문자열이 뚜렷하지 않음',
    hits: [],
  };
}

function buildFileDoc(fileInfo) {
  const lines = [
    `# 파일 분석 - ${fileInfo.relPath}`,
    '',
    `- 한 줄 요약: ${fileInfo.fileRole.plain}`,
    `- 기술 요약: ${fileInfo.fileRole.technical}`,
    `- 줄 수: \`${fileInfo.lineCount}\``,
    `- SHA1(축약): \`${fileInfo.sha1}\``,
    `- 주요 import: ${formatList(fileInfo.imports, 10)}`,
    `- 주요 export: ${formatList(fileInfo.exports, 10)}`,
    `- 신호 요약: 직원 전용 ${formatList(fileInfo.signals.employee)}, 내부 인프라 ${formatList(fileInfo.signals.infra)}`,
    `- 심볼 수: \`${fileInfo.symbols.length}\``,
    `- 표현식 노드 수: \`${fileInfo.expressionEntries.length}\``,
    `- 공개 npm 대응: ${fileInfo.npmParity.summary}`,
    `- hotspot: ${formatList(fileInfo.hotspots)}`,
    '',
    '## 이 파일이 왜 존재하는가',
    '',
    fileInfo.fileRole.plain,
    '',
    '## 기술 메모',
    '',
    fileInfo.fileRole.technical,
    '',
    '## 상위 관찰 포인트',
    '',
    `- 헤더/주석: ${fileInfo.leadingComment || '없음'}`,
    `- 대표 심볼: ${formatList(fileInfo.symbols.slice(0, 8).map(s => s.name), 8)}`,
    `- expression 문서: [바로가기](../expression-catalog/${subsystemDocName(fileInfo.subsystem)}/${slugifyPath(fileInfo.relPath)}.md)`,
    '',
  ];
  return lines.join('\n');
}

function buildExpressionDoc(fileInfo) {
  const lines = [
    `# 표현식 카탈로그 - ${fileInfo.relPath}`,
    '',
    `- 파일 한 줄 요약: ${fileInfo.fileRole.plain}`,
    `- 총 표현식/문장 노드 수: \`${fileInfo.expressionEntries.length}\``,
    '',
  ];

  if (fileInfo.expressionEntries.length === 0) {
    lines.push('- 표현식 카탈로그: 없음');
    lines.push('- 메모: 코드 파일이 아니거나 표현식 수준 AST를 추출할 수 없는 파일입니다.');
    lines.push('');
    return lines.join('\n');
  }

  for (const entry of fileInfo.expressionEntries) {
    lines.push(`## ${entry.id} - \`${entry.kind}\``);
    lines.push('');
    lines.push(`- 위치: \`${entry.span.startLine}:${entry.span.startColumn}-${entry.span.endLine}:${entry.span.endColumn}\``);
    lines.push(`- 상위 문맥: \`${entry.parentContext}\``);
    lines.push(`- 쉬운 설명: ${entry.plainExplanation}`);
    lines.push(`- 기술 설명: ${entry.technicalExplanation}`);
    lines.push(`- 부작용: ${formatList(entry.sideEffects)}`);
    lines.push(`- 관련 신호: 직원 전용 ${formatList(entry.localSignals.employee)}, 내부 인프라 ${formatList(entry.localSignals.infra)}`);
    lines.push('');
    lines.push('### 원문 코드');
    lines.push('');
    lines.push(codeFence(entry.sourceText));
    lines.push('');
  }
  return lines.join('\n');
}

function buildSymbolShard(subsystem, files) {
  const lines = [
    `# 심볼 카탈로그 - ${subsystem}`,
    '',
    `- 서브시스템 설명: ${SUBSYSTEM_DESCRIPTIONS[subsystem] || '세부 역할 미분류'}`,
    '',
  ];

  for (const fileInfo of files) {
    lines.push(`## \`${fileInfo.relPath}\``);
    lines.push('');
    lines.push(`- 파일 쉬운 설명: ${fileInfo.fileRole.plain}`);
    lines.push(`- 파일 기술 설명: ${fileInfo.fileRole.technical}`);
    lines.push(`- 공개 npm 대응: ${fileInfo.npmParity.summary}`);
    lines.push('');
    if (fileInfo.symbols.length === 0) {
      lines.push('- 선언 심볼: 없음');
      lines.push('- 메모: 코드 선언이 없거나, 현재 파일은 주로 side-effect import/재export/정적 자원 역할을 한다.');
      lines.push('');
      continue;
    }
    for (const symbol of fileInfo.symbols) {
      lines.push(`### \`${symbol.name}\``);
      lines.push('');
      lines.push(`- 종류: \`${symbol.kind}\`${symbol.parentName ? ` (parent: \`${symbol.parentName}\`)` : ''}`);
      lines.push(`- export 여부: \`${symbol.exported ? 'yes' : 'no'}\``);
      lines.push(`- 스코프: \`${symbol.scope}\``);
      lines.push(`- 선언 위치: \`${fileInfo.relPath}:${symbol.line}\``);
      lines.push(`- 정확한 선언: \`${symbol.declaration}\``);
      lines.push(`- 쉬운 설명: ${symbol.plainExplanation}`);
      lines.push(`- 기술 설명: ${symbol.technicalExplanation}`);
      lines.push(`- 언제 호출되는가: ${symbol.calledByContext}`);
      lines.push(`- 읽는 것: ${formatList(symbol.usage.reads, 10)}`);
      lines.push(`- 바꾸는 것: ${formatList(symbol.usage.writes, 10)}`);
      lines.push(`- 호출하는 것: ${formatList(symbol.usage.calls, 10)}`);
      lines.push(`- 관련 신호: 직원 전용 ${formatList(symbol.localSignals.employee)}, 내부 인프라 ${formatList(symbol.localSignals.infra)}`);
      lines.push(`- 주변 주석: ${symbol.leadingComment || '없음'}`);
      lines.push('');
    }
  }

  return lines.join('\n');
}

function buildFileShard(subsystem, files) {
  const lines = [
    `# 파일 인벤토리 - ${subsystem}`,
    '',
    `- 서브시스템 설명: ${SUBSYSTEM_DESCRIPTIONS[subsystem] || '세부 역할 미분류'}`,
    `- 파일 수: \`${files.length}\``,
    '',
  ];

  for (const fileInfo of files) {
    lines.push(`## \`${fileInfo.relPath}\``);
    lines.push('');
    lines.push(`- 한 줄 요약: ${fileInfo.fileRole.plain}`);
    lines.push(`- 기술 요약: ${fileInfo.fileRole.technical}`);
    lines.push(`- 줄 수: \`${fileInfo.lineCount}\``);
    lines.push(`- SHA1(축약): \`${fileInfo.sha1}\``);
    lines.push(`- 주요 import: ${formatList(fileInfo.imports, 10)}`);
    lines.push(`- 주요 export: ${formatList(fileInfo.exports, 10)}`);
    lines.push(`- 심볼 수: \`${fileInfo.symbols.length}\``);
    lines.push(`- 표현식 노드 수: \`${fileInfo.expressionEntries.length}\``);
    lines.push(`- 신호 요약: 직원 전용 ${formatList(fileInfo.signals.employee)}, 내부 인프라 ${formatList(fileInfo.signals.infra)}`);
    lines.push(`- 공개 npm 대응: ${fileInfo.npmParity.summary}`);
    lines.push(`- hotspot: ${formatList(fileInfo.hotspots)}`);
    lines.push(`- 선행 주석/헤더: ${fileInfo.leadingComment || '없음'}`);
    lines.push('');
  }

  return lines.join('\n');
}

function buildSubsystemMap(files) {
  const bySubsystem = new Map();
  for (const fileInfo of files) {
    if (!bySubsystem.has(fileInfo.subsystem)) bySubsystem.set(fileInfo.subsystem, []);
    bySubsystem.get(fileInfo.subsystem).push(fileInfo);
  }

  const lines = [
    '# SUBSYSTEM-MAP.md',
    '',
    '## 개요',
    '',
  ];

  const entries = [...bySubsystem.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
  for (const [subsystem, items] of entries) {
    const symbolCount = items.reduce((sum, item) => sum + item.symbols.length, 0);
    const expressionCount = items.reduce((sum, item) => sum + item.expressionEntries.length, 0);
    const employeeCount = items.filter(item => item.signals.employee.length > 0).length;
    const infraCount = items.filter(item => item.signals.infra.length > 0).length;
    const examples = items.slice(0, 5).map(item => `\`${item.relPath}\``).join(', ');

    lines.push(`## \`${subsystem}\``);
    lines.push('');
    lines.push(`- 설명: ${SUBSYSTEM_DESCRIPTIONS[subsystem] || '세부 역할 미분류'}`);
    lines.push(`- 파일 수: \`${items.length}\``);
    lines.push(`- 심볼 수: \`${symbolCount}\``);
    lines.push(`- 표현식 노드 수: \`${expressionCount}\``);
    lines.push(`- 직원 전용 신호 파일: \`${employeeCount}\``);
    lines.push(`- 내부 인프라 신호 파일: \`${infraCount}\``);
    lines.push(`- 대표 파일: ${examples || '없음'}`);
    lines.push('');
  }

  return lines.join('\n');
}

function buildIndex(files, outputRoot) {
  const totalSymbols = files.reduce((sum, item) => sum + item.symbols.length, 0);
  const totalNodes = files.reduce((sum, item) => sum + item.expressionEntries.length, 0);
  const employeeFiles = files.filter(item => item.signals.employee.length > 0).length;
  const infraFiles = files.filter(item => item.signals.infra.length > 0).length;

  return [
    '# how-to-use-claude-code-v2',
    '',
    '## 목적',
    '',
    '- `claude-code-source` 전체를 v1보다 더 상세하게 재분석한다.',
    '- 파일, 심볼, 표현식(AST 노드)을 비개발자도 바로 읽을 수 있는 한국어 설명으로 남긴다.',
    '- v1의 누락 지역 헬퍼, 중첩 함수, 파일 단위 신호 과전파 문제를 보강한다.',
    '',
    '## 현재 지표',
    '',
    `- 총 파일 수: \`${files.length}\``,
    `- 총 심볼 수: \`${totalSymbols}\``,
    `- 총 표현식/문장 노드 수: \`${totalNodes}\``,
    `- 직원 전용 신호 파일 수: \`${employeeFiles}\``,
    `- 내부 인프라 신호 파일 수: \`${infraFiles}\``,
    '',
    '## 읽는 순서',
    '',
    '1. `QUALITY-AUDIT.md`',
    '2. `COVERAGE-LEDGER.md`',
    '3. `SUBSYSTEM-MAP.md`',
    '4. `SOURCE-NPM-DIFF.md`',
    '5. `file-inventory/*`',
    '6. `symbol-catalog/*`',
    '7. `expression-catalog/*`',
    '8. `deep-dives/*`',
    '',
    '## 생성 파일',
    '',
    `- 루트 출력 경로: \`${outputRoot}\``,
    '- `manifest.json`, `coverage.json`',
    '- `batches/*.md`',
    '- `file-inventory/*.md`',
    '- `symbol-catalog/*.md`',
    '- `expression-catalog/<subsystem>/*.md`',
    '- `deep-dives/*.md`',
    '',
  ].join('\n');
}

function buildCoverage(files, parseFailures) {
  const noSymbol = files.filter(item => item.symbols.length === 0).map(item => item.relPath);
  const noExpressions = files.filter(item => item.expressionEntries.length === 0).map(item => item.relPath);
  return [
    '# COVERAGE-LEDGER.md',
    '',
    '## v2 커버리지',
    '',
    `- 실제 파일 수: \`${files.length}\``,
    `- 파싱 성공 파일 수: \`${files.length - parseFailures.length}\``,
    `- 파싱 실패 파일 수: \`${parseFailures.length}\``,
    `- 심볼 없는 파일 수: \`${noSymbol.length}\``,
    `- 표현식 노드 없는 파일 수: \`${noExpressions.length}\``,
    '',
    '## 판정',
    '',
    `- 파일 단위 전수 분석 완료: \`${parseFailures.length === 0 ? '예' : '부분'}\``,
    `- 미분석 파일 잔존: \`${parseFailures.length === 0 ? '없음' : '있음'}\``,
    '',
    '## 파싱 실패',
    '',
    ...(parseFailures.length === 0 ? ['- 없음'] : parseFailures.map(item => `- \`${item.relPath}\`: ${item.reason}`)),
    '',
    '## 심볼 없는 파일',
    '',
    ...(noSymbol.length === 0 ? ['- 없음'] : noSymbol.map(v => `- \`${v}\``)),
  ].join('\n');
}

function buildSourceNpmDiff(files, bundleText) {
  const withHits = files.filter(item => item.npmParity.hits.length > 0);
  const employeeFiles = files.filter(item => item.signals.employee.length > 0);
  const infraFiles = files.filter(item => item.signals.infra.length > 0);
  const examples = [
    ['main.tsx', files.find(item => item.relPath === 'main.tsx')],
    ['services/api/claude.ts', files.find(item => item.relPath === 'services/api/claude.ts')],
    ['tools/BashTool/BashTool.tsx', files.find(item => item.relPath === 'tools/BashTool/BashTool.tsx')],
  ].filter(([, item]) => Boolean(item));

  const lines = [
    '# SOURCE-NPM-DIFF.md',
    '',
    '## 개요',
    '',
    `- 내부 소스 파일 수: \`${files.length}\``,
    `- 공개 번들 문자열 대응 파일 수: \`${withHits.length}\``,
    `- 직원 전용 신호 파일 수: \`${employeeFiles.length}\``,
    `- 내부 인프라 신호 파일 수: \`${infraFiles.length}\``,
    `- 공개 bundle text 길이: \`${bundleText.length}\``,
    '',
    '## 해석',
    '',
    '- 공개 번들 문자열 대응은 “완전 동일 파일”을 뜻하지 않는다. 주로 이름/심볼 흔적 수준이다.',
    '- 직원 전용/내부 인프라 신호는 원본 소스 문맥을 따르며, 공개 번들에 직접 보이지 않을 수 있다.',
    '',
    '## 대표 파일',
    '',
  ];

  for (const [label, item] of examples) {
    lines.push(`### \`${label}\``);
    lines.push('');
    lines.push(`- 공개 대응: ${item.npmParity.summary}`);
    lines.push(`- 직원 전용 신호: ${formatList(item.signals.employee)}`);
    lines.push(`- 내부 인프라 신호: ${formatList(item.signals.infra)}`);
    lines.push('');
  }

  return lines.join('\n');
}

function buildClaimCrosswalk(files) {
  const mainFile = files.find(item => item.relPath === 'main.tsx');
  const apiFile = files.find(item => item.relPath === 'services/api/claude.ts');
  const bridgeFiles = files.filter(item => item.subsystem === 'bridge').slice(0, 5);

  return [
    '# CLAIM-CROSSWALK.md',
    '',
    '## 연결 원칙',
    '',
    '- strict/aggressive 연구 문서를 대체하지 않고, 전수 분석 결과가 어떤 코드 위치를 지지하는지 연결한다.',
    '',
    '## 핵심 claim',
    '',
    '### 직원/비직원 실행 차이',
    '',
    `- 대표 파일: ${apiFile ? `\`${apiFile.relPath}\`` : '없음'}`,
    `- 관찰 포인트: ${apiFile ? formatList(apiFile.symbols.filter(s => s.localSignals.employee.length > 0).slice(0, 8).map(s => s.name), 8) : '없음'}`,
    '',
    '### 내부 원격/브리지 인프라',
    '',
    `- 대표 파일: ${bridgeFiles.map(item => `\`${item.relPath}\``).join(', ') || '없음'}`,
    '',
    '### 메인 부트스트랩의 원격/MCP/세션 오케스트레이션',
    '',
    `- 대표 파일: ${mainFile ? `\`${mainFile.relPath}\`` : '없음'}`,
    `- 대표 심볼: ${mainFile ? formatList(mainFile.symbols.slice(0, 10).map(s => s.name), 10) : '없음'}`,
    '',
  ].join('\n');
}

function buildBatchDoc(batchIndex, batchFiles, files) {
  const lines = [
    `# BATCH-${String(batchIndex).padStart(4, '0')}`,
    '',
    `- 파일 수: \`${batchFiles.length}\``,
    `- 시작 파일: \`${batchFiles[0]?.relPath || '없음'}\``,
    `- 끝 파일: \`${batchFiles[batchFiles.length - 1]?.relPath || '없음'}\``,
    '',
    '## 파일 목록',
    '',
  ];
  for (const fileInfo of batchFiles) {
    lines.push(`- \`${fileInfo.relPath}\` — 심볼 ${fileInfo.symbols.length}개, 표현식 ${fileInfo.expressionEntries.length}개`);
  }
  lines.push('');
  return lines.join('\n');
}

function buildDeepDive(fileInfo) {
  const localHelpers = fileInfo.symbols.filter(symbol => ['local-helper', 'callback', 'nested-function'].includes(symbol.kind));
  const signalSymbols = fileInfo.symbols.filter(symbol => symbol.localSignals.employee.length > 0 || symbol.localSignals.infra.length > 0);
  const criticalNodes = fileInfo.expressionEntries
    .filter(entry => entry.localSignals.employee.length > 0 || entry.localSignals.infra.length > 0 || /IfStatement|TryStatement|CallExpression|AwaitExpression/.test(entry.kind))
    .slice(0, 40);

  const lines = [
    `# Deep Dive - ${fileInfo.relPath}`,
    '',
    `- 쉬운 요약: ${fileInfo.fileRole.plain}`,
    `- 기술 요약: ${fileInfo.fileRole.technical}`,
    `- 심볼 수: \`${fileInfo.symbols.length}\``,
    `- 표현식 노드 수: \`${fileInfo.expressionEntries.length}\``,
    '',
    '## 지역 헬퍼와 중첩 함수',
    '',
    ...(localHelpers.length === 0 ? ['- 없음'] : localHelpers.map(symbol => `- \`${symbol.name}\` — ${symbol.plainExplanation}`)),
    '',
    '## 신호가 직접 보이는 심볼',
    '',
    ...(signalSymbols.length === 0 ? ['- 없음'] : signalSymbols.map(symbol => `- \`${symbol.name}\` — 직원 전용 ${formatList(symbol.localSignals.employee)}, 내부 인프라 ${formatList(symbol.localSignals.infra)}`)),
    '',
    '## 핵심 표현식',
    '',
  ];

  for (const entry of criticalNodes) {
    lines.push(`### ${entry.id} - \`${entry.kind}\``);
    lines.push('');
    lines.push(`- 쉬운 설명: ${entry.plainExplanation}`);
    lines.push(`- 기술 설명: ${entry.technicalExplanation}`);
    lines.push(`- 상위 문맥: \`${entry.parentContext}\``);
    lines.push(`- 관련 신호: 직원 전용 ${formatList(entry.localSignals.employee)}, 내부 인프라 ${formatList(entry.localSignals.infra)}`);
    lines.push('');
  }

  return lines.join('\n');
}

function buildQualityAudit(files) {
  const requiredNames = {
    'main.tsx': ['parseChannelEntries', 'joinPluginIds', 'getAccessTokenForRemote'],
    'services/api/claude.ts': ['willDefer', 'paramsFromContext', 'deduplicateEdits'],
  };

  const lines = [
    '# QUALITY-AUDIT.md',
    '',
    '## v1 대비 판정',
    '',
    '- v1은 coverage는 닫았지만 역할 설명이 서브시스템 수준 일반문으로 평탄화돼 있었다.',
    '- v1은 비export 지역 헬퍼와 중첩 함수, 콜백을 충분히 잡지 못했다.',
    '- v2는 AST 기반으로 지역 헬퍼, 중첩 함수, 표현식 노드까지 문서화한다.',
    '',
    '## 표본 누락 메움 여부',
    '',
  ];

  for (const [relPath, names] of Object.entries(requiredNames)) {
    const fileInfo = files.find(item => item.relPath === relPath);
    lines.push(`### \`${relPath}\``);
    lines.push('');
    if (!fileInfo) {
      lines.push('- 파일 분석 결과 없음');
      lines.push('');
      continue;
    }
    const symbolNames = new Set(fileInfo.symbols.map(symbol => symbol.name));
    for (const name of names) {
      lines.push(`- \`${name}\`: \`${symbolNames.has(name) ? 'captured' : 'missing'}\``);
    }
    lines.push('');
  }

  lines.push('## 남은 한계');
  lines.push('');
  lines.push('- AST 노드 수가 매우 큰 파일은 문서량이 커지므로, 표현식 카탈로그와 deep dive를 함께 봐야 한다.');
  lines.push('- `호출된다/읽는다/쓴다` 정보는 정적 추론 기반이라 동적 런타임 경로를 완전히 대체하지는 않는다.');
  lines.push('');
  return lines.join('\n');
}

function analyzeFile(filePath, args, bundleText) {
  const relPath = relativePosix(args.sourceRoot, filePath);
  const text = fs.readFileSync(filePath, 'utf8');
  const subsystem = getSubsystem(relPath);
  const lineCount = text.split('\n').length;
  const sha1 = require('crypto').createHash('sha1').update(text).digest('hex').slice(0, 12);
  const signals = detectSignals(text);
  const code = isCodeFile(filePath);

  let sourceFile = null;
  let imports = [];
  let exportsList = [];
  let symbols = [];
  let expressionEntries = [];
  let leadingComment = null;
  let parseError = null;

  if (code) {
    try {
      sourceFile = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true, getScriptKind(filePath));
      ({ imports, exports: exportsList } = collectImportsAndExports(sourceFile));
      leadingComment = getLeadingComment(sourceFile, sourceFile);
      symbols = collectSymbols(sourceFile, relPath, signals);
      expressionEntries = collectExpressionEntries(sourceFile, relPath);
    } catch (error) {
      parseError = error instanceof Error ? error.message : String(error);
    }
  }

  const fileRole = code && sourceFile
    ? inferFileRole(relPath, sourceFile, imports, exportsList, text)
    : {
        plain: '이 파일은 코드가 아닌 정적 자료 또는 현재 생성기가 AST로 해석하지 않는 형식의 파일입니다.',
        technical: '비코드 파일 또는 미지원 파일 형식이다.',
      };
  const npmParity = detectNpmParity(relPath, exportsList, bundleText);
  const hotspots = findHotspots(symbols, expressionEntries);

  return {
    relPath,
    subsystem,
    lineCount,
    sha1,
    signals,
    code,
    imports,
    exports: exportsList,
    symbols,
    expressionEntries,
    leadingComment,
    parseError,
    fileRole,
    npmParity,
    hotspots,
  };
}

function main() {
  const args = parseArgs(process.argv);
  const allFiles = listFiles(args.sourceRoot);
  const selectedFiles = args.subsystems
    ? allFiles.filter(filePath => args.subsystems.includes(getSubsystem(relativePosix(args.sourceRoot, filePath))))
    : allFiles;

  const bundleText = loadBundleText(args.npmRoot);
  const analyses = [];
  const parseFailures = [];

  for (const filePath of selectedFiles) {
    const analysis = analyzeFile(filePath, args, bundleText);
    analyses.push(analysis);
    if (analysis.parseError) {
      parseFailures.push({ relPath: analysis.relPath, reason: analysis.parseError });
    }
  }

  analyses.sort((a, b) => a.relPath.localeCompare(b.relPath));
  ensureDir(args.outputRoot);
  ensureDir(path.join(args.outputRoot, 'file-inventory'));
  ensureDir(path.join(args.outputRoot, 'symbol-catalog'));
  ensureDir(path.join(args.outputRoot, 'expression-catalog'));
  ensureDir(path.join(args.outputRoot, 'deep-dives'));
  ensureDir(path.join(args.outputRoot, 'batches'));

  const bySubsystem = new Map();
  for (const analysis of analyses) {
    if (!bySubsystem.has(analysis.subsystem)) bySubsystem.set(analysis.subsystem, []);
    bySubsystem.get(analysis.subsystem).push(analysis);
  }

  for (const [subsystem, files] of [...bySubsystem.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    writeText(path.join(args.outputRoot, 'file-inventory', `${subsystemDocName(subsystem)}.md`), buildFileShard(subsystem, files));
    writeText(path.join(args.outputRoot, 'symbol-catalog', `${subsystemDocName(subsystem)}.md`), buildSymbolShard(subsystem, files));
    ensureDir(path.join(args.outputRoot, 'expression-catalog', subsystemDocName(subsystem)));

    for (const fileInfo of files) {
      writeText(
        path.join(args.outputRoot, 'expression-catalog', subsystemDocName(subsystem), `${slugifyPath(fileInfo.relPath)}.md`),
        buildExpressionDoc(fileInfo)
      );
    }
  }

  writeText(path.join(args.outputRoot, 'INDEX.md'), buildIndex(analyses, args.outputRoot));
  writeText(path.join(args.outputRoot, 'SUBSYSTEM-MAP.md'), buildSubsystemMap(analyses));
  writeText(path.join(args.outputRoot, 'COVERAGE-LEDGER.md'), buildCoverage(analyses, parseFailures));
  writeText(path.join(args.outputRoot, 'SOURCE-NPM-DIFF.md'), buildSourceNpmDiff(analyses, bundleText));
  writeText(path.join(args.outputRoot, 'CLAIM-CROSSWALK.md'), buildClaimCrosswalk(analyses));
  writeText(path.join(args.outputRoot, 'QUALITY-AUDIT.md'), buildQualityAudit(analyses));

  for (const fileInfo of analyses) {
    writeText(
      path.join(args.outputRoot, 'file-docs', `${slugifyPath(fileInfo.relPath)}.md`),
      buildFileDoc(fileInfo)
    );
  }

  const deepDiveFiles = analyses.filter(item => DEEP_DIVE_TARGETS.has(item.relPath));
  for (const fileInfo of deepDiveFiles) {
    writeText(path.join(args.outputRoot, 'deep-dives', `${slugifyPath(fileInfo.relPath)}.md`), buildDeepDive(fileInfo));
  }

  const batches = buildBatches(analyses, args.batchSize);
  batches.forEach((batchFiles, index) => {
    if (index + 1 < args.resumeFromBatch) return;
    writeText(path.join(args.outputRoot, 'batches', `BATCH-${String(index + 1).padStart(4, '0')}.md`), buildBatchDoc(index + 1, batchFiles));
  });

  writeJson(
    path.join(args.outputRoot, 'manifest.json'),
    analyses.map(fileInfo => ({
      path: fileInfo.relPath,
      subsystem: fileInfo.subsystem,
      lineCount: fileInfo.lineCount,
      sha1: fileInfo.sha1,
      code: fileInfo.code,
      symbolCount: fileInfo.symbols.length,
      expressionNodeCount: fileInfo.expressionEntries.length,
      parseError: fileInfo.parseError,
      employeeSignals: fileInfo.signals.employee,
      infraSignals: fileInfo.signals.infra,
      deepDive: DEEP_DIVE_TARGETS.has(fileInfo.relPath),
    }))
  );

  writeJson(path.join(args.outputRoot, 'coverage.json'), {
    totalFiles: analyses.length,
    parsedFiles: analyses.length - parseFailures.length,
    parseFailures,
    zeroSymbolFiles: analyses.filter(item => item.symbols.length === 0).map(item => item.relPath),
    zeroExpressionFiles: analyses.filter(item => item.expressionEntries.length === 0).map(item => item.relPath),
    totalSymbols: analyses.reduce((sum, item) => sum + item.symbols.length, 0),
    totalExpressionNodes: analyses.reduce((sum, item) => sum + item.expressionEntries.length, 0),
  });

  writeText(
    path.join(args.outputRoot, 'FILE-INVENTORY.md'),
    [
      '# FILE-INVENTORY.md',
      '',
      `- 총 파일 수: \`${analyses.length}\``,
      '',
      '## 샤드',
      '',
      ...[...bySubsystem.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([subsystem, files]) => `- \`${subsystem}\`: \`${files.length}\`개 파일, [상세](file-inventory/${subsystemDocName(subsystem)}.md)`),
      '',
    ].join('\n')
  );

  writeText(
    path.join(args.outputRoot, 'SYMBOL-CATALOG.md'),
    [
      '# SYMBOL-CATALOG.md',
      '',
      `- 총 심볼 수: \`${analyses.reduce((sum, item) => sum + item.symbols.length, 0)}\``,
      '',
      '## 샤드',
      '',
      ...[...bySubsystem.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([subsystem, files]) => `- \`${subsystem}\`: \`${files.reduce((sum, item) => sum + item.symbols.length, 0)}\`개 심볼, [상세](symbol-catalog/${subsystemDocName(subsystem)}.md)`),
      '',
    ].join('\n')
  );

  console.log(`Analyzed ${analyses.length} files into ${args.outputRoot}`);
}

main();
