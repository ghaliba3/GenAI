#!/usr/bin/env node
// Build the GenAI practice-test site (GitHub Pages) from data/test-*.json.
// Landing page (index.html) + one page per test (test-N.html).
// Each answer is backed by an AWS documentation LINK resolved from its sourceKey.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";

const BR = "https://docs.aws.amazon.com/bedrock/latest/userguide/";
const SOURCES = {
  "what-is-bedrock": [BR + "what-is-bedrock.html", "Amazon Bedrock — What is Amazon Bedrock"],
  "converse-api": [BR + "converse-api.html", "Amazon Bedrock — Converse API"],
  "inference": [BR + "inference.html", "Amazon Bedrock — Run inference"],
  "inference-profiles": [BR + "inference-profiles.html", "Amazon Bedrock — Inference profiles"],
  "cross-region-inference": [BR + "cross-region-inference.html", "Amazon Bedrock — Cross-region inference"],
  "prov-throughput": [BR + "prov-throughput.html", "Amazon Bedrock — Provisioned Throughput"],
  "batch-inference": [BR + "batch-inference.html", "Amazon Bedrock — Batch inference"],
  "prompt-caching": [BR + "prompt-caching.html", "Amazon Bedrock — Prompt caching"],
  "models-supported": [BR + "models-supported.html", "Amazon Bedrock — Supported foundation models"],
  "model-access": [BR + "model-access.html", "Amazon Bedrock — Model access"],
  "prompt-management": [BR + "prompt-management.html", "Amazon Bedrock — Prompt management"],
  "knowledge-base": [BR + "knowledge-base.html", "Amazon Bedrock — Knowledge Bases"],
  "kb-how-it-works": [BR + "kb-how-it-works.html", "Amazon Bedrock — How Knowledge Bases work (RAG)"],
  "kb-chunking-parsing": [BR + "kb-chunking-parsing.html", "Amazon Bedrock — Knowledge Base chunking & parsing"],
  "kb-data-source": [BR + "kb-data-source.html", "Amazon Bedrock — Knowledge Base data sources"],
  "kb-vector-store": [BR + "knowledge-base-supported-vector-store.html", "Amazon Bedrock — Supported vector stores"],
  "titan-embedding": [BR + "titan-embedding-models.html", "Amazon Bedrock — Titan Text Embeddings"],
  "agents": [BR + "agents.html", "Amazon Bedrock — Agents"],
  "agents-action-create": [BR + "agents-action-create.html", "Amazon Bedrock — Agent action groups"],
  "agents-multi-agent": [BR + "agents-multi-agent-collaboration.html", "Amazon Bedrock — Multi-agent collaboration"],
  "tool-use": [BR + "tool-use.html", "Amazon Bedrock — Tool use (function calling)"],
  "guardrails": [BR + "guardrails.html", "Amazon Bedrock — Guardrails"],
  "guardrails-components": [BR + "guardrails-components.html", "Amazon Bedrock — Guardrail policies"],
  "guardrails-contextual-grounding": [BR + "guardrails-contextual-grounding-check.html", "Amazon Bedrock — Contextual grounding check"],
  "custom-models": [BR + "custom-models.html", "Amazon Bedrock — Custom models"],
  "model-customization": [BR + "model-customization.html", "Amazon Bedrock — Model customization"],
  "model-evaluation": [BR + "model-evaluation.html", "Amazon Bedrock — Model evaluation"],
  "jumpstart": ["https://docs.aws.amazon.com/sagemaker/latest/dg/jumpstart-foundation-models.html", "SageMaker JumpStart — Foundation models"],
  "data-protection": [BR + "data-protection.html", "Amazon Bedrock — Data protection"],
  "encryption": [BR + "encryption.html", "Amazon Bedrock — Encryption"],
  "security": [BR + "security.html", "Amazon Bedrock — Security"],
  "security-iam": [BR + "security-iam.html", "Amazon Bedrock — Identity and access management"],
  "usingVPC": [BR + "usingVPC.html", "Amazon Bedrock — Interface VPC endpoints (PrivateLink)"],
  "model-invocation-logging": [BR + "model-invocation-logging.html", "Amazon Bedrock — Model invocation logging"],
};

const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const LETTERS = ["A", "B", "C", "D", "E", "F"];

const CSS = `
:root{--bg:#0e131f;--card:#161d2e;--ink:#e8eef7;--mut:#93a1b8;--accent:#8b5cf6;--line:#26314a}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.65 -apple-system,"SF Pro Text","Segoe UI",Roboto,Arial,sans-serif}
a{color:#a78bfa}a:hover{color:#c4b5fd}
header.site{border-bottom:1px solid var(--line);background:radial-gradient(900px 400px at 85% -10%,rgba(139,92,246,.18),transparent 60%)}
.hero{max-width:860px;margin:0 auto;padding:40px 20px 26px}
.hero .eyebrow{color:#a78bfa;font-weight:700;letter-spacing:3px;text-transform:uppercase;font-size:13px}
.hero h1{font-size:32px;margin:8px 0 6px;letter-spacing:-.4px}
.hero p{color:var(--mut);margin:6px 0;font-size:15px}
.wrap{max-width:860px;margin:0 auto;padding:26px 20px 80px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;margin-top:8px}
.tcard{display:block;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:22px;transition:.15s}
.tcard:hover{border-color:var(--accent);transform:translateY(-2px);text-decoration:none}
.tcard h3{margin:0 0 6px;font-size:21px;color:var(--ink)}
.tcard .n{color:var(--mut);font-size:14px}
.back{display:inline-block;margin-bottom:16px;color:var(--mut)}
.q{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px 22px;margin:16px 0}
.q .head{display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap}
.q .num{font-weight:700;font-size:17px}
.badge{font-size:11px;font-weight:700;padding:3px 9px;border-radius:999px;letter-spacing:.4px}
.badge.cat{background:rgba(139,92,246,.15);color:#c4b5fd;border:1px solid rgba(139,92,246,.35)}
.badge.multi{background:rgba(46,204,113,.14);color:#7ee6a8;border:1px solid rgba(46,204,113,.4)}
.qtext{margin:6px 0 12px}
.opts{list-style:none;padding:0;margin:0}
.opts li{padding:8px 12px;border:1px solid var(--line);border-radius:9px;margin:7px 0;background:#111828}
.opts li .l{color:#a78bfa;font-weight:700;margin-right:8px}
details{margin-top:12px;border-top:1px dashed var(--line);padding-top:12px}
summary{cursor:pointer;color:#a78bfa;font-weight:600;list-style:none}
summary::-webkit-details-marker{display:none}
summary::before{content:"\\25B8  "}
details[open] summary::before{content:"\\25BE  "}
.ans{margin-top:10px}
.ans .correctline{font-weight:700;color:#7ee6a8;margin-bottom:6px}
.src{margin-top:12px;font-size:14px;color:var(--mut)}
.src a{font-weight:600}
footer{border-top:1px solid var(--line);color:var(--mut);font-size:13px;padding:24px 20px;text-align:center}
`;

function shell(title, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><style>${CSS}</style></head><body>${body}
<footer>Original AIP-C01 practice questions by Ghalib Ahmad. Answer sources link to official AWS documentation (docs.aws.amazon.com). Not affiliated with or endorsed by AWS.</footer>
</body></html>`;
}

const files = readdirSync("data").filter((f) => /^test-\d+\.json$/.test(f))
  .sort((a, b) => (+a.match(/\d+/)[0]) - (+b.match(/\d+/)[0]));

let missing = [];
const tests = [];

for (const f of files) {
  const num = +f.match(/\d+/)[0];
  const q = JSON.parse(readFileSync(`data/${f}`, "utf8"));
  tests.push({ num, count: q.length });
  const cards = q.map((item, i) => {
    const n = i + 1;
    const correct = (item.correct || []).slice().sort((a, b) => a - b);
    const isMulti = item.type === "multi" || correct.length > 1;
    const opts = item.options.map((o, k) => `<li><span class="l">${LETTERS[k]}</span>${esc(o)}</li>`).join("");
    const src = SOURCES[item.sourceKey];
    if (!src) missing.push(`test-${num} Q${n}: unknown sourceKey "${item.sourceKey}"`);
    const srcHtml = src ? `<div class="src">Source: <a href="${src[0]}" target="_blank" rel="noopener">${esc(src[1])}</a></div>` : "";
    return `<div class="q"><div class="head"><span class="num">Question ${n}</span>
<span class="badge cat">${esc(item.category)}</span>${isMulti ? '<span class="badge multi">Select multiple</span>' : ""}</div>
<div class="qtext">${esc(item.question)}</div>
<ol class="opts" style="list-style:none">${opts}</ol>
<details><summary>Show answer & explanation</summary>
<div class="ans"><div class="correctline">Correct answer: ${correct.map((c) => LETTERS[c]).join(", ")}</div>${esc(item.explanation)}${srcHtml}</div>
</details></div>`;
  }).join("\n");
  const body = `<header class="site"><div class="hero">
<div class="eyebrow">AWS Certified · Specialty Practice</div>
<h1>Generative AI Developer – Professional (AIP-C01) — Practice Test ${num}</h1>
<p>${q.length} exam-style questions with explanations. Each answer links to the official AWS documentation that backs it.</p>
</div></header>
<div class="wrap"><a class="back" href="index.html">&larr; All practice tests</a>${cards}</div>`;
  writeFileSync(`test-${num}.html`, shell(`AIP-C01 Practice Test ${num} — GenAI`, body));
  console.log(`wrote test-${num}.html (${q.length})`);
}

if (missing.length) { console.error("MISSING SOURCES:\n" + missing.join("\n")); process.exit(1); }

const total = tests.reduce((s, t) => s + t.count, 0);
const cards = tests.map((t) =>
  `<a class="tcard" href="test-${t.num}.html"><h3>Practice Test ${t.num}</h3><div class="n">${t.count} questions</div></a>`).join("\n");
const landing = `<header class="site"><div class="hero">
<div class="eyebrow">AWS Certified · Specialty Practice</div>
<h1>Generative AI Developer – Professional (AIP-C01)</h1>
<p>${tests.length} practice tests · ${total} exam-style questions with explanations.</p>
<p>Every answer's explanation links to the official AWS documentation that backs it.</p>
<p style="font-size:13px">By Ghalib Ahmad · original exam-style questions.</p>
</div></header>
<div class="wrap"><div class="grid">${cards}</div></div>`;
writeFileSync("index.html", shell("AWS Generative AI Developer – Professional (AIP-C01) — Practice Tests", landing));
console.log(`wrote index.html (landing, ${tests.length} tests, ${total} questions)`);
