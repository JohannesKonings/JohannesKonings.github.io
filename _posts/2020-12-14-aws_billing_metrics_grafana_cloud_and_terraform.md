---
layout:     post
title:      How to setup AWS Billing metrics in Grafana Cloud via Terraform
date:       2020-12-14 08:15:18
published:  false
summary:    Terraform setup to display AWS billing metrics in Grafana Cloud
categories: aws
thumbnail: grafana
tags:
 - aws
 - grafana
---

# Why Terraform?

In this [post]({{ site.baseurl }}/aws/2020/11/27/aws_billing_metrics_and_grafana_cloud/) I described how to display AWS Billing metrics in Grafana Cloud. Thefore it was necessary to create manually the data source and the dashboard.
With Terraform you can describe the setup as code and benefit of the whole advantages of [IaC](https://en.wikipedia.org/wiki/Infrastructure_as_code).

# Terraform

[Terraform](https://www.terraform.io/) is a tool for infrastructure as code, which can be used for different [provider](https://www.terraform.io/docs/providers/index.html#lists-of-terraform-providers).
The deployments are carried out via the CLI. 

# Grafana Provider declaration

For this use case we need a Grafana data source and a Grafana dashboard. This have to defined in a .tf file like this [one](https://github.com/JohannesKonings/aws-grafana-billing-dashboard/blob/main/grafana.tf)

At first the [provider](https://registry.terraform.io/providers/grafana/grafana/latest/docs).

```
provider "grafana" {
  url  = var.grafana_url
  auth = var.grafana_api_key
}
```

Than the [data source](https://registry.terraform.io/providers/grafana/grafana/latest/docs/resources/data_source) and [dashboard](https://registry.terraform.io/providers/grafana/grafana/latest/docs/resources/dashboard).

```
resource "grafana_data_source" "cloudwatch" {
  type = "cloudwatch"
  name = "CloudWatch"

  json_data {
    default_region = var.region
    auth_type      = "keys"
  }

  secure_json_data {
    access_key = var.access_key_grafana
    secret_key = var.secret_key_grafana
  }
}

resource "grafana_dashboard" "metrics" {
  config_json = file("dashboards/aws-billing.json")
}
```

For security and for flexibel sharing the parameters for secrest or variables like region are in a .env file. This ist a [template](https://github.com/JohannesKonings/aws-grafana-billing-dashboard/blob/main/.env_template) for that.

```
# The URL of the Grafana instance
export TF_VAR_grafana_url=
# The API key of the Grafana instance
export TF_VAR_grafana_api_key=
# IAM user like described here: https://grafana.com/docs/grafana/latest/datasources/cloudwatch/#iam-policies
export TF_VAR_access_key_grafana=
export TF_VAR_secret_key_grafana=
# Default region of the data source
export TF_VAR_region=
```

That Terraform know the varibales you can create a new file e.g. [variable.tf](https://github.com/JohannesKonings/aws-grafana-billing-dashboard/blob/main/variables.tf) like described [here](https://learn.hashicorp.com/tutorials/terraform/azure-variables)

```
variable "grafana_url" {}
variable "grafana_api_key" {}
variable "access_key_grafana" {}
variable "secret_key_grafana" {}
variable "region" {}
```

# Grafana API Key

Terraform can "communicate" with Grafana with an API key. 
https://<<Grafana instance>>/org/apikeys
Role Admin

# Terraform AWS S3 backend

# Commands

# CI/CD

# Code

[https://github.com/JohannesKonings/aws-grafana-billing-dashboard](https://github.com/JohannesKonings/aws-grafana-billing-dashboard)

