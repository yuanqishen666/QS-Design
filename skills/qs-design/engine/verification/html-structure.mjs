const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const rawTextTags = new Set(['script', 'style']);

const whitespace = character => character === ' ' || character === '\n' || character === '\r' || character === '\t' || character === '\f';
const nameBoundary = character => character == null || whitespace(character) || character === '=' || character === '>' || character === '/';

function scanTagEnd(source, start) {
  let quote = null;
  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (quote) { if (character === quote) quote = null; continue; }
    if (character === '"' || character === "'") { quote = character; continue; }
    if (character === '>') return index;
  }
  return source.length - 1;
}

function parseStartTag(token) {
  let index = 1;
  while (whitespace(token[index])) index += 1;
  const tagStart = index;
  while (!nameBoundary(token[index])) index += 1;
  const tag = token.slice(tagStart, index).toLowerCase();
  const attrs = {};
  let selfClosing = false;
  while (index < token.length) {
    while (whitespace(token[index])) index += 1;
    if (token[index] === '>') break;
    if (token[index] === '/' && token[index + 1] === '>') { selfClosing = true; break; }
    const nameStart = index;
    while (!nameBoundary(token[index])) index += 1;
    const name = token.slice(nameStart, index).toLowerCase();
    if (!name) { index += 1; continue; }
    while (whitespace(token[index])) index += 1;
    let value = '';
    if (token[index] === '=') {
      index += 1;
      while (whitespace(token[index])) index += 1;
      const quote = token[index] === '"' || token[index] === "'" ? token[index++] : null;
      const valueStart = index;
      if (quote) {
        while (index < token.length && token[index] !== quote) index += 1;
        value = token.slice(valueStart, index);
        if (token[index] === quote) index += 1;
      } else {
        while (index < token.length && !whitespace(token[index]) && token[index] !== '>' && token[index] !== '/') index += 1;
        value = token.slice(valueStart, index);
      }
    }
    attrs[name] = value;
  }
  return { tag, attrs, selfClosing };
}

function closeElement(stack, tag) {
  for (let index = stack.length - 1; index > 0; index -= 1) {
    if (stack[index].tag === tag) { stack.length = index; return; }
  }
}

export function parseHTMLStructure(html) {
  const source = String(html ?? '');
  const lower = source.toLowerCase();
  const root = { type: 'root', children: [] };
  const stack = [root];
  let doctype = false;
  let index = 0;
  const appendText = value => { if (value && value.trim()) stack.at(-1).children.push({ type: 'text', value }); };

  while (index < source.length) {
    const opening = source.indexOf('<', index);
    if (opening < 0) { appendText(source.slice(index)); break; }
    appendText(source.slice(index, opening));
    if (source.startsWith('<!--', opening)) {
      const end = source.indexOf('-->', opening + 4);
      index = end < 0 ? source.length : end + 3;
      continue;
    }
    if (lower.startsWith('<!doctype', opening)) {
      doctype = true;
      index = scanTagEnd(source, opening + 2) + 1;
      continue;
    }
    if (source.startsWith('</', opening)) {
      const end = scanTagEnd(source, opening + 2);
      let cursor = opening + 2;
      while (whitespace(source[cursor])) cursor += 1;
      const start = cursor;
      while (!nameBoundary(source[cursor])) cursor += 1;
      closeElement(stack, source.slice(start, cursor).toLowerCase());
      index = end + 1;
      continue;
    }
    const first = source[opening + 1];
    if (!first || first === '!' || first === '?' || whitespace(first)) {
      appendText('<'); index = opening + 1; continue;
    }
    const end = scanTagEnd(source, opening + 1);
    const parsed = parseStartTag(source.slice(opening, end + 1));
    if (!parsed.tag) { appendText('<'); index = opening + 1; continue; }
    const node = { type: 'element', tag: parsed.tag, attrs: parsed.attrs, children: [] };
    stack.at(-1).children.push(node);
    index = end + 1;
    if (rawTextTags.has(parsed.tag) && !parsed.selfClosing) {
      const closingStart = lower.indexOf(`</${parsed.tag}`, index);
      if (closingStart < 0) { if (index < source.length) node.children.push({ type: 'text', value: source.slice(index) }); break; }
      if (closingStart > index) node.children.push({ type: 'text', value: source.slice(index, closingStart) });
      index = scanTagEnd(source, closingStart + parsed.tag.length + 2) + 1;
      continue;
    }
    if (!voidTags.has(parsed.tag) && !parsed.selfClosing) stack.push(node);
  }
  return { root, doctype };
}

export function walkElements(root) {
  const output = [];
  const visit = node => {
    if (node.type === 'element') output.push(node);
    for (const child of node.children ?? []) visit(child);
  };
  visit(root);
  return output;
}

export function nodeText(node) {
  return (node.children ?? []).map(child => child.type === 'text' ? child.value : nodeText(child)).join('').replace(/\s+/g, ' ').trim();
}
