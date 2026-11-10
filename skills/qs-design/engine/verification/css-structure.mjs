const whitespace = character => character === ' ' || character === '\n' || character === '\r' || character === '\t' || character === '\f';

function stripComments(source) {
  let output = '';
  let index = 0;
  let quote = null;
  while (index < source.length) {
    const character = source[index];
    if (quote) {
      output += character;
      if (character === '\\' && index + 1 < source.length) output += source[++index];
      else if (character === quote) quote = null;
      index += 1;
      continue;
    }
    if (character === '"' || character === "'") { quote = character; output += character; index += 1; continue; }
    if (character === '/' && source[index + 1] === '*') {
      const end = source.indexOf('*/', index + 2);
      index = end < 0 ? source.length : end + 2;
      continue;
    }
    output += character;
    index += 1;
  }
  return output;
}

function matchingBrace(source, opening) {
  let depth = 0;
  let quote = null;
  for (let index = opening; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === '\\') index += 1;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    else if (character === '{') depth += 1;
    else if (character === '}' && --depth === 0) return index;
  }
  return source.length - 1;
}

function splitTopLevel(source, delimiter) {
  const values = [];
  let start = 0;
  let quote = null;
  let parentheses = 0;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === '\\') index += 1;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    else if (character === '(' || character === '[') parentheses += 1;
    else if (character === ')' || character === ']') parentheses = Math.max(0, parentheses - 1);
    else if (character === delimiter && parentheses === 0) { values.push(source.slice(start, index)); start = index + 1; }
  }
  values.push(source.slice(start));
  return values;
}

function parseDeclarations(body) {
  const declarations = [];
  for (const part of splitTopLevel(body, ';')) {
    const pair = splitTopLevel(part, ':');
    if (pair.length < 2) continue;
    const property = pair.shift().trim().toLowerCase();
    const value = pair.join(':').trim();
    if (property && !property.includes('{') && !property.includes('}')) declarations.push({ property, value });
  }
  return declarations;
}

function scanBlocks(source, context, output) {
  let index = 0;
  while (index < source.length) {
    while (whitespace(source[index]) || source[index] === ';') index += 1;
    if (index >= source.length) break;
    let opening = -1;
    let statementEnd = -1;
    let quote = null;
    let parentheses = 0;
    for (let cursor = index; cursor < source.length; cursor += 1) {
      const character = source[cursor];
      if (quote) {
        if (character === '\\') cursor += 1;
        else if (character === quote) quote = null;
        continue;
      }
      if (character === '"' || character === "'") quote = character;
      else if (character === '(' || character === '[') parentheses += 1;
      else if (character === ')' || character === ']') parentheses = Math.max(0, parentheses - 1);
      else if (parentheses === 0 && character === '{') { opening = cursor; break; }
      else if (parentheses === 0 && character === ';') { statementEnd = cursor; break; }
    }
    if (statementEnd >= 0 && (opening < 0 || statementEnd < opening)) { index = statementEnd + 1; continue; }
    if (opening < 0) break;
    const prelude = source.slice(index, opening).trim();
    const closing = matchingBrace(source, opening);
    const body = source.slice(opening + 1, closing);
    if (prelude.startsWith('@')) {
      output.at_rules.push({ prelude, context: [...context] });
      scanBlocks(body, [...context, prelude], output);
    } else {
      output.rules.push({ selector: prelude, declarations: parseDeclarations(body), context: [...context] });
      if (body.includes('{')) scanBlocks(body, context, output);
    }
    index = closing + 1;
  }
}

export function cssTokens(value) {
  const tokens = [];
  let current = '';
  for (const character of String(value ?? '').toLowerCase()) {
    const code = character.codePointAt(0);
    const word = (code >= 48 && code <= 57) || (code >= 97 && code <= 122) || character === '-';
    if (word) current += character;
    else if (current) { tokens.push(current); current = ''; }
  }
  if (current) tokens.push(current);
  return tokens;
}

export function parseCSSStructure(css) {
  const output = { rules: [], at_rules: [] };
  scanBlocks(stripComments(String(css ?? '')), [], output);
  return output;
}
