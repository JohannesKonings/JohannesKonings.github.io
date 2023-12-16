---
layout:     post
title:      Use cdk-notifier to compare changes in pull requests
date:       '2023-12-16 08:15:18'
published:  true
summary: See how cdk-notifier can help to compare which cdk changes will be applied after merging a pull request
categories: aws
thumbnail: cdk
tags:
 - aws
 - cdk
 - cdk-notifier
---

## Use case

Especially in serverless environments, features will be created with ephemeral stacks, which will be deleted after merging to the main branch. Comparing the cdk diff between the feature branch and the main branch will help to understand which changes will be applied after merging the pull request.

Some changes, like renaming a dynamodb table or updating more than one dynamodb index, will work if the changes are made before deploying the feature stack but fail if the changes are applied to an existing stack.

The cdk-notifer will help to identify these changes.

## cdk-notifier

See here for more information about the cdk-notifier:
[https://github.com/karlderkaefer/cdk-notifier](https://github.com/karlderkaefer/cdk-notifier)

## GitHub Action

This setting has a deployed stack from the main branch, for the feature development a new branch `feat1` is created and deployed as a new stack.

![stack-overview]({{ site.baseurl }}/img/2023-12-16-cdk-notifier-feature-stacks/stack-overview.png)

In the pull request the cdk-notifier action is added to the workflow and create a diff from the `feat1` branch files with the BRANCH_NAME env variable for `main` to run the diff agianst the `main` stack.
The diff output will be added to the pull request as a comment via the cdk-notifier.

```yaml
      - name: Check diff to main
        run: |
          npm ci  
          echo "check the diff to main"
          BRANCH_NAME=main npx cdk diff --app cdk.out --progress=events &> >(tee cdk.log)
          echo "create cdk-notifier report"
          echo "BRANCH_NAME: $BRANCH_NAME"
          echo "GITHUB_OWNER: $GITHUB_OWNER"
          echo "GITHUB_REPO: $GITHUB_REPO"
          cdk-notifier \
          --owner ${{ env.GITHUB_OWNER }} \
          --repo ${{ env.GITHUB_REPO }} \
          --token ${{ secrets.GITHUB_TOKEN }} \
          --log-file ./cdk.log \
          --tag-id diff-to-main \
          --pull-request-id ${{ env.PULL_REQUEST_ID }} \
          --vcs github \
          --ci circleci \
          --template extendedWithResources
```
[https://github.com/JohannesKonings/cdk-notifier-examples/blob/main/.github/workflows/cdk-diff.yml](https://github.com/JohannesKonings/cdk-notifier-examples/blob/main/.github/workflows/cdk-diff.yml)

![pipeline in pull request]({{ site.baseurl }}/img/2023-12-16-cdk-notifier-feature-stacks/pipeline-in-pull-request.png)

The comment looks like this:

![PR comment]({{ site.baseurl }}/img/2023-12-16-cdk-notifier-feature-stacks/pr-comment.png)
[https://github.com/JohannesKonings/cdk-notifier-examples/pull/4#issuecomment-1858909147](https://github.com/JohannesKonings/cdk-notifier-examples/pull/4#issuecomment-1858909147)

The extended template parameter of the cdk-notifier displays in this setting also a warning that the dynamodb requires a replacement.
In some cases, this could be unintended and be reverted securely in the feature branch before merging.
That is a nice feature besides the overview of the changes, which is itself helpful in making these changes more visible.

After the merge, the feature stack will be destroyed, and the main stack will be updated.

![pipeline after merge]({{ site.baseurl }}/img/2023-12-16-cdk-notifier-feature-stacks/pipeline-after-merge.png)


## Code

[https://github.com/JohannesKonings/cdk-notifier-examples](https://github.com/JohannesKonings/cdk-notifier-examples)

