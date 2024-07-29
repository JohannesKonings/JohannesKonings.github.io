---
title: How to check tags in a cdk-nag custom nag pack
date: 2024-07-14 08:15:18
published: true
summary: Description how to check the existence of tags in and also the value of tags in a custom nag pack
categories: aws
thumbnail: cdk
cover_image: ./cover-image.png
tags:
  - aws
  - cdk-nag
  - custom-nag-pack
type: default
---

## Use case

Some companies have specific requirements for tagging resources in AWS. To ensure that these requirements are met, you can use a custom nag pack to check the existence of tags and also the value of tags.

CDK can set [tags](https://docs.aws.amazon.com/cdk/v2/guide/tagging.html) at the app level, so that it is easy setting the tags for all resources in the stack.
But if the tags are a central requirement it could be checked with a central custom nag pack for all repos using CDK.

## Kinds of tagging

As described here [Consideration about cdk-notifier and Tags](./cdk-notifier-and-tags.html), there are different ways to tag resources in CDK.
You can tag the resources direkctly via parameter or via a CDK aspect like `Tags.of()`. How `Tags.of()` works is described in the [CDK documentation](https://docs.aws.amazon.com/cdk/v2/guide/tagging.html).
The tags copuld also set above e.g. in the stack properties and also with the `Tags.of()` method and the stack scope.
The structure of the cdk-nag checks the resource by resource, so it's not possible the tags which are not set on the resource level.

This will work.

```typescript
// resource with tags
new CfnBucket(stack, "rCfnBucket", {
  tags: [
    {
      key: "some tag",
      value: "some value",
    },
  ],
});
```

```typescript
// check the resource for tags
export default Object.defineProperty(
  (node: CfnResource): NagRuleResult => {
    if ("tags" in node) {
      const cr1TagsToCheck = CustomChecks.cr1TagsToCheck;
      // get the tags of the resource
      const tagsResource = node.tags as TagManager;
      if (areTagsExist(tagsResource, cr1TagsToCheck)) {
        return NagRuleCompliance.COMPLIANT;
      } else {
        return NagRuleCompliance.NON_COMPLIANT;
      }
    } else {
      return NagRuleCompliance.NOT_APPLICABLE;
    }
  },
  "name",
  { value: parse(__filename).name }
);
```

This will not work.

```typescript
import { Tags } from "aws-cdk-lib";
const bucket = new CfnBucket(stack, "bucket");
// tags will be set via Tags.of() aspect
Tags.of(bucket).add("name", "some value");
```

Therefore it needs a workaround.

## Invoke the tags which are not set on the resource level

The documentation of CDK describes the tagging of resources with the `Tags.of()` method: https://docs.aws.amazon.com/cdk/v2/guide/tagging.html
This could look like this:

```typescript
Tags.of(app).add("branch", branchName);
```

<!-- https://github.com/JohannesKonings/cdk-notifier-examples/blob/746c2b2bc0ecc0ecf3e8f0e6ff771a7430a45d04/src/main.ts#L23

The tag will then be added to all resources in the synthesized cloudformation template.

```json
{
 "Resources": {
  "TableCD117FA1": {
   "Type": "AWS::DynamoDB::Table",
   "Properties": {
    "AttributeDefinitions": [
     {
      "AttributeName": "id",
      "AttributeType": "S"
     }
    ],
    "BillingMode": "PAY_PER_REQUEST",
    "KeySchema": [
     {
      "AttributeName": "id",
      "KeyType": "HASH"
     }
    ],
    "TableName": "Table-tags-tags-of",
    "Tags": [
     {
      "Key": "branch",
      "Value": "tags-tags-of"
     }
    ]
   },
   ...
  }
 }
}
```

Because the tag is in the template, it will then be shown in the diff.

![diff tag of](./diff-tag-of.png)

https://github.com/JohannesKonings/cdk-notifier-examples/pull/5

## Tagging with stack properties

The other way is to pass the tags as stack properties (https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.Stack.html#tags-1).
This could look like this:

```typescript
new CdkNotfifierFeatureStackExample(
  app,
  `cdk-notifier-feature-stacks-${branchName}`,
  {
    tags: {
      branch: branchName,
    },
  }
);
```

https://github.com/JohannesKonings/cdk-notifier-examples/blob/66874c06b8204b09781e9ad3ab8707590b948000/src/main.ts#L23

The tag will then be added to the stack properties and not to the template file.

```json
{
 "Resources": {
  "TableCD117FA1": {
   "Type": "AWS::DynamoDB::Table",
   "Properties": {
    "AttributeDefinitions": [
     {
      "AttributeName": "id",
      "AttributeType": "S"
     }
    ],
    "BillingMode": "PAY_PER_REQUEST",
    "KeySchema": [
     {
      "AttributeName": "id",
      "KeyType": "HASH"
     }
    ],
    "TableName": "Table-tags-stack-properties",
   },
   ...
  }
 }
}
```

In `cdk.out` the tags are only in the `manifest.json` file.

```json
{
  "version": "36.0.0",
  "artifacts": {
    "cdk-notifier-feature-stacks-tags-stack-properties.assets": {
      "type": "cdk:asset-manifest",
      "properties": {
        "file": "cdk-notifier-feature-stacks-tags-stack-properties.assets.json",
        "requiresBootstrapStackVersion": 6,
        "bootstrapStackVersionSsmParameter": "/cdk-bootstrap/hnb659fds/version"
      }
    },
    "cdk-notifier-feature-stacks-tags-stack-properties": {
      "type": "aws:cloudformation:stack",
      "environment": "aws://unknown-account/unknown-region",
      "properties": {
        "templateFile": "cdk-notifier-feature-stacks-tags-stack-properties.template.json",
        "terminationProtection": false,
        "tags": {
          "branch": "tags-stack-properties"
        },
        "validateOnSynth": false,
        ...
      }
    }
  }
}
```

Then it will not be shown in the diff, and the cdk-notifier skip the pull request comment.

```bash
check the diff to main
Deploying with stack postfix main
Stack cdk-notifier-feature-stacks-main
Hold on while we create a read-only change set to get a diff with accurate replacement information (use --no-change-set to use a less accurate but faster template-only diff)
There were no differences

✨  Number of stacks with differences: 0

create cdk-notifier report
BRANCH_NAME: tags-stack-properties
GITHUB_OWNER: JohannesKonings
GITHUB_REPO: $(echo JohannesKonings/cdk-notifier-examples | cut -d'/' -f2)
time="2024-04-20T14:59:48Z" level=info msg="There is no diff detected for tag id diff-to-main. Skip posting diff."
```

https://github.com/JohannesKonings/cdk-notifier-examples/actions/runs/8765869174/job/24057331666#step:6:55

## Conclusion

If you want to see the tags in the diff output of the cdk-notifier, you should use the `Tags.of()` method to tag the resources.
If not, you can go with the stack properties. -->

## Code

[https://github.com/JohannesKonings/cdk-nag-custom-nag-pack](https://github.com/JohannesKonings/cdk-nag-custom-nag-pack)
