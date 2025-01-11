---
layout: post
title: Config AWS Cloudwatch Application Signals Transaction Search with CDK
date: "2025-01-07 08:15:18"
published: true
summary: Learn how to enable and configure AWS CloudWatch Application Signals Transaction Search functionality using AWS CDK, including setting up required IAM policies and X-Ray configurations
categories: aws
cover_image: ./cover-image.png
tags:
  - aws
  - aws application signals
  - cdk
  - cloudwatch
  - x-ray
  - transaction search
---

## Use case

You want to use [AWS Cloudwatch Application Signals Transaction Search](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Application-Monitoring-Sections.html) and your IaC is based on AWS CDK.

## Setup

This is how the Transaction Search page looks like, if it's not yet configured:

![application signals transaction search without config](./application-signals-transaction-search-without-config.png)

And like this in the x-ray settings:

![application signals transaction search without config x-ray](./application-signals-transaction-search-without-xray-config.png)

The AWS documentation outlines the steps to enable Transaction Search functionality here: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Transaction-Search-getting-started.html#w24aac24c21c13b9

While the documentation provides AWS CLI commands, we can implement the same configuration using AWS CDK Custom Resources for infrastructure as code.

The whole configuration looks like this:

```typescript
    const { account, region } = Stack.of(this);

      // https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Transaction-Search-getting-started.html#w24aac24c21c13b9
      const applicationSignalsTransactionSearchLogsResourcePolicy =
        new AwsCustomResource(
          this,
          "ApplicationSignalsTransactionSearchLogsResourcePolicy",
          {
            onCreate: {
              service: "@aws-sdk/client-cloudwatch-logs",
              action: "PutResourcePolicy",
              parameters: {
                policyName:
                  "ApplicationSignalsTransactionSearchLogsResourcePolicy",
                policyDocument: JSON.stringify({
                  Version: "2012-10-17",
                  Statement: [
                    {
                      Sid: "TransactionSearchXRayAccess",
                      Effect: "Allow",
                      Principal: {
                        Service: "xray.amazonaws.com",
                      },
                      Action: ["logs:PutLogEvents", "logs:CreateLogStream"],
                      Resource: [
                        `arn:aws:logs:${region}:${account}:log-group:aws/spans:*`,
                        `arn:aws:logs:${region}:${account}:log-group:/aws/application-signals/data:*`,
                      ],
                      Condition: {
                        ArnLike: {
                          "aws:SourceArn": `arn:aws:xray:${region}:${account}:*`,
                        },
                        StringEquals: {
                          "aws:SourceAccount": account,
                        },
                      },
                    },
                  ],
                }),
              },
              physicalResourceId: PhysicalResourceId.of(
                "ApplicationSignalsTransactionSearchLogsResourcePolicy",
              ),
            },
            policy: AwsCustomResourcePolicy.fromSdkCalls({
              resources: AwsCustomResourcePolicy.ANY_RESOURCE,
            }),
          },
        );
      const applicationSignalsTransactionSearchXraySegmentDestination =
        new AwsCustomResource(
          this,
          "ApplicationSignalsTransactionSearchXraySegmentDestination",
          {
            onCreate: {
              service: "@aws-sdk/client-xray",
              action: "UpdateTraceSegmentDestination",
              parameters: {
                Destination: "CloudWatchLogs",
              },
              physicalResourceId: PhysicalResourceId.of(
                "ApplicationSignalsTransactionSearchXraySegmentDestination",
              ),
            },
            installLatestAwsSdk: true,
            policy: AwsCustomResourcePolicy.fromStatements([
              new PolicyStatement({
                effect: Effect.ALLOW,
                actions: ["logs:PutRetentionPolicy"],
                resources: [
                  `arn:aws:logs:${region}:${account}:log-group:aws/spans:log-stream:`,
                ],
              }),
              new PolicyStatement({
                effect: Effect.ALLOW,
                actions: ["xray:UpdateTraceSegmentDestination"],
                resources: ["*"],
              }),
            ]),
          },
        );
      applicationSignalsTransactionSearchXraySegmentDestination.node.addDependency(
        applicationSignalsTransactionSearchLogsResourcePolicy,
      );
      const applicationSignalsTransactionSearchXrayIndexRule =
        new AwsCustomResource(
          this,
          "ApplicationSignalsTransactionSearchXrayIndexRule",
          {
            onCreate: {
              service: "@aws-sdk/client-xray",
              action: "UpdateIndexingRule",
              parameters: {
                Name: "Default",
                Rule: {
                  Probabilistic: {
                    DesiredSamplingPercentage: 100,
                  },
                },
              },
              physicalResourceId: PhysicalResourceId.of(
                "ApplicationSignalsTransactionSearchXrayIndexRule",
              ),
            },
            installLatestAwsSdk: true,
            policy: AwsCustomResourcePolicy.fromSdkCalls({
              resources: AwsCustomResourcePolicy.ANY_RESOURCE,
            }),
          },
        );
      NagSuppressions.addResourceSuppressions(
        [
          applicationSignalsTransactionSearchXraySegmentDestination,
          applicationSignalsTransactionSearchLogsResourcePolicy,
          applicationSignalsTransactionSearchXrayIndexRule,
        ],
        [
          {
            id: "AwsSolutions-IAM5",
            reason: "CDK managed policy",
          },
        ],
        true,
      );
    }
```	

It contains the following steps:

1. Update the Cloudwatch Logs Resource Policy
2. Update the x-ray settings

### Update the Cloudwatch Logs Resource Policy

The documentation [here](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Transaction-Search-getting-started.html#w24aac24c21c13b9) is a little bit misleading. The shown condition `arn:partition:logs:region:account-id:*` should be `arn:partition:xray:region:account-id:*`. Also the action `logs:PutLogEvents` should be `logs:PutLogEvents` and `logs:CreateLogStream`.

```typescript
 const applicationSignalsTransactionSearchLogsResourcePolicy =
        new AwsCustomResource(
          this,
          "ApplicationSignalsTransactionSearchLogsResourcePolicy",
          {
            onCreate: {
              service: "@aws-sdk/client-cloudwatch-logs",
              action: "PutResourcePolicy",
              parameters: {
                policyName:
                  "ApplicationSignalsTransactionSearchLogsResourcePolicy",
                policyDocument: JSON.stringify({
                  Version: "2012-10-17",
                  Statement: [
                    {
                      Sid: "TransactionSearchXRayAccess",
                      Effect: "Allow",
                      Principal: {
                        Service: "xray.amazonaws.com",
                      },
                      Action: ["logs:PutLogEvents", "logs:CreateLogStream"],
                      Resource: [
                        `arn:aws:logs:${region}:${account}:log-group:aws/spans:*`,
                        `arn:aws:logs:${region}:${account}:log-group:/aws/application-signals/data:*`,
                      ],
                      Condition: {
                        ArnLike: {
                          "aws:SourceArn": `arn:aws:xray:${region}:${account}:*`,
                        },
                        StringEquals: {
                          "aws:SourceAccount": account,
                        },
                      },
                    },
                  ],
                }),
              },
              physicalResourceId: PhysicalResourceId.of(
                "ApplicationSignalsTransactionSearchLogsResourcePolicy",
              ),
            },
            policy: AwsCustomResourcePolicy.fromSdkCalls({
              resources: AwsCustomResourcePolicy.ANY_RESOURCE,
            }),
          },
        );
```	

### Update the x-ray settings

The 2 API calls for x-ray are nearly straight forward. Only the comamnds `UpdateTraceSegmentDestination` and `UpdateIndexingRule` requires the newest SDK version, because it's introduced in version: https://github.com/aws/aws-sdk-js-v3/releases/tag/v3.698.0


```typescript
 const applicationSignalsTransactionSearchXraySegmentDestination =
        new AwsCustomResource(
          this,
          "ApplicationSignalsTransactionSearchXraySegmentDestination",
          {
            onCreate: {
              service: "@aws-sdk/client-xray",
              action: "UpdateTraceSegmentDestination",
              parameters: {
                Destination: "CloudWatchLogs",
              },
              physicalResourceId: PhysicalResourceId.of(
                "ApplicationSignalsTransactionSearchXraySegmentDestination",
              ),
            },
            installLatestAwsSdk: true,
            policy: AwsCustomResourcePolicy.fromStatements([
              new PolicyStatement({
                effect: Effect.ALLOW,
                actions: ["logs:PutRetentionPolicy"],
                resources: [
                  `arn:aws:logs:${region}:${account}:log-group:aws/spans:log-stream:`,
                ],
              }),
              new PolicyStatement({
                effect: Effect.ALLOW,
                actions: ["xray:UpdateTraceSegmentDestination"],
                resources: ["*"],
              }),
            ]),
          },
        );
      applicationSignalsTransactionSearchXraySegmentDestination.node.addDependency(
        applicationSignalsTransactionSearchLogsResourcePolicy,
      );
      const applicationSignalsTransactionSearchXrayIndexRule =
        new AwsCustomResource(
          this,
          "ApplicationSignalsTransactionSearchXrayIndexRule",
          {
            onCreate: {
              service: "@aws-sdk/client-xray",
              action: "UpdateIndexingRule",
              parameters: {
                Name: "Default",
                Rule: {
                  Probabilistic: {
                    DesiredSamplingPercentage: 100,
                  },
                },
              },
              physicalResourceId: PhysicalResourceId.of(
                "ApplicationSignalsTransactionSearchXrayIndexRule",
              ),
            },
            installLatestAwsSdk: true,
            policy: AwsCustomResourcePolicy.fromSdkCalls({
              resources: AwsCustomResourcePolicy.ANY_RESOURCE,
            }),
          },
        );
```

## Result

After some minutes the Transaction Search is visible in the Management Console.

![application signals transaction search enabled in x-ray settings](./result-transaction-search-xray-settings.png)

![application signals transaction search enabled in cloudwatch](./result-transaction-search.png)















