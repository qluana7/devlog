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
