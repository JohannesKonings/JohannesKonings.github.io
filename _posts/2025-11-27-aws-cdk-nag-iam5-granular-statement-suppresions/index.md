---
layout: post
title: Granular statement cdk-nag AwsSolutions-IAM5 Suppressions
date: "2025-11-27 08:15:18"
published: true
summary: How to document and suppress only the wildcard permissions that are required by AWS services, while keeping the rest of AwsSolutions-IAM5 findings active.
categories: aws
cover_image: ./cover-image.png
tags:
  - aws
  - cdk
  - cdk-nag
---

## Overview

cdk-nag’s AwsSolutions-IAM5 rule is one of the most frequent findings in real-world stacks. It flags wildcard permissions in both `Action` (e.g., `kms:GenerateDataKey*`) and `Resource` (e.g., `*`) when there is no evidence-backed suppression. The challenge is that some AWS APIs are designed to require `*` (e.g., [AWS X-Ray](https://docs.aws.amazon.com/xray/latest/devguide/security_iam_service-with-iam.html)). Blanket suppressions hide too much. This post demonstrates how to record granular evidence specifically for actions that require `*`, ensuring that all other findings remain active.

## Understanding the Problem

### Why IAM5 triggers

You’ll hit AwsSolutions-IAM5 when a policy uses an asterisk (`"*"`) in the resource or wildcards in actions. This is beneficial because least privilege is critical. However, several AWS APIs require `*` by design, or you might initially group actions broadly before refining the scope. Common examples include:

```typescript
new PolicyStatement({
  actions: ["xray:PutTelemetryRecords", "xray:PutTraceSegments"],
  resources: ["*"],
  effect: Effect.ALLOW,
});
```

```typescript
new PolicyStatement({
        actions: ["kms:GenerateDataKey*", "kms:ReEncrypt*"],
        resources: [
          "arn:aws:kms:eu-central-1:471112809534:key/a096e96c-780e-48eb-993b-5b8cc46d8fd7",
        ],
        effect: Effect.ALLOW,
      }),
```


### Example Failure

An IAM5 failure typically looks like this:

```shell
[Error at /StackMain/MyRole/Policy/Resource] AwsSolutions-IAM5[Resource::*]: The IAM entity contains wildcard permissions and does not have a cdk-nag rule suppression with evidence for those permissions.
```

### Why blanket suppression isn't enough

Suppressing the entire resource or the entire rule hides legitimate issues and loses the evidence that auditors expect. The goal is to:

- Keep the rule active for statements that can be scoped.
- Provide explicit evidence for the few actions that require `*`.

```typescript
// Bad: over-broad, hides everything
NagSuppressions.addResourceSuppressions(role, [
  { id: 'AwsSolutions-IAM5', reason: 'needs wildcard' },
]);
```

This approach makes reviews harder and weakens the principle of least privilege.

## The Solution

### Overview

The solution involves using granular suppressions that document exactly which actions require `*` and why. Everything else remains flagged by cdk-nag. The
[cdk-nag-custom-nag-pack](https://github.com/JohannesKonings/cdk-nag-custom-nag-pack) automates this by:

1. Inspecting policy statements with ` *`.
2. Adding a single AwsSolutions-IAM5 suppression per resource with `appliesTo` evidence for only those actions.
3. Leaving non-allowed wildcard actions reported so you can scope them properly.

### Implementation

The repository includes a dedicated helper (`iam5NagSuppressions.ts`) that applies these granular suppressions automatically. The essential components are:

- **Statement scanning**: Iterates IAM policy statements and selects those with `Resource: *` (including arrays that contain `*`).
- **Evidence builder**: Produces `appliesTo` entries for `Resource::*` and only the allow-listed `Action::<service:operation>` values present in the statement.
- **Targeting**: Attaches a single `AwsSolutions-IAM5` suppression to each IAM Policy construct via its path, leaving any non-allowed wildcard actions unsuppressed (so they continue to fail until scoped).

You can find the source code here: [iam5NagSuppressions.ts](https://github.com/JohannesKonings/cdk-nag-custom-nag-pack/blob/main/src/iam5NagSuppressions.ts)

### Critical Difference: String-Based vs. Statement-Based Suppressions

**Important:** There are two fundamentally different approaches to granular IAM5 suppressions, each offering different levels of safety:

#### 1. cdk-nag's Built-in `appliesTo` 

The standard cdk-nag approach (see Example 6 in the [cdk-nag docs](https://github.com/cdklabs/cdk-nag?tab=readme-ov-file#suppressing-a-rule)) relies on string patterns:

```typescript
NagSuppressions.addResourceSuppressions(lambda, [
  {
    id: 'AwsSolutions-IAM5',
    reason: 'X-Ray requires wildcard',
    appliesTo: [
      'Resource::*',
    ]
  }
], true);
```

**The Problem:** This suppresses `Resource::*` and the specified actions **anywhere they appear** in the construct tree. If you later add a new policy statement like:

```typescript
// This will be silently suppressed!
new PolicyStatement({
  actions: ['xray:PutTelemetryRecords'],  // Matches the suppression
  resources: ['*'],                        // Matches the suppression
  effect: Effect.ALLOW,
});
```

The suppression hides it because the **strings match**, even though this might be an unintended permission you added months later.

#### 2. cdk-nag-custom-nag-pack's Statement Validation 

The [cdk-nag-custom-nag-pack approach](https://github.com/JohannesKonings/cdk-nag-custom-nag-pack?tab=readme-ov-file#granular-awssolutions-iam5-suppressions) requires exact statement matching:

```typescript
const policyStatementForSuppression: PolicyStatementProps = {
  actions: ['xray:PutTelemetryRecords', 'xray:PutTraceSegments'],
  resources: ['*'],
  effect: Effect.ALLOW,
};

Iam5NagSuppressions.addIam5StatementResourceSuppressions(
  lambda,
  {
    id: 'AwsSolutions-IAM5',
    reason: 'X-Ray requires wildcard',
    appliesTo: [policyStatementForSuppression],
  },
  true
);
```

**The Benefit:** The suppression applies only if there is an **exact match** of the entire policy statement (Effect, Actions, Resources). If you add a new statement with different actions or resources later:

```typescript
// This will NOT be suppressed - it will be flagged!
new PolicyStatement({
  actions: ['xray:PutTelemetryRecords', 's3:*'],  // Different actions
  resources: ['*'],
  effect: Effect.ALLOW,
});
```

It will be flagged because the statement does not match exactly. This prevents the accidental hiding of new wildcards added over time.

**Key Takeaway:** The `cdk-nag-custom-nag-pack` method validates the complete policy statement structure, whereas cdk-nag's built-in `appliesTo` relies on string patterns that may inadvertently suppress unrelated future wildcards.

### Benefits

This statement-based approach:

- Documents exactly why `*` is needed for specific AWS APIs
- Keeps AwsSolutions-IAM5 active for everything else
- Produces review-ready evidence via `appliesTo`
- **Prevents accidental suppression of future wildcard permissions**


### Lambda Construct Wildcard Scenario

The `aws-lambda.Function` construct (and its default execution role or managed policies) often introduces unavoidable wildcard permissions, such as those required for CloudWatch Logs creation or X-Ray tracing.

**The Risk:** If you suppress `AwsSolutions-IAM5` broadly at the Function or Role level, you inadvertently hide *every* future wildcard you might add (e.g., `s3:*` or `dynamodb:*`).

**The Granular Strategy:**

1.  **Isolate:** Put truly unavoidable wildcard actions (e.g., `logs:CreateLogGroup`, `xray:PutTraceSegments`) in their own dedicated `PolicyStatement`.
2.  **Suppress:** Apply the suppression *only* to that specific statement, citing the AWS service limitation as the reason.
3.  **Scope:** Ensure all other actions are scoped to specific ARNs (log streams, tables, buckets, queues, etc.).
4.  **Avoid:** Do not use parent-level suppressions, as they mask future configuration drift.

**Result:** Required wildcards are documented and allowed, while accidental broad permissions continue to be reported.

## Additional Resources

- [cdk-nag-custom-nag-pack - Granular IAM5 suppressions](https://github.com/JohannesKonings/cdk-nag-custom-nag-pack?tab=readme-ov-file#granular-awssolutions-iam5-suppressions)
- [cdk-nag documentation](https://github.com/cdklabs/cdk-nag)
