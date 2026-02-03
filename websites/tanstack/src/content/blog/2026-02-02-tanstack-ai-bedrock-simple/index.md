---
title: TanStack AI with AWS Bedrock on TanStack Start (simple example)
date: "2026-02-02 08:15:18"
published: true
summary: "Add TanStack AI with AWS Bedrock to your TanStack Start on AWS setup: Bedrock usage, IAM permissions, and a minimal chat example."
categories: aws
cover_image: ./cover-image.png
tags:
  - aws
  - cdk
  - tanstack
series: tanstack-aws
---

## Introduction

In [Deploying TanStack Start on AWS with Lambda Function URLs](/blog/2025-11-30-tanstack-start-aws-serverless/), I describe how to deploy TanStack Start serverless on AWS. This post shows how to add [TanStack AI](https://tanstack.com/ai/latest) with [AWS Bedrock](https://aws.amazon.com/bedrock/) to that setup: Bedrock usage, IAM wiring, and a minimal chat example.

The implementation is available in the [tanstack-aws repository](https://github.com/JohannesKonings/tanstack-aws) at the tag [2026-02-02-tanstack-ai-bedrock-simple](https://github.com/JohannesKonings/tanstack-aws/tree/2026-02-02-tanstack-ai-bedrock-simple).

## Disclaimer

This is a minimal example to get you started. It is not production-ready; restrict Bedrock resources by model ARN, add auth, and harden error handling as needed.

## TanStack AI and Bedrock

TanStack AI provides a unified API for AI features (chat, completion, streaming) and supports multiple backends via providers. AWS Bedrock is the model backend here: you configure a Bedrock provider with region and model id, and the app uses it for streaming chat.

TanStack AI is a good fit for this stack: it integrates with **TanStack DevTools** so you can inspect requests and streams during development. **Deeper integration** with the router, SSR, or data layer is thinkable for future posts.

An official Bedrock adapter is not yet in TanStack AI, but it is on the [roadmap](https://tanstack.com/blog/tanstack-ai-alpha-2#whats-next), and [pull requests](https://github.com/TanStack/ai/pull/220) already exist.

## Custom Bedrock adapter

Until the official adapter lands, the tanstack-aws repo uses a **custom Bedrock adapter** that plugs into TanStack AI. It wraps the AWS Bedrock Runtime client (Converse / ConverseStream) and exposes the interface TanStack AI expects for chat and streaming.

Key files at the [2026-02-02-tanstack-ai-bedrock-simple](https://github.com/JohannesKonings/tanstack-aws/tree/2026-02-02-tanstack-ai-bedrock-simple) tag:

- **Adapter**: [src/webapp/integrations/bedrock-adapter/index.ts](https://github.com/JohannesKonings/tanstack-aws/blob/2026-02-02-tanstack-ai-bedrock-simple/src/webapp/integrations/bedrock-adapter/index.ts) — custom Bedrock provider for TanStack AI
- **Chat API route**: [src/webapp/routes/demo/api.tanchat.ts](https://github.com/JohannesKonings/tanstack-aws/blob/2026-02-02-tanstack-ai-bedrock-simple/src/webapp/routes/demo/api.tanchat.ts) — server route that uses the adapter and streams the response
- **Chat UI**: [src/webapp/routes/demo/tanchat.tsx](https://github.com/JohannesKonings/tanstack-aws/blob/2026-02-02-tanstack-ai-bedrock-simple/src/webapp/routes/demo/tanchat.tsx) — demo chat page that calls the API and renders the stream

A small [test script](https://github.com/JohannesKonings/tanstack-aws/blob/2026-02-02-tanstack-ai-bedrock-simple/scripts/test-bedrock-chat.ts) (`pnpm test:bedrock`) calls the same Bedrock model (Converse and ConverseStream) without the web app, for quick verification.

## Bedrock and IAM in CDK

The Lambda that runs the TanStack Start server (and thus the AI route) must be allowed to call Bedrock. In CDK, add a policy to the Lambda’s role with `bedrock:InvokeModel` and `bedrock:InvokeModelWithResponseStream`. The example below uses `resources: ["*"]`; for production, scope `resources` to the specific Bedrock model ARNs you use.

```typescript
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Duration, Tags } from "aws-cdk-lib";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import path from "node:path";

export class WebappServer extends Construct {
  readonly webappServer: Function;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.webappServer = new Function(this, "WebappServer", {
      code: Code.fromAsset(
        path.join(
          path.dirname(new URL(import.meta.url).pathname),
          "../../.output/server",
        ),
      ),
      handler: "index.handler",
      memorySize: 2048,
      runtime: Runtime.NODEJS_24_X,
      timeout: Duration.seconds(60),
    });
    Tags.of(this.webappServer).add("IsWebAppServer", "true");

    this.webappServer.addToRolePolicy(
      new PolicyStatement({
        actions: [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream",
        ],
        effect: Effect.ALLOW,
        resources: ["*"],
      }),
    );
  }
}
```

https://github.com/JohannesKonings/tanstack-aws/blob/2026-02-02-tanstack-ai-bedrock-simple/lib/constructs/WebappServer.ts

The Lambda runs in your AWS account and uses its execution role; no API keys are required in the app. Bedrock is invoked from the server (e.g. in a TanStack Start API route or server handler), so credentials stay off the client.

## Using the Bedrock provider in the app

In the app, create a Bedrock provider (region, model id, and optionally env-driven config) and use it where you need AI—for example in a server route that handles chat and streams the response. The [tanstack-aws](https://github.com/JohannesKonings/tanstack-aws/tree/2026-02-02-tanstack-ai-bedrock-simple) repo at the tag above implements a demo chat with streaming; see the Bedrock provider and chat route there for the full code.

The flow is: client calls your API route → server uses the Bedrock provider and TanStack AI to call the model and stream back → client renders the stream. TanStack AI’s streaming API and optional DevTools help with debugging and UX.

## Checking a budget with metrics

AWS Bedrock publishes usage to **CloudWatch** in the `AWS/Bedrock` namespace: metrics such as `InputTokenCount` and `OutputTokenCount` with dimension `ModelId`. You can use these to estimate daily cost and enforce a simple budget.

In the tanstack-aws repo at the tag:

1. **Get today’s token usage** — Call CloudWatch `GetMetricStatistics` for the model’s `InputTokenCount` and `OutputTokenCount` over the current UTC day and sum the datapoints.
2. **Estimate cost** — Multiply input/output token counts by your model’s per‑million‑token prices (e.g. Nova Pro; configurable via env) to get an estimated cost in USD.
3. **Compare to a limit** — Define a daily limit (e.g. $2) and return `overBudget` when estimated cost ≥ limit. The chat route can then block or warn before calling Bedrock.

Key files:

- [src/webapp/lib/bedrock-budget-config.ts](https://github.com/JohannesKonings/tanstack-aws/blob/2026-02-02-tanstack-ai-bedrock-simple/src/webapp/lib/bedrock-budget-config.ts) — daily limit (e.g. `DAILY_LIMIT_USD`)
- [src/webapp/lib/bedrock-budget.ts](https://github.com/JohannesKonings/tanstack-aws/blob/2026-02-02-tanstack-ai-bedrock-simple/src/webapp/lib/bedrock-budget.ts) — CloudWatch client, `GetMetricStatistics` for tokens, cost estimation, and a server function for the UI
- [src/webapp/routes/demo/api.bedrock-budget.ts](https://github.com/JohannesKonings/tanstack-aws/blob/2026-02-02-tanstack-ai-bedrock-simple/src/webapp/routes/demo/api.bedrock-budget.ts) — API route that returns budget status (tokens, estimated cost, overBudget)

The Lambda needs **CloudWatch read** permissions for these metrics: `cloudwatch:GetMetricStatistics` and `cloudwatch:ListMetrics`. The [WebappServer](https://github.com/JohannesKonings/tanstack-aws/blob/2026-02-02-tanstack-ai-bedrock-simple/lib/constructs/WebappServer.ts) at the tag adds this policy alongside the Bedrock one.

**Disclaimer:** The budget estimate is not accurate — CloudWatch metrics have a delay, so recent usage may not yet appear. It is fine for a simple use case (e.g. a soft cap or rough visibility); for stricter controls, consider other mechanisms.

## Result

The template repository includes a demo chat powered by AWS Bedrock (Claude) with streaming. For a screenshot and deployment overview, see the [TanStack Start serverless](/blog/2025-11-30-tanstack-start-aws-serverless/) post.

## Conclusion

This post showed how to add TanStack AI with AWS Bedrock to TanStack Start on AWS: grant the Lambda role `bedrock:InvokeModel` and `bedrock:InvokeModelWithResponseStream`, use a Bedrock provider in the app, and optionally rely on TanStack DevTools and deeper framework integration later. Next steps include scoping IAM to model ARNs, adding auth to the chat route, and exploring deeper TanStack integration.

## Sources and References

- **tanstack-aws (implementation at tag)**: [github.com/JohannesKonings/tanstack-aws/tree/2026-02-02-tanstack-ai-bedrock-simple](https://github.com/JohannesKonings/tanstack-aws/tree/2026-02-02-tanstack-ai-bedrock-simple)
- **TanStack AI**: [tanstack.com/ai/latest](https://tanstack.com/ai/latest)
- **AWS Bedrock**: [docs.aws.amazon.com/bedrock](https://docs.aws.amazon.com/bedrock/)
