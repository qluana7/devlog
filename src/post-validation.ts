import path from "node:path";
import type { PostMeta } from "./post-model.js";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function contextSuffix(sourceName?: string): string {
  return sourceName ? ` (${sourceName})` : "";
}

export function requireString(value: unknown, name: string, sourceName?: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Invalid frontmatter: '${name}' must be a non-empty string${contextSuffix(sourceName)}.`);
  }
  return value.trim();
}

export function validateSlug(value: unknown, sourceName?: string): string {
  const slug = requireString(value, "slug", sourceName);
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(
      `Invalid frontmatter: 'slug' must use lowercase letters, numbers, and single hyphens only${contextSuffix(
        sourceName
      )}.`
    );
  }
  return slug;
}

export function validateDate(value: unknown, sourceName?: string): string {
  const date = requireString(value, "date", sourceName);
  const match = ISO_DATE_PATTERN.exec(date);
  if (!match) {
    throw new Error(`Invalid frontmatter: 'date' must use YYYY-MM-DD${contextSuffix(sourceName)}.`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error(`Invalid frontmatter: 'date' is not a calendar date${contextSuffix(sourceName)}.`);
  }
  return date;
}

export function validateTags(value: unknown, sourceName?: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`Invalid frontmatter: 'tags' must be a non-empty string array${contextSuffix(sourceName)}.`);
  }

  const tags = value.map((item) => requireString(item, "tags[]", sourceName).normalize("NFC"));
  if (new Set(tags).size !== tags.length) {
    throw new Error(`Invalid frontmatter: 'tags' must not contain duplicates${contextSuffix(sourceName)}.`);
  }
  return tags;
}

export function parsePostMeta(data: Record<string, unknown>, sourceName?: string): PostMeta {
  return {
    title: requireString(data.title, "title", sourceName),
    slug: validateSlug(data.slug, sourceName),
    date: validateDate(data.date, sourceName),
    excerpt: requireString(data.excerpt, "excerpt", sourceName),
    tags: validateTags(data.tags, sourceName)
  };
}

export function assertUniqueSlugs(posts: PostMeta[]): void {
  const seen = new Set<string>();
  for (const post of posts) {
    if (seen.has(post.slug)) {
      throw new Error(`Duplicate post slug: '${post.slug}'.`);
    }
    seen.add(post.slug);
  }
}

export function resolveWithin(rootDir: string, ...segments: string[]): string {
  const root = path.resolve(rootDir);
  const target = path.resolve(root, ...segments);
  const relative = path.relative(root, target);
  if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`Resolved path escapes its allowed root: ${target}`);
  }
  return target;
}
