#!/usr/bin/env node
// Convert an existing Udemy practice-test CSV back into the GenAI JSON schema.
// Usage: node scripts/csv-to-json.mjs <input.csv> <output.json>
import { readFileSync, writeFileSync } from "node:fs";

const [, , inPath, outPath] = process.argv;

function parseCSV(t) {
  const rows = []; let f = "", row = [], q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; }
    else if (c === "\r") { /* skip */ }
    else f += c;
  }
  if (f !== "" || row.length) { row.push(f); rows.push(row); }
  return rows;
}

const rows = parseCSV(readFileSync(inPath, "utf8"));
const out = [];
for (let r = 1; r < rows.length; r++) {
  const c = rows[r];
  if (!c[0]) continue;
  const options = [];
  for (const k of [2, 4, 6, 8, 10, 12]) if (c[k] && c[k].trim() !== "") options.push(c[k]);
  const correct = String(c[14]).split(",").map((s) => parseInt(s.trim(), 10) - 1).filter((n) => !isNaN(n));
  const type = /multi-?select/i.test(c[1]) ? "multi" : "single";
  out.push({
    category: c[16],
    type,
    question: c[0],
    options,
    correct,
    explanation: c[15],
    sourceKey: "",
  });
}
writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");
console.log(`wrote ${out.length} questions -> ${outPath}`);
