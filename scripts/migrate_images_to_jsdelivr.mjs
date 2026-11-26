import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "content", "posts");

const ASSETS_REPO = "qluana7/devlog-assets";
const CDN_BASE = `https://cdn.jsdelivr.net/gh/${ASSETS_REPO}@main/images`;

const assetsRepoDir = process.argv[2];
if (!assetsRepoDir) {
  console.error("Usage: node scripts/migrate_images_to_jsdelivr.mjs <assets-repo-dir>");
  process.exit(1);
}

const IMAGES_DIR = path.join(assetsRepoDir, "images");

function extFromContentType(contentType) {
  if (!contentType) return null;
  const mime = contentType.split(";")[0].trim().toLowerCase();
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/gif") return "gif";
  if (mime === "image/webp") return "webp";
  if (mime === "image/svg+xml") return "svg";
  if (mime === "image/avif") return "avif";
  return null;
}

function extFromUrl(url) {
  try {
    const u = new URL(url);
    const ext = path.extname(u.pathname).toLowerCase().replace(".", "");
    return ext || null;
  } catch {
    return null;
  }
}

async function fetchImage(url) {
  const headers = { "user-agent": "devlog-image-migrator/1.0" };
  let response = await fetch(url, { headers });

  if (!response.ok) {
    try {
      const u = new URL(url);
      u.search = "";
      response = await fetch(u.toString(), { headers });
    } catch {
      // ignored
    }
  }

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") || "";
  return { buffer, contentType };
}

async function main() {
  await mkdir(IMAGES_DIR, { recursive: true });

  const files = (await readdir(POSTS_DIR)).filter((name) => name.endsWith(".md"));
  const urlRegex = /!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g;

  const urlSet = new Set();
  const postContents = new Map();

  for (const fileName of files) {
    const filePath = path.join(POSTS_DIR, fileName);
    const content = await readFile(filePath, "utf8");
    postContents.set(filePath, content);

    for (const match of content.matchAll(urlRegex)) {
      const url = match[1];
      if (url.includes("cdn.jsdelivr.net/gh/qluana7/devlog-assets@main/images/")) {
        continue;
      }
      urlSet.add(url);
    }
  }

  const urlList = [...urlSet];
  const mapping = new Map();

  for (const url of urlList) {
    const { buffer, contentType } = await fetchImage(url);
    const hash = createHash("sha256").update(buffer).digest("hex");
    const ext = extFromContentType(contentType) || extFromUrl(url) || "bin";
    const fileName = `${hash.slice(0, 32)}.${ext}`;
    const localPath = path.join(IMAGES_DIR, fileName);
    await writeFile(localPath, buffer);
    mapping.set(url, `${CDN_BASE}/${fileName}`);
  }

  for (const [filePath, original] of postContents.entries()) {
    let updated = original;
    for (const [sourceUrl, cdnUrl] of mapping.entries()) {
      updated = updated.split(sourceUrl).join(cdnUrl);
    }
    if (updated !== original) {
      await writeFile(filePath, updated, "utf8");
    }
  }

  const report = {
    migratedCount: mapping.size,
    migratedAt: new Date().toISOString(),
    mapping: Object.fromEntries(mapping.entries())
  };
  await writeFile(path.join(ROOT, "scripts", "image-migration-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Migrated ${mapping.size} image URLs to jsDelivr URLs.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
