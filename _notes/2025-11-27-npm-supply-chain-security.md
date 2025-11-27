---
layout: "note"
title: NPM Supply Chain Security
description: "NPM supply chain security considerations"
date: 2025-11-27T10:00:00.000Z
published: true
summary: ""
categories: []
thumbnail: ""
tags: ["npm", "security", "supply chain"]
type: default
---

## implementation

### pnpm config

`cat $(pnpm config get globalconfig)`

```
minimum-release-age=2880
trust-policy=no-downgrade
```

## .zshrc config

```zsh
npm i -g sfw
npm i -g npq
alias pnpm="NPQ_PKG_MGR=pnpm sfw npq-hero"
```

### delete packages incl. cache

⚠️ be careful

```
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
pnpm store prune
rm -rf $(pnpm store path) # more aggressive
```

## sources

- https://pnpm.io/supply-chain-security
- https://github.com/lirantal/npm-security-best-practices
- https://www.npmjs.com/package/npq
- https://github.com/SocketDev/sfw-free
