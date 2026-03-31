# Dev Blog (TypeScript 7 + tsgo)

정적 개발 블로그 프로젝트입니다. 기존 `tmp` 스타일 토큰을 재사용했고, 포스트는 마크다운으로 작성합니다.

기본 기능:

- 태그별 정적 페이지 자동 생성 (`site/tags/<tag>.html`)
- 검색 (제목, 요약, 본문, 태그 기반)
- 코드 블록 syntax highlight
- 코드 블록 Copy 버튼(아이콘)
- 본문 하단 Previous/Next 이동

검색 팁:

- 일반 검색: `tsgo`, `markdown`
- 정규식 검색: `/ts.+go/i`
- 검색어는 URL 쿼리(`?q=`)로 동기화되어 공유/새로고침 후에도 유지됩니다.
- 단축키: `/` 또는 `Ctrl/Cmd + K`로 검색 열기, `Esc`로 닫기

## 조회수/좋아요/댓글

- 조회수/좋아요: 기본은 `localStorage` fallback, 선택적으로 Supabase 연동 시 실제 누적 집계
- 댓글: `giscus` 연동 구조 포함(기본은 비활성)

댓글(giscus) 활성화 방법:

1. GitHub 저장소 Discussions를 활성화
2. `https://giscus.app`에서 repo/category 정보를 발급받음
3. `.env.example`을 복사해 `.env`를 만들고 값 채우기

```bash
cp .env.example .env
```

필수 값:

- `GISCUS_ENABLED=true`
- `GISCUS_REPO=owner/repo`
- `GISCUS_REPO_ID=...`
- `GISCUS_CATEGORY=General` (또는 사용 카테고리명)
- `GISCUS_CATEGORY_ID=...`
- `GISCUS_MAPPING=pathname`
- `GISCUS_STRICT=0`
- `GISCUS_THEME=dark_dimmed`

4. 로컬 확인: `npm run build`
5. GitHub Actions 배포용으로 동일 값을 Repository Secrets에 등록
   - `GISCUS_ENABLED`
   - `GISCUS_REPO`
   - `GISCUS_REPO_ID`
   - `GISCUS_CATEGORY`
   - `GISCUS_CATEGORY_ID`
   - `GISCUS_MAPPING`
   - `GISCUS_STRICT`
   - `GISCUS_THEME`

## 조회수/좋아요 실집계(Supabase)

아래 SQL을 Supabase SQL Editor에 실행:

```sql
create table if not exists post_views (
  id bigint generated always as identity primary key,
  slug text not null,
  visitor_hash text not null,
  viewed_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique (slug, visitor_hash, viewed_on)
);

create table if not exists post_likes (
  id bigint generated always as identity primary key,
  slug text not null,
  visitor_hash text not null,
  active boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (slug, visitor_hash)
);

create or replace view post_view_aggregates as
select slug, count(*)::bigint as view_count
from post_views
group by slug;

create or replace view post_like_aggregates as
select slug, count(*) filter (where active)::bigint as like_count
from post_likes
group by slug;

alter table post_views enable row level security;
alter table post_likes enable row level security;

create policy "allow read views" on post_views for select using (true);
create policy "allow insert views" on post_views for insert with check (true);

create policy "allow read likes" on post_likes for select using (true);
create policy "allow insert likes" on post_likes for insert with check (true);
create policy "allow update likes" on post_likes for update using (true) with check (true);
```

이미 기존 스키마를 만든 경우(마이그레이션):

```sql
alter table post_views add column if not exists viewed_on date not null default current_date;

drop index if exists post_views_slug_visitor_hash_key;
alter table post_views drop constraint if exists post_views_slug_visitor_hash_key;
alter table post_views add constraint post_views_slug_visitor_hash_viewed_on_key unique (slug, visitor_hash, viewed_on);
```

`.env` 또는 GitHub Secrets에 아래 추가:

- `ENGAGEMENT_ENABLED=true`
- `ENGAGEMENT_SUPABASE_URL=https://<project>.supabase.co`
- `ENGAGEMENT_SUPABASE_ANON_KEY=<anon key>`

동작 방식:

- 각 방문자는 브라우저에 고유 ID를 가지며, 전송 시 SHA-256 해시로 변환
- 조회수는 `(slug, visitor_hash, viewed_on)` 유니크로 1일 1회 카운트
- 좋아요는 `(slug, visitor_hash)` 한 줄의 `active` 토글 방식
- Supabase 설정이 없거나 실패하면 자동으로 로컬 fallback(기존 방식) 사용

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

- 메인: `site/index.html`
- 포스트: `site/posts/*.html`
- 태그: `site/tags/*.html`

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
