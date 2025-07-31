---
layout: post
title: GitHub actions example for automatic release drafts and changelog.md creation
date: "2021-02-28 08:15:18"
published: true
summary: This post is how to define your release draft via labels in pull requests and the update of the changelog.md after publishing a release
categories: github
thumbnail: github
cover_image: ./cover-image.png
tags:
  - github
  - github actions
---

# What are GitHub actions?

That is well described in this [post](https://dev.to/github/what-are-github-actions-3pml) by [Brian Douglas](https://dev.to/bdougieyo).
He has also an entire [post series](https://dev.to/github/28-days-of-github-action-tips-4opg) about tips around GitHub actions.

# Which problem should be solved?

There are different solutions to create automatic releases based on certain criteria. Again [Brian Douglas](https://dev.to/bdougieyo) pointed out some possibilities in this [post](https://dev.to/github/generate-semantic-release-with-github-actions-2lll).

For [this](https://github.com/abap-observability-tools) open-source project, the requirement was to determine the release structure via labels at the pull request. This was preferred over [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/).
Also, not every merged pull request should automatically trigger a new release. Therefore, a draft is the right way to collect the changes and publish a version whenever needed.

Addionatylly to the GitHub releases, a changelog.md helps see the version history, for example, directly in the code editor.
That changelog.md should be updated every time a release is published.

The combination [Release Drafter](https://github.com/release-drafter/release-drafter) and [gren](https://github.com/github-tools/github-release-notes) is the approach to solve the problem.

# Configure Release Drafter

To configure [Release Drafter](https://github.com/release-drafter/release-drafter) in the default way, it needs two files and the according labels.

This [template](https://github.com/abap-observability-tools/abap-log-exporter/blob/main/.github/release-drafter.yml) describes the structure of the release draft and the needed labels.
The full path is `.github/release-drafter.yml`

```yaml
name-template: "v$RESOLVED_VERSION 🌈"
tag-template: "v$RESOLVED_VERSION"
categories:
  - title: "🚀 Features"
    labels:
      - "feature"
      - "enhancement"
  - title: "🐛 Bug Fixes"
    labels:
      - "fix"
      - "bugfix"
      - "bug"
  - title: "🧰 Maintenance"
    label: "chore"
  - title: "🧺 Miscellaneous" #Everything except ABAP
    label: "misc"
change-template: "- $TITLE @$AUTHOR (#$NUMBER)"
change-title-escapes: '\<*_&' # You can add # and @ to disable mentions, and add ` to disable code blocks.
version-resolver:
  major:
    labels:
      - "major"
  minor:
    labels:
      - "minor"
  patch:
    labels:
      - "patch"
  default: patch
template: |
  ## Changes
  $CHANGES
```

The GitHub actions [configuration](https://github.com/abap-observability-tools/abap-log-exporter/blob/main/.github/workflows/release-drafter.yml) like this:

`github/workflows/release-drafter.yml`

```yaml
name: Release Drafter

on:
  push:
    # branches to consider in the event; optional, defaults to all
    branches:
      - main

jobs:
  update_release_draft:
    runs-on: ubuntu-latest
    steps:
      # Drafts your next Release notes as Pull Requests are merged into "master"
      - uses: release-drafter/release-drafter@v5
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

# Configure gren

The releases are published manually at certain times. This trigger [this](https://github.com/abap-observability-tools/abap-log-exporter/blob/main/.github/workflows/update-changelog.yml) configuration.

```yaml
name: "update changelog"
on:
  release:
    types: [published]

jobs:
  update-changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Update changelog
        run: |
          npm install github-release-notes
          export GREN_GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }}
          npm run overrideChangelog
      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v3
        with:
          commit-message: update changelog
          title: Update Changelog
          body: Update changelog to reflect release changes
          branch: update-changelog
          base: main
```

The command `"overrideChangelog": "gren changelog --override"` from the [package.json](https://github.com/abap-observability-tools/abap-log-exporter/blob/main/package.json) update then the changelog.md.

Because of the main branch protection, it's not possible to push the changes directly back. This will do this via a pull request with the GitHub action [create-pull-request](https://github.com/marketplace/actions/create-pull-request).

# How it looks like

The collection of the changes in a release draft.

![release-draft](release-draft.png)

The labels in a pull request.

![label-pull-request](./label-pull-request.png)

The result in the GitHub release.

![minor-enhancement](./minor-enhancement.png)

The result in the CHANGELOG.md.

![changelog](./changelog.png)

# Code

[https://github.com/abap-observability-tools](https://github.com/abap-observability-tools)
