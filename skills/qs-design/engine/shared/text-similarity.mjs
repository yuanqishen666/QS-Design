export function normalizeMeaning(value) {
  return String(value ?? '').normalize('NFKC').toLowerCase().replace(/[^\p{Letter}\p{Number}]+/gu, '');
}

function bigrams(value) {
  const normalized = normalizeMeaning(value);
  if (normalized.length < 2) return new Set(normalized ? [normalized] : []);
  const output = new Set();
  for (let index = 0; index < normalized.length - 1; index += 1) output.add(normalized.slice(index, index + 2));
  return output;
}

export function textSimilarity(left, right) {
  const a = bigrams(left);
  const b = bigrams(right);
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const token of a) if (b.has(token)) intersection += 1;
  return intersection / new Set([...a, ...b]).size;
}

export function meaningfullyEquivalent(left, right, threshold = 0.82) {
  const a = normalizeMeaning(left);
  const b = normalizeMeaning(right);
  if (!a || !b) return false;
  if (a === b) return true;
  const shorter = a.length <= b.length ? a : b;
  const longer = shorter === a ? b : a;
  return (longer.includes(shorter) && shorter.length / longer.length >= 0.8) || textSimilarity(a, b) >= threshold;
}
