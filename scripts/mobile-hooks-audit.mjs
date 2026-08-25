import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const cwd = process.cwd();
const mobileRoot = cwd.endsWith(path.join('apps', 'mobile')) ? cwd : path.resolve(cwd, 'apps/mobile');
const appRoot = path.join(mobileRoot, 'app');
const issues = [];

function isHookName(name) {
  return /^use[A-Z0-9_]/.test(name);
}

function containsTopLevelHook(node, rootNode) {
  let found = false;
  function visit(current) {
    if (found) return;
    if (current !== rootNode && ts.isFunctionLike(current)) return;
    if (ts.isCallExpression(current)) {
      let name = '';
      if (ts.isIdentifier(current.expression)) name = current.expression.text;
      else if (ts.isPropertyAccessExpression(current.expression)) name = current.expression.name.text;
      if (isHookName(name)) {
        found = true;
        return;
      }
    }
    ts.forEachChild(current, visit);
  }
  visit(node);
  return found;
}

function hasEarlyReturn(statement) {
  if (ts.isReturnStatement(statement)) return true;
  if (!ts.isIfStatement(statement)) return false;

  function containsReturn(node) {
    if (ts.isReturnStatement(node)) return true;
    if (ts.isBlock(node)) return node.statements.some(containsReturn);
    if (ts.isIfStatement(node)) {
      return containsReturn(node.thenStatement) || Boolean(node.elseStatement && containsReturn(node.elseStatement));
    }
    return false;
  }

  return containsReturn(statement.thenStatement) || Boolean(statement.elseStatement && containsReturn(statement.elseStatement));
}

function auditFunction(fn, sourceFile, file) {
  if (!fn.body || !ts.isBlock(fn.body)) return;
  let earlyReturnSeen = false;
  for (const statement of fn.body.statements) {
    if (earlyReturnSeen && containsTopLevelHook(statement, statement)) {
      const { line } = sourceFile.getLineAndCharacterOfPosition(statement.getStart(sourceFile));
      issues.push(`${path.relative(mobileRoot, file)}:${line + 1}`);
    }
    if (hasEarlyReturn(statement)) earlyReturnSeen = true;
  }
}

function auditFile(file) {
  const source = fs.readFileSync(file, 'utf8');
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX);
  function visit(node) {
    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
      auditFunction(node, sourceFile, file);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (entry.name.endsWith('.tsx')) auditFile(target);
  }
}

walk(appRoot);

if (issues.length) {
  console.error('[mobile-hooks-audit] Hook after a possible early return detected:');
  for (const issue of issues) console.error(`  - ${issue}`);
  process.exit(1);
}

console.log('[mobile-hooks-audit] hook order looks safe');
