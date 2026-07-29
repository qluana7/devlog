export type PostMeta = {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  tags: string[];
};

export type Post = PostMeta & {
  html: string;
  content: string;
  hasMath: boolean;
};
