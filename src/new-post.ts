import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

function getArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index === -1) {
    return undefined;
  }
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) {
    return undefined;
  }
  return value;
}

function normalizeSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main(): Promise<void> {
  const titleInput = getArg("--title") ?? "Untitled Post";
  const slugInput = getArg("--slug") ?? titleInput;
  const slug = normalizeSlug(slugInput);

  if (!slug) {
    throw new Error("Could not create a valid slug. Use --slug with alphanumeric characters.");
  }

  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;

  const content = `---
title: ${JSON.stringify(titleInput)}
slug: "${slug}"
date: "${date}"
excerpt: "한 줄 요약을 작성하세요."
tags:
  - typescript
---

# ${titleInput}

본문을 작성하세요.
`;

  const postsDir = path.join(process.cwd(), "content", "posts");
  await mkdir(postsDir, { recursive: true });
  const filePath = path.join(postsDir, `${slug}.md`);
  await writeFile(filePath, content, { encoding: "utf8", flag: "wx" });
  console.log(`Created ${filePath}`);
}

main().catch((error) => {
  if ((error as NodeJS.ErrnoException).code === "EEXIST") {
    console.error("A post with that slug already exists. Choose a different --slug.");
    process.exitCode = 1;
    return;
  }
  console.error(error);
  process.exitCode = 1;
});
