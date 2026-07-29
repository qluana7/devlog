import { copyFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import hljs from "highlight.js";
import { Marked, type Token, type Tokens } from "marked";
import { markedHighlight } from "marked-highlight";
import { sanitizePostHtml } from "./html-sanitizer.js";
import { escapeHtml } from "./render-utils.js";
import { resolveWithin } from "./post-validation.js";

export type MarkdownRenderContext = {
  slug: string;
  sourceDir: string;
  contentDir: string;
  uploadsOutDir: string;
};

function isExternalAsset(target: string): boolean {
  return /^(https?:\/\/|data:|mailto:|#|\/)/i.test(target);
}

async function rewriteImageToken(
  token: Tokens.Image,
  context: MarkdownRenderContext,
  copied: Map<string, string>
): Promise<void> {
  if (!token.href || isExternalAsset(token.href)) {
    return;
  }

  const sourcePath = path.resolve(context.sourceDir, token.href);
  resolveWithin(context.contentDir, path.relative(context.contentDir, sourcePath));

  const sourceStat = await stat(sourcePath).catch(() => null);
  if (!sourceStat?.isFile()) {
    throw new Error(`Local image does not exist or is not a file: ${sourcePath}`);
  }

  let publicPath = copied.get(sourcePath);
  if (!publicPath) {
    const assetIndex = copied.size + 1;
    const extension = path.extname(sourcePath).toLowerCase() || ".bin";
    const fileName = `${String(assetIndex).padStart(2, "0")}${extension}`;
    const postUploadDir = resolveWithin(context.uploadsOutDir, context.slug);
    const outputPath = resolveWithin(postUploadDir, fileName);
    await mkdir(postUploadDir, { recursive: true });
    await copyFile(sourcePath, outputPath);
    publicPath = `../assets/uploads/${encodeURIComponent(context.slug)}/${encodeURIComponent(fileName)}`;
    copied.set(sourcePath, publicPath);
  }

  token.href = publicPath;
}

function addLazyImageAttributes(html: string): string {
  return html.replace(/<img\b([^>]*)>/gi, (match, attributes: string) => {
    const additions = [
      /\bloading\s*=/.test(attributes) ? "" : ' loading="lazy"',
      /\bdecoding\s*=/.test(attributes) ? "" : ' decoding="async"'
    ].join("");
    return additions ? `<img${attributes}${additions}>` : match;
  });
}

function applyStandaloneImageCaptions(html: string): string {
  return html.replace(/<p>\s*(<img\b[^>]*>)\s*<\/p>/gi, (match, image: string) => {
    const titleMatch = /\btitle="([^"]+)"/i.exec(image);
    const caption = titleMatch?.[1]?.trim();
    if (!caption) {
      return match;
    }
    return `<figure class="post-image">${image}<figcaption>${escapeHtml(caption)}</figcaption></figure>`;
  });
}

function applySpoilers(html: string): string {
  const protectedBlocks: string[] = [];
  const masked = html.replace(/<(pre|code)[\s\S]*?<\/\1>/gi, (block) => {
    const token = `@@PROTECTED_${protectedBlocks.length}@@`;
    protectedBlocks.push(block);
    return token;
  });

  const transformed = masked.replace(/\|\|([\s\S]*?)\|\|/g, (match, innerRaw: string) => {
    const inner = innerRaw.trim();
    if (!inner) {
      return match;
    }

    const hasBlockTag = /<(p|div|figure|section|article|ul|ol|li|table|blockquote|h[1-6]|hr|pre|img)\b/i.test(
      inner
    );
    if (hasBlockTag) {
      return `<div class="spoiler spoiler-block" tabindex="0" role="button" aria-label="스포일러 보기" aria-expanded="false"><div class="spoiler-content">${inner}</div></div>`;
    }
    return `<span class="spoiler" tabindex="0" role="button" aria-label="스포일러 보기" aria-expanded="false"><span class="spoiler-content">${inner}</span></span>`;
  });

  return protectedBlocks.reduce(
    (restored, block, index) => restored.replace(`@@PROTECTED_${index}@@`, block),
    transformed
  );
}

export function sanitizeForSearch(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function containsMath(markdown: string): boolean {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, "").replace(/`[^`]*`/g, "");
  return /\$\$[\s\S]+?\$\$/.test(withoutCode) || /(^|[^\\$])\$[^$\n]+\$/.test(withoutCode);
}

export async function renderMarkdown(markdown: string, context: MarkdownRenderContext): Promise<string> {
  const copied = new Map<string, string>();
  const marked = new Marked(
    markedHighlight({
      langPrefix: "hljs language-",
      highlight(code, language) {
        if (language && hljs.getLanguage(language)) {
          return hljs.highlight(code, { language }).value;
        }
        return hljs.highlightAuto(code).value;
      }
    })
  );

  marked.use({
    async: true,
    walkTokens: async (token: Token) => {
      if (token.type === "image") {
        await rewriteImageToken(token as Tokens.Image, context, copied);
      }
    }
  });

  const rendered = await marked.parse(markdown);
  const enhanced = applySpoilers(applyStandaloneImageCaptions(addLazyImageAttributes(rendered)));
  return sanitizePostHtml(enhanced);
}
