---
layout: post
title: How to display AWS billing metrics in Grafana Cloud
date: 2020-11-27 08:15:18
summary: Configuration of Grafana Cloud to display AWS billing metrics
categories: aws
thumbnail: grafana
tags:
    - aws
    - grafana
published: true
---

# Why Grafana for AWS billing metrics?

[Grafana](https://grafana.com/) is well known for observability dashboards, which can be composed of many data sources.

With AWS CloudWatch metrics, it is possible to do more or less the same, but it is designed more for one account and more for the AWS metrics.

In Grafana, it's easy to use different data sources so that you can have your billing metrics on the same dashboard as your other technical and business metrics from elsewhere.

# Configuration of the Grafana Cloud instance

Here [https://grafana.com/products/cloud/](https://grafana.com/products/cloud/) you can sign up for a Grafana Cloud account.

It's free for this use case (and many more :))

![Grafana Cloud pricing]({{ site.baseurl }}/img/2020-11-27-aws_billing_metrics_and_grafana_cloud/grafana_cloud_pricing.png)

After login, create a stack with the starter plan.

![Grafana Cloud add stack]({{ site.baseurl }}/img/2020-11-27-aws_billing_metrics_and_grafana_cloud/grafana_cloud_add_stack.png)

![Grafana Cloud starter plan]({{ site.baseurl }}/img/2020-11-27-aws_billing_metrics_and_grafana_cloud/grafana_cloud_starter_plan.png)

Then log in to your instance.

![Grafana Cloud instance login]({{ site.baseurl }}/img/2020-11-27-aws_billing_metrics_and_grafana_cloud/grafana_cloud_instance_login.png)

# Creation of an IAM user for the CloudWatch data source

The CloudWatch data source needs an access key and a secret key. Therefore is an IAM user needed. As policy can be this used: 

[https://grafana.com/docs/grafana/latest/datasources/cloudwatch/#iam-policies](https://grafana.com/docs/grafana/latest/datasources/cloudwatch/#iam-policies)

# Configuration of the CloudWatch Datasource

The next step is to add the CloudWatch data source to your Grafana cloud instance.

![Grafana Cloud add datasource]({{ site.baseurl }}/img/2020-11-27-aws_billing_metrics_and_grafana_cloud/grafana_cloud_add_datasource.png)

![Grafana Cloud select cloudwatch datasource]({{ site.baseurl }}/img/2020-11-27-aws_billing_metrics_and_grafana_cloud/grafana_cloud_select_cloudwatch_datasource.png)

As for credentials, use the access key and secret key from the IAM user.

![Grafana Cloud configuration cloudwatch datasource]({{ site.baseurl }}/img/2020-11-27-aws_billing_metrics_and_grafana_cloud/grafana_cloud_configuration_cloudwatch_datasource.png)

# Creation of a dashboard with a graph panel

Now you can use the data source in the panels of a dashboard.

![Grafana Cloud create dashboard]({{ site.baseurl }}/img/2020-11-27-aws_billing_metrics_and_grafana_cloud/grafana_cloud_create_dashboard.png)

![Grafana Cloud add panel]({{ site.baseurl }}/img/2020-11-27-aws_billing_metrics_and_grafana_cloud/grafana_cloud_add_panel.png)

This is a panel configuration example for the costs of all linked accounts.

![Grafana Cloud accounts panel]({{ site.baseurl }}/img/2020-11-27-aws_billing_metrics_and_grafana_cloud/grafana_cloud_accounts_panel.png)

This should be considered:
1. If the CloudWatch data source is not the default one, switch to the CloudWatch data source.
2. Billing metrics are all in the region us-east-1
3. The time frame "this month" seems the right choice for the monthly costs :)

And ready to go 🎉

![Grafana Cloud created dashboard]({{ site.baseurl }}/img/2020-11-27-aws_billing_metrics_and_grafana_cloud/grafana_cloud_created_dashboard.png)

# Usage of a prepared dashboard

Here [https://grafana.com/grafana/dashboards](https://grafana.com/grafana/dashboards) is a big list of official and community dashboards you can import to Grafana.

You can import a URL or ID from the list or, e.g., this [https://grafana.com/grafana/dashboards/13446](https://grafana.com/grafana/dashboards/13446) Dashboard in that way.

![Grafana Cloud import dashboard]({{ site.baseurl }}/img/2020-11-27-aws_billing_metrics_and_grafana_cloud/grafana_cloud_import_dashboard.png)

The selection of the data source is required.

![Grafana Cloud import dashboard2]({{ site.baseurl }}/img/2020-11-27-aws_billing_metrics_and_grafana_cloud/grafana_cloud_import_dashboard2.png)

And ready to go 🎉

![Grafana Cloud imported dashboard]({{ site.baseurl }}/img/2020-11-27-aws_billing_metrics_and_grafana_cloud/grafana_cloud_imported_dashboard.png)


# more dashboards

Monitoring Artist has many more cloud watch dashboards: [https://grafana.com/orgs/monitoringartist](https://grafana.com/orgs/monitoringartist)


