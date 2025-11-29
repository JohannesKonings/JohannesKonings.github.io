---
layout: post
title: Encrypt All Lambda Environment Variables with AWS CDK Aspects/Mixins
date: "2025-11-28 08:15:18"
published: true
summary: A guide on how to encrypt all AWS Lambda environment variables using AWS CDK aspects/mixins. Also from third party libraries.
categories: aws
cover_image: ./cover-image.png
tags:
  - aws
  - cdk
  - lambda
---

## Introduction

If you need to ensure that all AWS Lambda environment variables are encrypted with a customer-managed KMS key for compliance or security requirements, you can achieve this using AWS CDK aspects or mixins.

While Lambda functions that you create directly can be configured with the `environmentEncryption` property, third-party libraries or construct libraries may create Lambda functions where you don't have direct control over their configuration.

In such cases, you can use aspects or mixins to enforce encryption on all Lambda functions in your CDK app, regardless of how they were created.



## Aspect, Property Injection or Mixin?

[Aspects](https://docs.aws.amazon.com/cdk/v2/guide/aspects.html) are a way to modify the CDK synth result on a L1 level after the constructs have been created. They are executed during the Prepare phase of the CDK lifecycle, after all constructs are created.

[Property Injection](https://docs.aws.amazon.com/cdk/v2/guide/blueprints.html) is a way to modify the properties of L2 constructs before they are instantiated. Property injection happens during the Construct phase, at the time each construct is created.

[Mixins](https://github.com/aws/aws-cdk/blob/main/packages/%40aws-cdk/mixins-preview/README.md) can be used to modify constructs at any level (L1, L2, or L3). They are executed immediately when applied, unlike Aspects which execute later during synthesis.

### Implementation

The stack look like this:

```typescript
export class StackMain extends Stack {
  readonly encryptionKey: Key;

  constructor(scope: Construct, id: string, props: StackMainProps) {
    super(scope, id, props);

    this.encryptionKey = new Key(this, "EncryptionKey", {
      enableKeyRotation: true,
    });

    // Direct Lambda - environment encryption can be set directly
    new Function(this, "MyFunction", {
      code: Code.fromInline(
        'exports.handler = async function(event, context) { return "Hello World"; };',
      ),
      handler: "index.handler",
      runtime: Runtime.NODEJS_LATEST,
      environmentEncryption: this.encryptionKey,
      environment: {
        DUMMY: "dummy",
      },
    });

    // Indirect Lambda from third-party library - environment encryption cannot be controlled directly
    // Note: This is a hypothetical third-party construct for demonstration purposes
    new Lambda(this, "DummyThirdPartyLambda");
  }
}
```

The app could look like this (using either Aspect or Mixin):

```typescript
const app = new App();
const stack = new StackMain(app, "StackMain", {});

// Option 1: Use Aspect (recommended for production - stable API)
Aspects.of(app).add(
  new LambdaEnvEncryptionSetterAspect(stack.encryptionKey.keyArn),
);

// Option 2: Use Mixin (developer preview - more flexible but API may change)
// Mixins.of(app).apply(
//   new LambdaEnvEncryptionSetterMixin(stack.encryptionKey.keyArn),
// );

// could not be used because the functions are created before the property injection happens, but the key is needed for the injection
// PropertyInjectors.of(app).add(
//   new LambdaEnvEncryptionSetterAspectPropertyInjection(stack.encryptionKey),
// );
```

### Aspect

Here is an example of an aspect that encrypts all Lambda environment variables. This aspect operates on L1 (CfnFunction) constructs and sets the `kmsKeyArn` property during the synthesis Prepare phase:

```typescript
import type { IAspect } from "aws-cdk-lib";
import { CfnFunction } from "aws-cdk-lib/aws-lambda";
import type { IConstruct } from "constructs";

export class LambdaEnvEncryptionSetterAspect implements IAspect {
  public readonly kmsKeyArn: string;
  
  constructor(kmsKeyArn: string) {
    this.kmsKeyArn = kmsKeyArn;
  }

  visit(node: IConstruct): void {
    if (node instanceof CfnFunction) {
      node.kmsKeyArn = this.kmsKeyArn;
    }
  }
}
```

### Property Injector

Property Injection cannot be used in this specific case because:

1. Property Injection only works with L2 constructs (like `lambda.Function`), not L1 constructs (like `lambda.CfnFunction`)
2. Third-party libraries might create L1 constructs directly, bypassing the L2 construct layer
3. Creating the KMS key in the same stack while trying to inject it creates a timing issue, as injection happens during construct instantiation

Here's what the code would look like if you could use it (for reference only):

```typescript
import { type InjectionContext, type IPropertyInjector } from "aws-cdk-lib";
import { IKey } from "aws-cdk-lib/aws-kms";
import { Function, FunctionProps } from "aws-cdk-lib/aws-lambda";

export class LambdaEnvEncryptionSetterPropertyInjector
  implements IPropertyInjector
{
  public readonly constructUniqueId: string;

  constructor(private readonly key: IKey) {
    this.constructUniqueId = Function.PROPERTY_INJECTION_ID;
  }

  public inject(
    originalProps: FunctionProps,
    _context: InjectionContext,
  ): FunctionProps {
    return {
      ...originalProps,
      environmentEncryption: this.key,
    };
  }
}
```

### Mixin

Mixins are currently in developer preview (as of November 2025). Unlike Aspects, Mixins are applied immediately when called, giving you more control over when and how changes are applied. Here is an example of a mixin that encrypts all Lambda environment variables:

```typescript
import { Mixin } from "@aws-cdk/mixins-preview/core";
import "@aws-cdk/mixins-preview/with";
import { IConstruct } from "constructs";
import { CfnFunction } from "aws-cdk-lib/aws-lambda";

export class LambdaEnvEncryptionSetterMixin implements Mixin {
  private readonly kmsKeyArn: string;

  constructor(kmsKeyArn: string) {
    this.kmsKeyArn = kmsKeyArn;
  }

  public supports(construct: IConstruct): boolean {
    return construct instanceof CfnFunction;
  }

  public applyTo(construct: IConstruct): IConstruct {
    if (construct instanceof CfnFunction) {
      construct.kmsKeyArn = this.kmsKeyArn;
    }

    return construct;
  }
}
```

## Conclusion

Using AWS CDK aspects or mixins, you can enforce encryption on all AWS Lambda environment variables in your CDK app, even when using third-party libraries that create Lambda functions. This approach ensures that your Lambda functions adhere to security best practices without requiring direct control over their configuration.

### Which Approach to Use?

Based on the [AWS CDK Mixins RFC](https://github.com/aws/aws-cdk-rfcs/pull/824), the recommended usage is:

- **Aspects**: Use for validation and compliance enforcement. This is the stable, production-ready approach.
- **Mixins**: Use for making changes to constructs. However, since Mixins are still in Developer Preview, the API may change.

**Recommendation for Production**: Use **Aspects** for now, as they provide a stable API and are specifically designed for this type of cross-cutting concern. Once Mixins reach general availability, they may offer additional benefits for construct composition.


## Sources

- https://docs.aws.amazon.com/cdk/v2/guide/aspects.html
- https://docs.aws.amazon.com/cdk/v2/guide/blueprints.html
- https://github.com/aws/aws-cdk/blob/main/packages/%40aws-cdk/mixins-preview/README.md
- https://dev.to/aws-heroes/using-aws-cdk-property-injectors-2mo5
- https://dev.to/aws-heroes/aws-cdk-introduces-mixins-a-major-feature-for-flexible-construct-composition-developer-preview-583d
- https://dev.to/aws/announcing-aws-cdk-mixins-composable-abstractions-for-aws-resources-588m
- https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html#configuration-envvars-encryption
