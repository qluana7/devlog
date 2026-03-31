---
title: "이 블로그에 새 글 올리는 방법"
slug: "markdown-writing-guide"
date: "2026-03-30"
excerpt: "frontmatter 형식과 코드 블록 작성 방법을 빠르게 확인할 수 있습니다."
tags:
  - markdown
  - guide
---

# 글 작성 규칙

모든 포스트는 frontmatter를 포함해야 합니다.

```md
---
title: "포스트 제목"
slug: "post-slug"
date: "2026-03-31"
excerpt: "목록 카드에 보일 요약"
tags:
  - tag-a
  - tag-b
---
```

## 코드 하이라이트

언어를 명시한 fenced block을 쓰면 하이라이트가 적용됩니다.

```bash
npm run build
```

```ts
console.log("Hello, blog");
```
