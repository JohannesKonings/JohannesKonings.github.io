---
title: Cleanup Resources from Ephemeral Stacks in AWS CDK with Aspects and Property Injectors
date: "2025-06-14 08:15:18"
published: false
summary: When developing features with ephemeral CDK stacks, the resource retention configuration needs to differ from test and production stacks. This article explains how to use CDK Aspects and Property Injectors to automatically clean up resources from ephemeral stacks.
categories: aws
cover_image: ./cover-image.png
tags:
  - aws
  - cdk
---

- https://github.com/aws/aws-cdk-rfcs/issues/673
- https://developer.mamezou-tech.com/en/blogs/2024/12/15/aws-app-signals-lambda/

## Overview

When using AWS CDK, Aspects allow us to apply a `RemovalPolicy.DESTROY` to all resources within an ephemeral stack. This works well for many resources but isn't sufficient for S3 buckets that require objects to be automatically deleted before the bucket itself can be removed.
With the newer Property Injectors feature, we can centrally set the `autoDeleteObjects` property for S3 buckets based on the stack type (e.g., ephemeral vs. production). This enables the use of the same CDK code for test, production, and ephemeral stacks while ensuring appropriate cleanup or retention.

CDK Property Injectors, in general, are described [here](https://dev.to/aws/aws-cdk-in-action-may-2025-empowered-deployments-governance-and-community-1gdb).
CDK Aspects, particularly for setting the removal policy, are detailed [here](https://dev.to/aws-builders/enforcing-compliance-with-aws-cdk-aspects-1goo).

## Implementation

This post will demonstrate an example using a CloudWatch Log Group and an S3 Bucket. For long-lived stacks (like test and production), both resources should be retained even if the stack is destroyed. For ephemeral stacks, this default retention behavior will be overridden to ensure complete cleanup.

## Aspects

Aspects are ideal for applying broad changes across constructs in a stack. Here, we'll use an Aspect to set the `RemovalPolicy` for all resources.

The Aspect looks like this:

```typescript
import { CfnResource, type IAspect, RemovalPolicy } from "aws-cdk-lib"; // Combined RemovalPolicy import
import type { IConstruct } from "constructs";

export class DeletionPolicySetter implements IAspect {
  constructor(private readonly policy: RemovalPolicy) {}
  visit(node: IConstruct): void {
    if (node instanceof CfnResource) {
      node.applyRemovalPolicy(this.policy);
    }
  }
}
```

It will be applied in your CDK application like this:

```typescript
Aspects.of(app).add(new DeletionPolicySetter(RemovalPolicy.DESTROY));
```

## Property Injection

While Aspects handle the general removal policy, S3 buckets need the `autoDeleteObjects` property set to `true` for automatic cleanup. Property Injectors are perfect for such targeted modifications.

The Property Injector for S3 buckets looks like this:

```typescript
import {
  InjectionContext,
  IPropertyInjector,
  RemovalPolicy,
} from "aws-cdk-lib";
import { Bucket, BucketProps } from "aws-cdk-lib/aws-s3";

export class BucketAutoDeletionSetter implements IPropertyInjector {
  public readonly constructUniqueId: string;

  constructor(private readonly autoDeleteObjects: boolean) {
    this.constructUniqueId = Bucket.PROPERTY_INJECTION_ID;
  }

  public inject(
    originalProps: BucketProps,
    _context: InjectionContext,
  ): BucketProps {
    return {
      ...originalProps,
      autoDeleteObjects: this.autoDeleteObjects,
      // If autoDeleteObjects is true, RemovalPolicy must be DESTROY.
      // Otherwise, retain the original policy.
      removalPolicy: this.autoDeleteObjects
        ? RemovalPolicy.DESTROY
        : originalProps.removalPolicy,
    };
  }
}
```

If `autoDeleteObjects` is set to `true`, the `removalPolicy` must also be set to `RemovalPolicy.DESTROY`; otherwise, the CDK will throw a validation error during synthesis.

It will be applied in your CDK application like this:

```typescript
PropertyInjectors.of(app).add(new BucketAutoDeletionSetter(true));
```

## Example Stack Definition

The CDK constructs for the Log Group and the S3 Bucket are instantiated within a stack as follows:

```typescript
import { Stack, StackProps } from "aws-cdk-lib";
import type { Construct } from "constructs";
import { LogGroup, LogGroupProps } from "aws-cdk-lib/aws-logs";
import { Bucket, BucketProps } from "aws-cdk-lib/aws-s3";

export type StackMainProps = StackProps; // Can be extended with custom props

export class StackMain extends Stack {
  constructor(scope: Construct, id: string, props?: StackMainProps) {
    super(scope, id, props);

    // By default, LogGroup and Bucket have RemovalPolicy.RETAIN if not specified otherwise.
    // For production/test, this is desired. For ephemeral, Aspects/Injectors will override.
    new LogGroup(this, "LogGroup"); // Consider adding default props if needed, e.g., retention

    new Bucket(this, "Bucket");
  }
}
```

By default, `LogGroup` and `Bucket` constructs (when not further configured) often default to a `RemovalPolicy` of `RETAIN` or have specific behaviors (like S3 buckets not deleting if non-empty). This is generally what we want for test and production stacks. The Aspects and Property Injectors will override these for ephemeral stacks.

## App Configuration

The `app.ts` will check an environment variable, `EPHEMERAL_STACKS`. If this variable is set to `"true"`, it will apply the Aspects and Property Injectors via the `ephemeralStacksCleanup` function to configure the stacks for automatic cleanup. This variable is typically set in CI/CD pipelines for feature branches or locally by developers.

```typescript
#!/usr/bin/env node
import type { Environment } from "aws-cdk-lib";
import { App, Aspects, PropertyInjectors, RemovalPolicy } from "aws-cdk-lib";
import { DeletionPolicySetter } from "../lib/aspects/DeletionPolicySetter";
import { AwsSolutionsChecks } from "cdk-nag"; // Assuming cdk-nag is used for compliance checks
import { StackMain } from "../lib/stacks/stack";
import { BucketAutoDeletionSetter } from "../lib/propertyInjectors/BucketAutoDeletionSetter";

const app = new App();

const env: Environment = {
  account: process.env.APP_ACCOUNT,
  region: process.env.APP_REGION,
};

// Function to apply cleanup settings for ephemeral stacks
const ephemeralStacksCleanup = (targetApp: App) => {
  // Pass app to scope Aspects/Injectors
  Aspects.of(targetApp).add(new DeletionPolicySetter(RemovalPolicy.DESTROY));
  PropertyInjectors.of(targetApp).add(new BucketAutoDeletionSetter(true));
};

const appMain = (isEphemeral: boolean) => {
  if (isEphemeral) {
    ephemeralStacksCleanup(app); // Apply to the current app instance
  }

  new StackMain(app, "StackMain", { env }); // Pass env to the stack

  // Apply general compliance checks (e.g., cdk-nag) after all other modifications
  Aspects.of(app).add(new AwsSolutionsChecks());
};

// Determine if building for ephemeral stacks
appMain(process.env.EPHEMERAL_STACKS === "true");
```

## CloudFormation Results

**Ephemeral Stacks:**

When `EPHEMERAL_STACKS` is true, the generated CloudFormation will include `DeletionPolicy: Delete` and auto-delete configurations for S3:

```json
{
  "Resources": {
    "LogGroupF5B46931": {
      "Type": "AWS::Logs::LogGroup",
      "Properties": {
        "RetentionInDays": 731 // Default retention, can also be configured via props or aspects
      },
      "UpdateReplacePolicy": "Delete", // This is also influenced by the RemovalPolicy
      "DeletionPolicy": "Delete",
      "Metadata": {
        "aws:cdk:path": "StackMain/LogGroup/Resource"
      }
    },
    "Bucket83908E77": {
      "Type": "AWS::S3::Bucket",
      "Properties": {
        "Tags": [
          {
            "Key": "aws-cdk:auto-delete-objects",
            "Value": "true"
          }
          // Other bucket properties...
        ]
      },
      "UpdateReplacePolicy": "Delete", // This is also influenced by the RemovalPolicy
      "DeletionPolicy": "Delete",
      "Metadata": {
        "aws:cdk:path": "StackMain/Bucket/Resource"
      }
    },
    "BucketPolicyE9A3008A": {
      "Type": "AWS::S3::BucketPolicy",
      "Properties": {
        "Bucket": {
          "Ref": "Bucket83908E77"
        },
        "PolicyDocument": {
          "Statement": [
            {
              "Action": [
                "s3:DeleteObject*",
                "s3:GetBucket*",
                "s3:List*",
                "s3:PutBucketPolicy"
              ],
              "Effect": "Allow",
              "Principal": {
                "AWS": {
                  "Fn::GetAtt": [
                    "CustomS3AutoDeleteObjectsCustomResourceProviderRole3B1BD092",
                    "Arn"
                  ]
                }
              },
              "Resource": [
                {
                  "Fn::GetAtt": ["Bucket83908E77", "Arn"]
                },
                {
                  "Fn::Join": [
                    "",
                    [
                      {
                        "Fn::GetAtt": ["Bucket83908E77", "Arn"]
                      },
                      "/*"
                    ]
                  ]
                }
              ]
            }
          ],
          "Version": "2012-10-17"
        }
      },
      "UpdateReplacePolicy": "Delete",
      "DeletionPolicy": "Delete",
      "Metadata": {
        "aws:cdk:path": "StackMain/Bucket/Policy/Resource"
      }
    },
    "BucketAutoDeleteObjectsCustomResourceBAFD23C2": {
      "Type": "Custom::S3AutoDeleteObjects",
      "Properties": {
        "ServiceToken": {
          "Fn::GetAtt": [
            "CustomS3AutoDeleteObjectsCustomResourceProviderHandler9D90184F",
            "Arn"
          ]
        },
        "BucketName": {
          "Ref": "Bucket83908E77"
        }
      },
      "DependsOn": ["BucketPolicyE9A3008A"],
      "UpdateReplacePolicy": "Delete",
      "DeletionPolicy": "Delete",
      "Metadata": {
        "aws:cdk:path": "StackMain/Bucket/AutoDeleteObjectsCustomResource/Default"
      }
    },
    "CustomS3AutoDeleteObjectsCustomResourceProviderRole3B1BD092": {
      "Type": "AWS::IAM::Role",
      "Properties": {
        "AssumeRolePolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Action": "sts:AssumeRole",
              "Effect": "Allow",
              "Principal": {
                "Service": "lambda.amazonaws.com"
              }
            }
          ]
        },
        "ManagedPolicyArns": [
          {
            "Fn::Sub": "arn:${AWS::Partition}:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
          }
        ]
      },
      "UpdateReplacePolicy": "Delete",
      "DeletionPolicy": "Delete",
      "Metadata": {
        "aws:cdk:path": "StackMain/Custom::S3AutoDeleteObjectsCustomResourceProvider/Role"
      }
    },
    "CustomS3AutoDeleteObjectsCustomResourceProviderHandler9D90184F": {
      "Type": "AWS::Lambda::Function",
      "Properties": {
        "Code": {
          "S3Bucket": {
            "Fn::Sub": "cdk-hnb659fds-assets-${AWS::AccountId}-${AWS::Region}"
          },
          "S3Key": "faa95a81ae7d7373f3e1f242268f904eb748d8d0fdd306e8a6fe515a1905a7d6.zip"
        },
        "Timeout": 900,
        "MemorySize": 128,
        "Handler": "index.handler",
        "Role": {
          "Fn::GetAtt": [
            "CustomS3AutoDeleteObjectsCustomResourceProviderRole3B1BD092",
            "Arn"
          ]
        },
        "Runtime": "nodejs22.x",
        "Description": {
          "Fn::Join": [
            "",
            [
              "Lambda function for auto-deleting objects in ",
              {
                "Ref": "Bucket83908E77"
              },
              " S3 bucket."
            ]
          ]
        }
      },
      "DependsOn": [
        "CustomS3AutoDeleteObjectsCustomResourceProviderRole3B1BD092"
      ],
      "UpdateReplacePolicy": "Delete",
      "DeletionPolicy": "Delete",
      "Metadata": {
        "aws:cdk:path": "StackMain/Custom::S3AutoDeleteObjectsCustomResourceProvider/Handler",
        "aws:asset:path": "asset.faa95a81ae7d7373f3e1f242268f904eb748d8d0fdd306e8a6fe515a1905a7d6",
        "aws:asset:property": "Code"
      }
    }
  }
}
```

The test and production stacks will have the same resources but with the removal policy set to `RemovalPolicy.RETAIN` and the S3 bucket without the auto deletion.

```json
{
  "Resources": {
    "LogGroupF5B46931": {
      "Type": "AWS::Logs::LogGroup",
      "Properties": {
        "RetentionInDays": 731
      },
      "UpdateReplacePolicy": "Retain",
      "DeletionPolicy": "Retain",
      "Metadata": {
        "aws:cdk:path": "StackMain/LogGroup/Resource"
      }
    },
    "Bucket83908E77": {
      "Type": "AWS::S3::Bucket",
      "Properties": {},
      "UpdateReplacePolicy": "Retain",
      "DeletionPolicy": "Retain",
      "Metadata": {
        "aws:cdk:path": "StackMain/Bucket/Resource"
      }
    }
  }
}
```

## Additional Resources

- https://dev.to/aws/aws-cdk-in-action-may-2025-empowered-deployments-governance-and-community-1gdb
- https://dev.to/aws-builders/enforcing-compliance-with-aws-cdk-aspects-1goo
