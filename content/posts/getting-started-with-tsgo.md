---
title: "TypeScript 7 tsgo로 정적 블로그 시작하기"
slug: "getting-started-with-tsgo"
date: "2026-03-31"
excerpt: "tsgo 기반으로 마크다운 글을 정적 HTML로 빌드하는 최소 구성을 정리합니다."
tags:
  - typescript
  - tsgo
  - static-site
---

# TypeScript 7 + tsgo

이 블로그는 `tsgo`로 TypeScript 빌드 스크립트를 컴파일한 뒤, 마크다운 글을 HTML로 생성합니다.

## 왜 이 구조를 썼나

- 포스트는 `content/posts/*.md`만 추가하면 됩니다.
- GitHub Actions에서 빌드 후 바로 Pages로 배포합니다.
- 코드 블록은 자동으로 syntax highlight 됩니다.

## 예시 코드

```ts
type Post = {
  title: string;
  slug: string;
  date: string;
};

export function sortPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}
```

Happy shipping.
