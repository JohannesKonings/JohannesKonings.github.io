---
layout:     post
title:      Example how to analyze DynamoDB item changes with Kinesis and Athena created with Terraform
date:       '2021-08-27 08:15:18'
published:  true
summary:    This post is how stream data changes of a DynamoDb table via Kinesis Data Stream and Kinesis Firehose to S3, and analyze the data with Athena
categories: aws
thumbnail: aws_kinesis
tags:
 - aws
 - aws kinesis
 - aws athena
 - terraform
---

# Why?

The data of a DynamoDb table is not so easy to analyze as a [RDS](https://aws.amazon.com/rds/) with e.g., the [pgAdmin](https://www.pgadmin.org/).
It will be somehow possible with scan operation but it's in the most cases [not recommented](https://dynobase.dev/dynamodb-scan/).

Another possibility is the [export to S3 functionylity](https://aws.amazon.com/blogs/aws/new-export-amazon-dynamodb-table-data-to-data-lake-amazon-s3/).

In this post, it's described to use streams. Since 11/2020, it is also possible [to use kinesis data streams](https://aws.amazon.com/about-aws/whats-new/2020/11/now-you-can-use-amazon-kinesis-data-streams-to-capture-item-level-changes-in-your-amazon-dynamodb-table/) for such a case.

That also allows to analyze changes and use it for audits.

A example with DynamoDb streams are here:

- [https://www.youtube.com/watch?v=7QFUEh-FYYE](https://www.youtube.com/watch?v=7QFUEh-FYYE)
- [https://www.youtube.com/watch?v=17AmrTqn0GY](https://www.youtube.com/watch?v=17AmrTqn0GY)

# Architecture

![architecture](https://raw.githubusercontent.com/JohannesKonings/test-aws-dynamodb-athena-tf/main/diagrams/overview.png)

The lambda is sending fake person data to DynamoDb. The integration of the Kinesis Data Stream into the DynamoDb is connected to the Kinesis Firehose, which sends the changes partitioned to the S3 bucket.

The Glue crawler will recognize the data structure and create a table, which can be accessed from Athena to analyze the data.

Let's see the certain building blocks

# Lambda (for data creation)

The [Lambda](https://github.com/JohannesKonings/test-aws-dynamodb-athena-tf/blob/main/terraform/lambda.tf) is created with a module from [serverless.tf](serverless.tf).

The source code is [here](https://github.com/JohannesKonings/test-aws-dynamodb-athena-tf/blob/main/terraform/src/persons-loader/index.js)

The number of created persons depends on the test event.

```json
{
  "batchSize": 5
}
```

# DynamoDb and Kinesis Data Stream

[This](https://github.com/JohannesKonings/test-aws-dynamodb-athena-tf/blob/main/terraform/dynamodb.tf) is the creation of the DynamoDb with the Kinesis Data Stream.

```terraform
resource "aws_dynamodb_table" "aws_dynamodb_table" {
  name         = var.TABLE_NAME
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"

  attribute {
    name = "pk"
    type = "S"
  }
}

resource "aws_kinesis_stream" "aws_kinesis_stream" {
  name            = "${var.TABLE_NAME}-data-stream"
  shard_count     = 1
  encryption_type = "KMS"
  kms_key_id      = aws_kms_key.aws_kms_key.arn
}

resource "aws_dynamodb_kinesis_streaming_destination" "aws_dynamodb_kinesis_streaming_destination" {
  stream_arn = aws_kinesis_stream.aws_kinesis_stream.arn
  table_name = aws_dynamodb_table.aws_dynamodb_table.name
}
```

That adds to the DynamoDb, a Kinesis Data Stream, and connects it to the DynamoDb.

![kinesis data stream]({{ site.baseurl }}/img/2021-08-27-aws_example_ddb_analytics/kinesis_data_stream.png)

![kinesis data stream ddb]({{ site.baseurl }}/img/2021-08-27-aws_example_ddb_analytics/kinesis_data_stream_ddb.png)

# Kinesis Data Firehose and S3 Bucket

Kinesis Data Firehose is the connection between the Kinesis Data Stream to the S3 Bucket.

Unfortunately, Firehose stores the JSONs without a linefeed. Therefore it's a lambda for conversion is necessary.

More about that is described in this [post](https://medium.com/analytics-vidhya/append-newline-to-amazon-kinesis-firehose-json-formatted-records-with-python-f58498d0177a)

Besides policy configuration, it looks like this.

```terraform
resource "aws_kinesis_firehose_delivery_stream" "aws_kinesis_firehose_delivery_stream" {
  name        = local.firehose-name
  destination = "extended_s3"

  kinesis_source_configuration {
    kinesis_stream_arn = aws_kinesis_stream.aws_kinesis_stream.arn
    role_arn           = aws_iam_role.aws_iam_role.arn
  }

  extended_s3_configuration {
    role_arn   = aws_iam_role.aws_iam_role.arn
    bucket_arn = aws_s3_bucket.aws_s3_bucket.arn

    processing_configuration {
      enabled = "true"

      processors {
        type = "Lambda"

        parameters {
          parameter_name  = "LambdaArn"
          parameter_value = "${module.lambda_function_persons_firehose_converter.lambda_function_arn}:$LATEST"
        }
      }
    }

    cloudwatch_logging_options {
      enabled         = true
      log_group_name  = aws_cloudwatch_log_group.aws_cloudwatch_log_group_firehose.name
      log_stream_name = aws_cloudwatch_log_stream.aws_cloudwatch_log_stream_firehose.name
    }
  }
}
```

Details are [here](https://github.com/JohannesKonings/test-aws-dynamodb-athena-tf/blob/main/terraform/kinesis_firehose.tf)

The delivery of the data to the S3 bucket is buffered. Here are the default values.

![firehose-buffer]({{ site.baseurl }}/img/2021-08-27-aws_example_ddb_analytics/firehose_buffer.png)

# Glue crawler

Athena needs a structured table for the SQL queries. The Glue crawler creates this from the data in the S3 bucket.

```terraform
resource "aws_glue_crawler" "aws_glue_crawler" {
  database_name = aws_glue_catalog_database.aws_glue_bookings_database.name
  name          = local.glue-crawler-name
  role          = aws_iam_role.aws_iam_role_glue_crawler.arn

  configuration = jsonencode(
    {
      "Version" : 1.0
      CrawlerOutput = {
        Partitions = { AddOrUpdateBehavior = "InheritFromTable" }
      }
    }
  )

  s3_target {
    path = "s3://${aws_s3_bucket.aws_s3_bucket.bucket}"
  }
}
```

Details [here](https://github.com/JohannesKonings/test-aws-dynamodb-athena-tf/blob/main/terraform/glue.tf)

For test purposes, it's enough to run the crawler before any analysis. Scheduling is also possible.

![glue-run-crawler]({{ site.baseurl }}/img/2021-08-27-aws_example_ddb_analytics/glue_run_crawler.png)

That creates this table, which is accessible by Athena.

![glue-table]({{ site.baseurl }}/img/2021-08-27-aws_example_ddb_analytics/glue_table.png)

# Athena

For Athena it needs an S3 bucket for the query results and, for better isolation to other projects, a workgroup.

```terraform
locals {
  athena-query-results-s3-name = "${var.TABLE_NAME}-query-results"
  athena-workgroup-name        = "${var.TABLE_NAME}-workgroup"
}
resource "aws_s3_bucket" "aws_s3_bucket_bookings_query_results" {
  bucket = local.athena-query-results-s3-name
  acl    = "private"

  versioning {
    enabled = true
  }

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        kms_master_key_id = aws_kms_key.aws_kms_key.arn
        sse_algorithm     = "aws:kms"
      }
    }
  }
}

resource "aws_athena_workgroup" "aws_athena_workgroup" {
  name = local.athena-workgroup-name

  configuration {
    enforce_workgroup_configuration    = true
    publish_cloudwatch_metrics_enabled = true

    result_configuration {
      output_location = "s3://${aws_s3_bucket.aws_s3_bucket_bookings_query_results.bucket}/output/"

      encryption_configuration {
        encryption_option = "SSE_KMS"
        kms_key_arn       = aws_kms_key.aws_kms_key.arn
      }
    }
  }
}
```

Details [here](https://github.com/JohannesKonings/test-aws-dynamodb-athena-tf/blob/main/terraform/glue.tf)

## Analysis

First select the new workgroup.

![athena-workgroup]({{ site.baseurl }}/img/2021-08-27-aws_example_ddb_analytics/athena_workgroup.png)

And than the new Database.

![athena-database]({{ site.baseurl }}/img/2021-08-27-aws_example_ddb_analytics/athena_database.png)

### Query example

DynamoDb sends the changes of an item as INSERT, MODIFY or REMOVE. To the current data of the table, this Query will work.

```sql
SELECT dynamodb.newimage.pk.s AS pk,
         dynamodb.newimage.person.M.firstname.s AS firstname,
         dynamodb.newimage.person.M.lastname.s AS lastname,
         dynamodb.approximatecreationdatetime AS ts,
         dynamodb.newimage,
         *
FROM "persons-db"."persons_firehose_s3_bucket" AS persons1
WHERE (eventname = 'INSERT'
        OR eventname = 'MODIFY')
        AND dynamodb.approximatecreationdatetime =
    (SELECT MAX(dynamodb.approximatecreationdatetime)
    FROM "persons-db"."persons_firehose_s3_bucket" AS persons2
    WHERE persons2.dynamodb.newimage.pk.s = persons1.dynamodb.newimage.pk.s);
```

![athena-ddb]({{ site.baseurl }}/img/2021-08-27-aws_example_ddb_analytics/athena_ddb.png)

# Cost Alert 💰

⚠️ Don't forget to destroy after testing. Kinesis Data Streams has [costs](https://aws.amazon.com/kinesis/data-streams/pricing/) per hour

# Code

[https://github.com/JohannesKonings/test-aws-dynamodb-athena-tf](https://github.com/JohannesKonings/test-aws-dynamodb-athena-tf)
