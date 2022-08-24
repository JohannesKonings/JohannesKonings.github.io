---
layout:     post
title:      Example how to visualize DynamoDB item changes with Quicksight (S3 source) created with CDK
date:       2022-08-xx 08:15:18
published:  false
summary:    This post is how to visualize the streamed data changes of a DynamoDb table via Kinesis Data Stream and Kinesis Firehose to S3. Build with CDK.
categories: aws
thumbnail: aws_kinesis
tags:
 - aws
 - aws kinesis
 - aws athena
 - aws cdk
 - aws quicksight
---

[This]({{ site.baseurl }}/aws/2021/08/27/aws_example_ddb_analytics_cdk/) post describes how to anlyze the data with Athena. Thius post describes how to visualize this data with Quicksight.

## Quicksight activation and costs

## Quicksight role

In the [standard edition](https://docs.aws.amazon.com/quicksight/latest/user/security_iam_service-with-iam.html#security-create-iam-role), Quicksight uses a standard role that could be configured via the Quicksight console.

![quicksight permission access to aws services]({{ site.baseurl }}/img/2022-08-xx-aws_example_ddb_analytics_quicksight_cdk/quicksight-permission-access-to-aws-services.png)

Unfortunately, it is not possible to allow for specific KMS keys. For that we need to add a policy to the role aws-quicksight-service-role-v0.

[This](https://github.com/JohannesKonings/test-aws-dynamodb-athena-cdk/blob/main/cdk/lib/quicksight/quicksight-role.ts) ads the needed permissions to that role.

```typescript
import { Construct } from 'constructs'
import { aws_iam as iam, aws_s3 as s3 } from 'aws-cdk-lib'

export interface QuicksightRoleProps {
  name: string
  bucket: s3.IBucket
}

export class QuicksightRole extends Construct {
  constructor(scope: Construct, id: string, props: QuicksightRoleProps) {
    super(scope, id)

    const quicksightRoleName = 'aws-quicksight-service-role-v0'

    const quicksightRole = iam.Role.fromRoleName(this, 'quicksight-role', quicksightRoleName)

    quicksightRole.attachInlinePolicy(
      new iam.Policy(this, `${props.name}-policy`, {
        statements: [
          new iam.PolicyStatement({
            actions: ['kms:Decrypt', 's3:GetObject', 's3:List*'],
            resources: [props.bucket.bucketArn, `${props.bucket.bucketArn}/*`, props.bucket.encryptionKey!.keyArn],
          }),
        ],
      })
    )
  }
}
```

Now it's possible to create a datasource from the S3 bucket.


## Create a datasource and dataset




# Cost Alert 💰

⚠️ Don't forget to delete the Quicksight account after testing.

# Code

[https://github.com/JohannesKonings/test-aws-dynamodb-athena-cdk](https://github.com/JohannesKonings/test-aws-dynamodb-athena-cdk)

