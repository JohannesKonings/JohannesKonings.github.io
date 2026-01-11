---
name: post-review
description: Review and lightly edit a single blog post under _posts/ for prose quality and source hygiene, without changing code examples or post structure.
---

## Purpose

Use this skill when the user asks to review a blog post.

This skill is optimized for repositories where the canonical post lives under `_posts/` and other locations may contain copies.

## Hard rules (must follow)

1. **Only edit the mentioned post file under `_posts/`.**
   - Do not edit copies in other folders (e.g. `crossPosts/`, `websites/`, etc.).
   - If the user didn’t name a specific post path, ask for it.

2. **Fix typos and grammar first, prose only.**
   - Edit narrative text for spelling, grammar, capitalization, and clarity.
   - Keep wording factual and concise; avoid marketing language.

3. **Keep code examples unchanged, but make them collapsible.**
   - Do not edit the contents of fenced code blocks (`…`), inline code, CLI commands, IAM policies, JSON/YAML snippets, or log outputs.
   - Wrap fenced code blocks in HTML `<details>` / `<summary>` so the examples are collapsible.
   - When wrapping, keep the code block content byte-for-byte identical.
   - If a code example appears wrong, mention it as a suggestion only—do not modify it.

4. **Do not change post structure.**
   - Don’t reorder headings/sections.
   - Don’t add new mid-post sections.
   - You may add/update a final section named **“Sources and links”** at the end (see below).
   - Provide structural improvements as suggestions in chat only.

5. **Check links and keep them in place.**
   - Do not remove or relocate inline links.
   - Validate that all outbound URLs resolve.
   - Research whether each link is correctly referenced by the surrounding text (see “Link context research”).
   - Do not run terminal commands for link checking unless the user explicitly asks.

## Review workflow

### Step 1 — Identify the target

- Confirm the exact path of the post under `_posts/`.
- Verify you will only edit that file.

### Step 2 — Prose cleanup (no code changes)

- Fix spelling and grammar issues.
- Normalize capitalization for headings (only if it’s clearly accidental; keep intentional styling).
- Prefer short, precise sentences.
- Replace vague phrases with concrete, factual statements when possible.

### Step 3 — Consistency check (suggestions only)

Check and report (in chat) whether these align:

- **Title** vs. **summary** vs. **body**: same subject and scope.
- **Post promise** (overview) vs. **actual content** (sections exist and match intent).
- **Terminology**: consistent use of product names (e.g., “AWS CDK”, “cdk-nag”, “AwsSolutions-S1”).

Do not restructure the post; only suggest.

### Step 4 — Link validation

- Extract all unique URLs (including bare URLs and Markdown links).
- Validate each link using a lightweight fetch (prefer a HEAD/metadata-style check via your available tools).
- If a link is broken:
  - If you can find a corrected canonical URL quickly, suggest it.
  - Otherwise, leave the link unchanged and report it.

### Step 5 — Link context research (detect false derivations)

Goal: ensure the text around a link accurately describes what the link is/claims.

For each URL:

- Fetch enough of the target page (or its canonical docs section) to understand what it actually is.
- Compare the **anchor text** and the **nearby prose claim** to the linked content.
- Flag any **false derivation** (e.g., the post claims the link proves X, but the link actually says Y; or the anchor text implies a different resource).

Rules:

- Do not change URLs unless the URL itself is incorrect/broken.
- Any proposed fixes to surrounding descriptions must be factual, concise, and non-marketing.
- If verification is not possible (auth wall, dynamic content, rate-limit), explicitly say so and do not guess.

### Step 6 — Approval gate for link-derived description fixes

If Step 5 finds any mismatches, do **not** immediately change the post’s prose for those areas.

Instead:

1. Provide a short report listing:
   - The URL
   - The current claim/anchor text
   - What the source actually supports (quote/summary-level, no long paste)
   - The proposed replacement wording
2. Ask the user for explicit approval (yes/no) to apply those wording fixes.

You may still apply pure typos/grammar fixes elsewhere in the post that are unrelated to Step 5.

### Step 7 — Add/update “Sources and links” section

At the end of the post, ensure there is a final section:

- Heading: `## Sources and links`
- Contents: a bullet list of **every URL mentioned anywhere in the post**, de-duplicated.

Rules:

- Keep inline links exactly where originally referenced.
- The final list is additive: it should include _all_ links, including those already under “Additional Resources”.

## Output expectations

- Make the minimal set of edits needed to fix prose.
- Summarize what changed.
- Provide a short “Suggestions” list for structure/title/summary alignment issues.
- Provide a short “Link check” report (OK / redirected / broken).
- If link-derived wording changes were proposed, wait for explicit approval before applying them.
