---

title:      Example how to visualize DynamoDB item changes with Quicksight (S3 source) created with CDK
date:       '2022-09-17 08:15:18'
published:  true
summary:    This post is how to visualize the streamed data changes of a DynamoDb table via Kinesis Data Stream and Kinesis Firehose to S3. Build with CDK.
categories: aws
thumbnail: aws_quicksight
tags:
 - aws
 - aws kinesis
 - aws athena
 - aws cdk
 - aws quicksight
---

This post is about how to visualize the DynamoDb data changes with Quicksight. It's an extension of [this]({{ site.baseurl }}/aws/2021/08/27/aws_example_ddb_analytics_cdk/) post, which describes how to analyze the data with Athena.
The setting for creating the DynamoDb table and putting the data changes to a S3 bucket is the same. Instead of creating an Athena table of the data in the S3 bucket, this data is linked to a data source in Quicksight. 

## Quicksight activation and costs

Quicksight needs to be activated before using. It's enough to use the standard edition for this scenario. The first 30 days are [free](https://docs.aws.amazon.com/quicksight/latest/user/signing-up.html). Costs are listed [here](https://aws.amazon.com/quicksight/pricing/). 

![quicksight open service]({{ site.baseurl }}/img/2022-09-17-aws_example_ddb_analytics_quicksight_cdk/quicksight-open-service.png)

![quicksight sign up]({{ site.baseurl }}/img/2022-09-17-aws_example_ddb_analytics_quicksight_cdk/quicksight-sign-up.png)

![quicksight choose standard]({{ site.baseurl }}/img/2022-09-17-aws_example_ddb_analytics_quicksight_cdk/quicksight-choose-standard.png)

Enter a name and an email address

![quicksight create standard]({{ site.baseurl }}/img/2022-09-17-aws_example_ddb_analytics_quicksight_cdk/quicksight-create-standard.png)

## Quicksight role

In the [standard edition](https://docs.aws.amazon.com/quicksight/latest/user/security_iam_service-with-iam.html#security-create-iam-role), Quicksight uses a standard role that could be configured via the Quicksight console.

![quicksight permission access to aws services]({{ site.baseurl }}/img/2022-09-17-aws_example_ddb_analytics_quicksight_cdk/quicksight-permission-access-to-aws-services.png)

Unfortunately, it is not possible to allow for specific KMS keys. For that, we need to add a policy to the role aws-quicksight-service-role-v0.

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

In Quicksight a data source is the connection to the data and the data set is using this data source and defining how the data will be used.

Quicksight has a lot of different data sources. We want to use the data from S3.

![quicksight datasource kinds]({{ site.baseurl }}/img/2022-09-17-aws_example_ddb_analytics_quicksight_cdk/quicksight-datasource-kinds.png)

Currently, there is no L2 CDK construct for data sources so we need to use the L1 cloud formation.

In the case of a S3 data source, it's a link to a manifest file

```typescript
const datasource = new quicksightCfn.CfnDataSource(this, 'datasource', {
      name: datasourceName,
      type: 'S3',
      awsAccountId: Stack.of(this).account,
      dataSourceId: datasourceName,
      dataSourceParameters: {
        s3Parameters: {
          manifestFileLocation: {
            bucket: props.bucket.bucketName,
            key: manifestKey,
          },
        },
      },
      permissions: permissionsDatasource,
    })
```
This is the definition of the manifest file. More about manifest files [here](https://docs.aws.amazon.com/quicksight/latest/user/supported-manifest-file-format.html)

```typescript
const manifest = {
      fileLocations: [
        {
          URIPrefixes: [`s3://${props.bucket.bucketName}/${props.prefix}/`],
        },
      ],
      globalUploadSettings: {
        format: 'JSON',
      },
    }
```


The dataset then defines which fields will be used and has the potential to format these fields.

```typescript
const dataset = new quicksightCfn.CfnDataSet(this, 'dataset', {
      name: datasetName,
      awsAccountId: Stack.of(this).account,
      dataSetId: datasetName,
      importMode: 'SPICE',
      physicalTableMap: {
        itemChanges: {
          s3Source: {
            dataSourceArn: datasource.attrArn,
            uploadSettings: {
              format: 'JSON',
            },
            inputColumns: [
              {
                name: 'awsRegion',
                type: 'STRING',
              },
              {
                name: 'eventID',
                type: 'STRING',
              },
              {
                name: 'eventName',
                type: 'STRING',
              },
              {
                name: 'userIdentity',
                type: 'STRING',
              },
              {
                name: 'recordFormat',
                type: 'STRING',
              },
              {
                name: 'tableName',
                type: 'STRING',
              },
              {
                name: 'dynamodb.ApproximateCreationDateTime',
                type: 'STRING',
              },
              {
                name: 'dynamodb.Keys.pk.S',
                type: 'STRING',
              },
              {
                name: 'dynamodb.NewImage.pk.S',
                type: 'STRING',
              },
              {
                name: 'dynamodb.NewImage.person.M.jobArea.S',
                type: 'STRING',
              },
              {
                name: 'dynamodb.NewImage.person.M.firstname.S',
                type: 'STRING',
              },
              {
                name: 'dynamodb.NewImage.person.M.gender.S',
                type: 'STRING',
              },
              {
                name: 'dynamodb.NewImage.person.M.jobType.S',
                type: 'STRING',
              },
              {
                name: 'dynamodb.NewImage.person.M.jobDescriptor.S',
                type: 'STRING',
              },
              {
                name: 'dynamodb.NewImage.person.M.lastname.S',
                type: 'STRING',
              },
              {
                name: 'dynamodb.SizeBytes',
                type: 'STRING',
              },
              {
                name: 'eventSource',
                type: 'STRING',
              },
            ],
          },
        },
      },
      logicalTableMap: {
        logicalTableProperty: {
          alias: `${datasetName}-alias`,
          source: { physicalTableId: 'itemChanges' },
        },
      },
      permissions: permissionsDataset,
    });
```

The whole definition is [here](https://github.com/JohannesKonings/test-aws-dynamodb-athena-cdk/blob/main/cdk/lib/quicksight/quicksight.ts)

[Here](https://aws-blog.com/2021/09/building-quicksight-datasets-with-cdk-s3.html) is a post that describes it with Python CDK.


### permission to see the datasource and dataset

Datasources and datasets will be only displayed if your user has permission for that. That is not automatically the case if you deploy it with CDK.
Therefore you need to put your user ARN to the permission. One way to do that is with an environment variable

`QUICKSIGHT_USERNAME=<<Quicksight user name>> npx cdk deploy`


```typescript
const quicksightUsername = process.env.QUICKSIGHT_USERNAME
    const principalArn = `arn:aws:quicksight:${Stack.of(this).region}:${Stack.of(this).account}:user/default/${quicksightUsername}`

    const permissionsDatasource = [
      {
        principal: principalArn,
        actions: [
          'quicksight:DescribeDataSource',
          'quicksight:DescribeDataSourcePermissions',
          'quicksight:PassDataSource',
          'quicksight:UpdateDataSource',
          'quicksight:DeleteDataSource',
          'quicksight:UpdateDataSourcePermissions',
        ],
      },
    ]

    const permissionsDataset = [
      {
        principal: principalArn,
        actions: [
          'quicksight:DescribeDataSet',
          'quicksight:DescribeDataSetPermissions',
          'quicksight:PassDataSet',
          'quicksight:DescribeIngestion',
          'quicksight:ListIngestions',
          'quicksight:UpdateDataSet',
          'quicksight:DeleteDataSet',
          'quicksight:CreateIngestion',
          'quicksight:CancelIngestion',
          'quicksight:UpdateDataSetPermissions',
        ],
      },
    ]
```

You can find the Quicksight username here

![quicksight username]({{ site.baseurl }}/img/2022-09-17-aws_example_ddb_analytics_quicksight_cdk/quicksight-username.png)

### Deployment and refresh of the dataset

If you deploy this setup the first time, the data does not exist, but the datasource links already to the data. That causes a deployment error.
To avoid this a little dummy data file will be deployed with a SDK call of a CDK custom resource

```typescript
const dummyJsonString = JSON.stringify({ dummy: 'dummy'}); // Delete after deplyoment
    const customResourcePutObject = new custom_resources.AwsCustomResource(this, 'prefix-creation', { // add -put
      onCreate: {
        service: 'S3',
        action: 'putObject',
        parameters: {
          Bucket: props.bucket.bucketName,
          Key: `${props.prefix}/dummy.json`,
          Body: dummyJsonString,
        },
        physicalResourceId: custom_resources.PhysicalResourceId.of('prefix-creation'),
      },
      policy: custom_resources.AwsCustomResourcePolicy.fromSdkCalls({ resources: custom_resources.AwsCustomResourcePolicy.ANY_RESOURCE }),
    });
    props.
```

After the datasource is deployed this will be removed

```typescript
const customResourceDeleteObject = new custom_resources.AwsCustomResource(this, 'prefix-creation-delete', {
      onCreate: {
        service: 'S3',
        action: 'deleteObject',
        parameters: {
          Bucket: props.bucket.bucketName,
          Key: `${props.prefix}/dummy.json`,
        },
        physicalResourceId: custom_resources.PhysicalResourceId.of('prefix-creation'),
      },
      policy: custom_resources.AwsCustomResourcePolicy.fromSdkCalls({ resources: custom_resources.AwsCustomResourcePolicy.ANY_RESOURCE }),
    });
    props.bucket.grantReadWrite(customResourceDeleteObject);
    customResourceDeleteObject.node.addDependency(dataset);
```


After there is some data in the dynamodb you have to refresh the dataset. This is how it looks like if you create 5 new entries and then modify 1 and refresh again and use this data in an analysis.

![quicksight refresh dataset]({{ site.baseurl }}/img/2022-09-17-aws_example_ddb_analytics_quicksight_cdk/quicksight-refresh-dataset.png)

![quicksight dataset imported rows]({{ site.baseurl }}/img/2022-09-17-aws_example_ddb_analytics_quicksight_cdk/quicksight-dataset-imported-rows.png)

![quicksight dataset analysis]({{ site.baseurl }}/img/2022-09-17-aws_example_ddb_analytics_quicksight_cdk/quicksight-dataset-analysis.png)

![quicksight analysis inserts]({{ site.baseurl }}/img/2022-09-17-aws_example_ddb_analytics_quicksight_cdk/quicksight-analysis-inserts.png)

![quicksight analysis modify]({{ site.baseurl }}/img/2022-09-17-aws_example_ddb_analytics_quicksight_cdk/quicksight-analysis-modify.png)



# Cost Alert 💰

⚠️ Don't forget to delete the Quicksight account after testing.

![quicksight delete account]({{ site.baseurl }}/img/2022-09-17-aws_example_ddb_analytics_quicksight_cdk/quicksight-delete-account.png)


# Code

[https://github.com/JohannesKonings/test-aws-dynamodb-athena-cdk](https://github.com/JohannesKonings/test-aws-dynamodb-athena-cdk)

