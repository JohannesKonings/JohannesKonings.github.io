---
layout:     post
title:      Example how to create Athena saved queries with CDK
date:       2022-08-22 08:15:18
published:  true
summary:    This post is about how saved queries are created with CDK. This is useful to have important queries prepared for any users.
categories: aws
thumbnail: aws_kinesis
tags:
 - aws
 - aws athena
 - aws cdk
---
In [this]({{ site.baseurl }}/aws/2021/08/27/aws_example_ddb_analytics/) post is a example of a Athena query to get the the current data of the DynamoDb table.

This post explains how to provide this query with CDK as a saved query in Athena to have the query stored "nearby" the editor and that the query fits to the current deployment regarding the naming of the DB and table.
Another advantage is to have the query under source control.

This is a extension of [this]({{ site.baseurl }}/aws/2021/10/26/aws_example_ddb_analytics_cdk/) post.

The saved queries are stored here in the console:

![athena save queries]({{ site.baseurl }}/img/2022-08-22-aws_example_ddb_analytics_athena_saved_queries_cdk/athena_saved_queries.png)

# The SQL command

This SQL command will be provided as a saved query in Athena. For easier maintenance, the command is in an extra [SQL file](https://github.com/JohannesKonings/test-aws-dynamodb-athena-cdk/blob/main/cdk/lib/saved-queries/ddb-state.sql).
The DB and the table name are placeholders in the file and will be replaced during the deployment process. That ensures that this SQL command refers to the correct resources, which are also deployed.

```sql
SELECT dynamodb.newimage.pk.s AS pk,
        dynamodb.newimage.person.M.firstname.s AS firstname,
        dynamodb.newimage.person.M.lastname.s AS lastname,
        dynamodb.approximatecreationdatetime AS ts,
        dynamodb.newimage,
        *
FROM "athenaDbName"."athenaTableName" AS persons1
WHERE (eventname = 'INSERT'
        OR eventname = 'MODIFY')
        AND dynamodb.approximatecreationdatetime =
    (SELECT MAX(dynamodb.approximatecreationdatetime)
    FROM "athenaDbName"."athenaTableName" AS persons2
    WHERE persons2.dynamodb.newimage.pk.s = persons1.dynamodb.newimage.pk.s);
```


# Saved Query Construct

Like the SQL file, the CDK definition of the saved query is in an [extra](https://github.com/JohannesKonings/test-aws-dynamodb-athena-cdk/blob/main/cdk/lib/saved-queries/saved-queries.ts)[ file](https://github.com/JohannesKonings/test-aws-dynamodb-athena-cdk/blob/main/cdk/lib/saved-queries/saved-queries.ts) as a CDK construct.


```typescript
import { Construct } from 'constructs'
import {
  aws_athena as athenaCfn
} from 'aws-cdk-lib'
import * as glue from '@aws-cdk/aws-glue-alpha'
import { readFileSync } from 'fs';
import { join } from 'path';

export interface SavedQueriesProps {
  glueDb: glue.IDatabase;
  athenaTableName: string;
  athenaWorkgroupName: string;
}

export class SavedQueries extends Construct {
  constructor(scope: Construct, id: string, props: SavedQueriesProps) {
    super(scope, id)

    const getSqlString = (file: string): string => {
      let personsDdbStateSqlCommand = readFileSync(join(__dirname, `${file}`), 'utf-8').toString()
      const athenaDbName = props.glueDb.databaseName
      let athenaTableName = props.athenaTableName;
      athenaTableName = athenaTableName.replace(/-/g, '_')
      personsDdbStateSqlCommand = personsDdbStateSqlCommand.replace(/athenaDbName/g, athenaDbName)
      personsDdbStateSqlCommand = personsDdbStateSqlCommand.replace(/athenaTableName/g, athenaTableName)
      return personsDdbStateSqlCommand
    }

    let queryString = getSqlString('ddb-state.sql')

    // eslint-disable-next-line no-new
    new athenaCfn.CfnNamedQuery(this, 'query-current-ddb-state', {
      database: props.glueDb.databaseName,
      queryString: queryString,
      description: 'query the current state from the ddb table',
      name: 'current-ddb-state',
      workGroup: props.athenaWorkgroupName
    })

  }
}
```

Currently, there is no L2 Construct for a named query in CDK, so it is defined as a L1 CFN Resource (`CfnNamedQuery`).

This needs the query as a string. The function `getSqlString` converts and transforms the SQL file content to that needed string.

So that the placeholders are replaced with the resources, which are deployed.

The Athena table name will be created during the glue crawler process. The convention is that the table name configured prefix of the S3 bucket with an underscore ("_") instead of dashes ("-").

The database name and the workgroup name are passed from the stack to the construct.

# Insert the saved query construct in the stack

For the deployment the saved queries construct will be inserted into the [stack](https://github.com/JohannesKonings/test-aws-dynamodb-athena-cdk/blob/main/cdk/lib/cdk-stack.ts#L211)

The needed information are passed as props to the construct.

The saved queries are depending on the workgroup. That has to be defined in CDK. Otherwise, the deployment will fail.

```typescript
const savedQueries = new SavedQueries(this, 'saved-queries', {
      glueDb: glueDb,
      athenaTableName: firehoseBucketName,
      athenaWorkgroupName: athenaWorkgroup.name,
    })

    savedQueries.node.addDependency(athenaWorkgroup);
```


# Result
After the deployment, the new query is listed here and can be chosen for query in the editor.

![athena save query deployed]({{ site.baseurl }}/img/2022-08-22-aws_example_ddb_analytics_athena_saved_queries_cdk/athena_saved_query_deployed.png)

![athena save queries]({{ site.baseurl }}/img/2022-08-22-aws_example_ddb_analytics_athena_saved_queries_cdk/athena_saved_query_editor.png)

# Code

[https://github.com/JohannesKonings/test-aws-dynamodb-athena-cdk](https://github.com/JohannesKonings/test-aws-dynamodb-athena-cdk)

