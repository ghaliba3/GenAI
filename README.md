# AWS Generative AI Developer – Professional (AIP-C01) — Practice Test 1

A single-page practice test (75 original, exam-style questions) for the AWS
Certified **Generative AI Developer – Professional (AIP-C01)** exam, published at
**https://ghaliba3.github.io/GenAI/**.

Each question shows the options, the correct answer, an explanation, and a
**link to the official AWS documentation** that backs the correct answer.

## Source links

Every explanation is backed by a page under `docs.aws.amazon.com` (Amazon
Bedrock User Guide / SageMaker Developer Guide). Each question carries a
`sourceKey`; `build.mjs` resolves it to a verified URL (every URL was checked to
return HTTP 200), and the build fails if any key is unresolved.

## Layout

- `data/test-1.json` — questions: `{ category, type, question, options, correct, explanation, sourceKey }`.
- `build.mjs` — renders `index.html`; holds the verified `sourceKey → URL` map.

## Build

```sh
node build.mjs
```

Plain static HTML — no dependencies.

## Note

Original practice questions by Ghalib Ahmad. Not affiliated with or endorsed by
AWS. Answer sources link to official AWS documentation.
