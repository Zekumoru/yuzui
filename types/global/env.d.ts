declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: 'development' | 'production';
      DISCORD_TOKEN?: string;
      OPENAI_API_KEY?: string;
    }
  }
}

export {};
