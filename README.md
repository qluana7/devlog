# Dev Blog (TypeScript 7 + tsgo)

정적 개발 블로그 프로젝트입니다. 기존 `tmp` 스타일 토큰을 재사용했고, 포스트는 마크다운으로 작성합니다.

## Stack

- TypeScript 7 preview (`@typescript/native-preview` + `tsgo`)
- Tailwind CSS
- `marked` + `highlight.js` for markdown and syntax highlight
- GitHub Actions + GitHub Pages 배포

## 로컬 실행

```bash
npm install
npm run build
```

빌드 결과물은 `site/`에 생성됩니다.

## 새 포스트 작성

아래 명령으로 frontmatter 템플릿 파일을 생성할 수 있습니다.

```bash
npm run new:post -- --title "TypeScript 팁 모음" --slug "typescript-tips"
```

또는 `content/posts/*.md` 파일을 직접 추가해도 됩니다.

필수 frontmatter:

```yaml
title: "포스트 제목"
slug: "post-slug"
date: "YYYY-MM-DD"
excerpt: "목록 카드용 요약"
tags:
  - tag1
  - tag2
```

코드 블록은 fenced code block(````ts`, ` ```bash `)을 사용하면 자동 하이라이트됩니다.

## 배포

- `.github/workflows/deploy.yml` 이 `main` 브랜치 push 때 빌드 후 Pages로 배포합니다.
- GitHub 저장소 설정에서 **Pages -> Build and deployment -> GitHub Actions** 를 선택하세요.
