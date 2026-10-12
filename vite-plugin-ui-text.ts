import ts from 'typescript';
import type { Plugin } from 'vite';

const UNITS = new Set([
  'mg',
  'g',
  'gr',
  'kg',
  'ml',
  'l',
  'dl',
  'mmol',
  'umol',
  'µmol',
  'iu',
  'mcg',
  'µg',
  'ng',
  'pg',
  'mg/dl',
  'g/dl',
  'mmol/l',
  'u/l',
  '%',
]);

const DISPLAY_NAMES = new Set([
  'label',
  'title',
  'description',
  'subtitle',
  'placeholder',
  'caption',
  'heading',
  'hint',
  'featuredLabel',
  'buttonText',
  'emptyText',
  'helperText',
  'tooltip',
  'actionText',
  'sectionLabel',
  'menuLabel',
  'tabLabel',
  'fieldLabel',
  'errorText',
  'successText',
  'emptyMessage',
  'helper',
  'eyebrow',
  'confirmText',
  'cancelText',
  'subcategory',
]);

const INTRINSIC_ATTRS = new Set(['placeholder', 'aria-label', 'alt', 'title']);

export function shouldTranslateText(value: string): boolean {
  const text = value.replace(/\s+/g, ' ').trim();
  if (text.length < 2 || text.length > 500) return false;
  if (!/[A-Za-z]/.test(text)) return false;
  if (UNITS.has(text.toLowerCase().replace(/\s/g, ''))) return false;
  if (/^(https?:|\/|\.|#|@)/.test(text)) return false;
  if (/^[A-Z0-9_]+$/.test(text)) return false;
  if (/^[a-z]+[A-Z][A-Za-z0-9]*$/.test(text)) return false;
  if (/^[a-z0-9]+(-[a-z0-9]+)+$/.test(text)) return false;
  if (
    /\b(flex|grid|px-|py-|w-|h-|text-|bg-|items-|justify-|gap-|rounded-|dark:|className)\b/.test(
      text,
    )
  ) {
    return false;
  }
  if (/[{}<>]/.test(text)) return false;
  return true;
}

function isIntrinsicTag(tagName: ts.JsxTagNameExpression): boolean {
  return ts.isIdentifier(tagName) && /^[a-z]/.test(tagName.text);
}

function openingElementOf(
  attribute: ts.JsxAttribute,
): ts.JsxOpeningElement | ts.JsxSelfClosingElement | null {
  const attributes = attribute.parent;
  if (!attributes || !ts.isJsxAttributes(attributes)) return null;
  const opening = attributes.parent;
  if (ts.isJsxOpeningElement(opening) || ts.isJsxSelfClosingElement(opening)) {
    return opening;
  }
  return null;
}

function displayName(node: ts.Node): string | null {
  if (ts.isIdentifier(node)) return node.text;
  if (ts.isPropertyAccessExpression(node)) return node.name.text;
  return null;
}

function isRenderedExpression(node: ts.Node): boolean {
  let current: ts.Node = node;
  let parent: ts.Node | undefined = node.parent;
  while (parent) {
    if (
      ts.isParenthesizedExpression(parent) ||
      ts.isAsExpression(parent) ||
      ts.isNonNullExpression(parent) ||
      ts.isSatisfiesExpression(parent)
    ) {
      current = parent;
      parent = parent.parent;
      continue;
    }
    if (
      ts.isConditionalExpression(parent) &&
      (parent.whenTrue === current || parent.whenFalse === current)
    ) {
      current = parent;
      parent = parent.parent;
      continue;
    }
    if (
      ts.isBinaryExpression(parent) &&
      (parent.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
        parent.operatorToken.kind === ts.SyntaxKind.BarBarToken) &&
      parent.right === current
    ) {
      current = parent;
      parent = parent.parent;
      continue;
    }
    break;
  }
  if (!parent || !ts.isJsxExpression(parent)) return false;
  const container = parent.parent;
  if (!container) return false;
  if (ts.isJsxElement(container) || ts.isJsxFragment(container)) return true;
  if (ts.isJsxAttribute(container) && ts.isIdentifier(container.name)) {
    if (!INTRINSIC_ATTRS.has(container.name.text)) return false;
    const opening = openingElementOf(container);
    return opening ? isIntrinsicTag(opening.tagName) : false;
  }
  return false;
}

type Edit = { start: number; end: number; text: string };

export function transformUiText(code: string, fileName: string): string | null {
  const source = ts.createSourceFile(
    fileName,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const edits: Edit[] = [];

  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node)) {
      const trimmed = node.text.replace(/\s+/g, ' ').trim();
      if (shouldTranslateText(trimmed)) {
        const lead = /^\s/.test(node.text) ? ' ' : '';
        const trail =
          /\s$/.test(node.text) && node.text.trim().length > 0 ? ' ' : '';
        edits.push({
          start: node.getStart(source),
          end: node.getEnd(),
          text: `${lead}{<__UiText value={${JSON.stringify(trimmed)}} />}${trail}`,
        });
      }
    } else if (
      ts.isStringLiteral(node) &&
      isRenderedExpression(node) &&
      shouldTranslateText(node.text)
    ) {
      edits.push({
        start: node.getStart(source),
        end: node.getEnd(),
        text: `<__UiText value={${JSON.stringify(node.text.replace(/\s+/g, ' ').trim())}} />`,
      });
    } else if (
      (ts.isIdentifier(node) || ts.isPropertyAccessExpression(node)) &&
      isRenderedExpression(node) &&
      DISPLAY_NAMES.has(displayName(node) ?? '') &&
      !(ts.isCallExpression(node.parent) && node.parent.expression === node)
    ) {
      edits.push({
        start: node.getStart(source),
        end: node.getEnd(),
        text: `<__UiText value={${node.getText(source)}} />`,
      });
    } else if (
      ts.isJsxAttribute(node) &&
      ts.isIdentifier(node.name) &&
      INTRINSIC_ATTRS.has(node.name.text) &&
      node.initializer &&
      ts.isStringLiteral(node.initializer)
    ) {
      const opening = openingElementOf(node);
      const intrinsic = opening ? isIntrinsicTag(opening.tagName) : false;
      if (intrinsic && shouldTranslateText(node.initializer.text)) {
        edits.push({
          start: node.initializer.getStart(source),
          end: node.initializer.getEnd(),
          text: `{__uiText(${JSON.stringify(node.initializer.text.replace(/\s+/g, ' ').trim())})}`,
        });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  if (edits.length === 0) return null;

  edits.sort((a, b) => a.start - b.start);
  let cursor = 0;
  let next = '';
  for (const edit of edits) {
    if (edit.start < cursor) continue;
    next += code.slice(cursor, edit.start) + edit.text;
    cursor = edit.end;
  }
  next += code.slice(cursor);
  if (!code.includes('__uiText')) {
    const directive = next.match(/^(?:['"]use client['"];?\s*)/);
    const insertAt = directive?.[0].length ?? 0;
    const line = `import { UiText as __UiText, uiText as __uiText } from '#ui-text';\n`;
    next = `${next.slice(0, insertAt)}${line}${next.slice(insertAt)}`;
  }
  return next;
}

export function uiTextPlugin(uiTextModule: string): Plugin {
  const virtualId = '\0holisticare-ui-text';
  return {
    name: 'holisticare-ui-text',
    enforce: 'pre',
    resolveId(id) {
      if (id === '#ui-text') return virtualId;
      return null;
    },
    load(id) {
      if (id !== virtualId) return null;
      const componentModule = uiTextModule.replace(/uiText\.ts$/, 'UiText.tsx');
      return `export { uiText } from ${JSON.stringify(uiTextModule)};\nexport { UiText } from ${JSON.stringify(componentModule)};`;
    },
    transform(code, id) {
      const path = id.split('?')[0];
      if (!path.endsWith('.tsx')) return null;
      if (path.includes('node_modules') || /[/\\]i18n[/\\]/.test(path))
        return null;
      if (/\.(test|spec)\.tsx$/.test(path)) return null;
      const transformed = transformUiText(code, path);
      if (!transformed) return null;
      return { code: transformed, map: null };
    },
  };
}
