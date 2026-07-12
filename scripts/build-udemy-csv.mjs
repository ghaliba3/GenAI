#!/usr/bin/env node
// Convert data/test-1.json -> Udemy practice-test CSV, appending the verified AWS
// documentation source to each Overall Explanation.
// Usage: node scripts/build-udemy-csv.mjs <output.csv>
import { readFileSync, writeFileSync } from "node:fs";

const inPath = process.argv[2] || "data/test-1.json";
const out = process.argv[3] || "udemy/AWS-GenAI-Practice-Test-1.csv";
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

const HEADER = ["Question", "Question Type",
  "Answer Option 1", "Explanation 1", "Answer Option 2", "Explanation 2",
  "Answer Option 3", "Explanation 3", "Answer Option 4", "Explanation 4",
  "Answer Option 5", "Explanation 5", "Answer Option 6", "Explanation 6",
  "Correct Answers", "Overall Explanation", "Domain"];

const esc = (v) => { const s = v == null ? "" : String(v); return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

const q = JSON.parse(readFileSync(inPath, "utf8"));
const errs = [];
const rows = [HEADER.map(esc).join(",")];

q.forEach((item, i) => {
  const n = i + 1;
  const isMulti = item.type === "multi" || item.type === "multi-select";
  if (!Array.isArray(item.options) || item.options.length < 2 || item.options.length > 6) errs.push(`Q${n}: option count`);
  if (!Array.isArray(item.correct) || (isMulti ? item.correct.length < 2 : item.correct.length !== 1)) errs.push(`Q${n}: correct count`);
  const src = SOURCES[item.sourceKey];
  if (!src) errs.push(`Q${n}: unknown sourceKey ${item.sourceKey}`);

  const opts = [];
  for (let k = 0; k < 6; k++) { opts.push(item.options[k] ?? ""); opts.push(""); }
  const correct = (item.correct || []).map((c) => c + 1).sort((a, b) => a - b).join(",");
  const overall = src ? `${item.explanation}\n\nSource: ${src[1]} — ${src[0]}` : item.explanation;

  rows.push([item.question, isMulti ? "multi-select" : "multiple-choice", ...opts, correct, overall, item.category].map(esc).join(","));
});

if (errs.length) { console.error("Validation failed:\n" + errs.join("\n")); process.exit(1); }
writeFileSync(out, rows.join("\r\n") + "\r\n");
console.log(`wrote ${q.length} questions -> ${out}`);
