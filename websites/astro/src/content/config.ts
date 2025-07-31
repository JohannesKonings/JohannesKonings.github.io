import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      // layout: z.literal("post"), layout has a onw meaning in astro
      published: z.boolean(),
      title: z.string(),
      summary: z.string(),
      date: z.coerce.date(),
      tags: z.array(z.string()),
      // draft: z.boolean().optional(),
      cover_image: image().nullable().optional(),
    }),
});

const notes = defineCollection({
  type: "content",
  schema: z.object({
    // layout: z.literal("note"), layout has a onw meaning in astro
    published: z.boolean(),
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    draft: z.boolean().optional(),
    demoUrl: z.string().optional(),
    repoUrl: z.string().optional(),
  }),
});

const infoSlsManagementGovernance = defineCollection({
  type: "content",
  schema: z.object({
    // layout: z.literal("note"), layout has a onw meaning in astro
    published: z.boolean(),
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    draft: z.boolean().optional(),
    demoUrl: z.string().optional(),
    repoUrl: z.string().optional(),
  }),
});

const legal = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
  }),
});

export const collections = { blog, notes, legal, infoSlsManagementGovernance };
