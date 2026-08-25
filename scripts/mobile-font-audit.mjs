import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const cwd = process.cwd();
const mobileRoot = cwd.endsWith(path.join('apps', 'mobile')) ? cwd : path.resolve(cwd, 'apps/mobile');
const roots = [path.join(mobileRoot, 'app'), path.join(mobileRoot, 'src')];
const misses = [];

function audit(file) {
  const source = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX);
  const styleRefs = [];
  function addExpression(expr) {
    if (ts.isPropertyAccessExpression(expr) && ts.isIdentifier(expr.expression)) styleRefs.push([expr.expression.text, expr.name.text]);
    else if (ts.isArrayLiteralExpression(expr)) for (const element of expr.elements) addExpression(element);
  }
  function visit(node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(sf);
      if (tag === 'Text' || tag === 'TextInput') {
        const attr = node.attributes.properties.find((item) => ts.isJsxAttribute(item) && item.name.getText(sf) === 'style');
        if (attr && ts.isJsxAttribute(attr) && attr.initializer && ts.isJsxExpression(attr.initializer) && attr.initializer.expression) addExpression(attr.initializer.expression);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  for (const [objectName, styleName] of styleRefs) {
    if (styleName === 'datePart' || styleName === 'dateYear') continue; // combined with the base `input` style.
    const match = source.match(new RegExp(`${styleName}\\s*:\\s*\\{([^}]*)\\}`));
    if (match && !/fontFamily\s*:/.test(match[1])) misses.push(`${path.relative(mobileRoot, file)}:${objectName}.${styleName}`);
  }
}
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (entry.name.endsWith('.tsx')) audit(target);
  }
}
for (const root of roots) walk(root);
if (misses.length) {
  console.error('[mobile-font-audit] text styles without fontFamily:');
  for (const miss of [...new Set(misses)]) console.error(` - ${miss}`);
  process.exit(1);
}
console.log('[mobile-font-audit] text styles use the shared typography family');
