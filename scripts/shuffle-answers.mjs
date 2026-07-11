// Shuffle each question's options and remap correct indices so the correct
// answer isn't always option A. Asserts the correct-answer TEXT is preserved.
import { readFileSync, writeFileSync } from "node:fs";
const p = "data/test-1.json";
const q = JSON.parse(readFileSync(p, "utf8"));

function shuffle(n) {
  const a = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

for (const item of q) {
  const before = new Set(item.correct.map((i) => item.options[i]));
  const perm = shuffle(item.options.length);          // perm[newPos] = oldIndex
  const oldToNew = {}; perm.forEach((old, np) => (oldToNew[old] = np));
  item.options = perm.map((old) => item.options[old]);
  item.correct = item.correct.map((c) => oldToNew[c]).sort((a, b) => a - b);
  const after = new Set(item.correct.map((i) => item.options[i]));
  // assert correctness preserved
  if (before.size !== after.size || [...before].some((t) => !after.has(t)))
    throw new Error("correct-answer text changed during shuffle");
}

writeFileSync(p, JSON.stringify(q, null, 2) + "\n");

const pos = {};
q.forEach((x) => { if (x.type !== "multi" && x.correct.length === 1) pos[x.correct[0]] = (pos[x.correct[0]] || 0) + 1; });
console.log("single-answer correct-index distribution (0=A,1=B,2=C,3=D):", JSON.stringify(pos));
