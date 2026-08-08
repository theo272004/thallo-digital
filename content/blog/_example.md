---
title: The title, as it will appear on the blog
slug: the-url-this-post-gets
status: draft
excerpt: One or two sentences. WordPress uses it in listings and in the meta description.
---

Everything below the fence is the post, in Markdown. Headings, **bold**,
*italic*, [links](https://thallodigital.com), lists, quotes and code all work.

## Use h2 for sections

The h1 is the title above — a second one inside the body competes with it, and
on a page about being readable by machines that is a bad look.

- Lists work
- Like this

> And block quotes like this.

---

## The front matter

| key | what it does |
|---|---|
| `title` | Required. |
| `slug` | The URL. Leave it out and WordPress makes one from the title. |
| `status` | `draft` or `publish`. See below — `publish` alone is not enough. |
| `excerpt` | Optional but worth writing; it is what shows in listings. |
| `wpId` | **Do not write this yourself.** `push` adds it after the first upload so later pushes update that post instead of creating a second copy. |
| `format` | Only added by `pull`. It means "this body is already HTML, do not convert it". |

## Publishing

`push` sends a draft. To publish, the file has to say `status: publish` *and*
the command has to carry `--allow-publish`:

    node scripts/blog.mjs push content/blog/my-post.md --allow-publish

Two locks on purpose. Publishing is the one thing here that is public,
immediate and awkward to take back.

## This file

`_example.md` is a template and is never pushed — it has no `wpId`, and
pushing it would create a post called "The title, as it will appear on the
blog". Copy it, do not edit it.
