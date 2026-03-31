declare module "marked-highlight" {
  export function markedHighlight(options: {
    langPrefix?: string;
    emptyLangClass?: string;
    highlight: (code: string, lang: string, info?: string) => string | Promise<string>;
  }): { name: string; renderer?: any };
}


declare global {
  var __ENGAGEMENT_CONFIG__:
    | {
        enabled: boolean;
        supabaseUrl: string;
        supabaseAnonKey: string;
      }
    | undefined;
}

export {};
