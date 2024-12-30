declare namespace NodeJS {
  interface ProcessEnv {
    MONGO_URI: string;
    NEXTAUTH_SECRET: string;
    NEXTAUTH_URL: string;
    OPENAI_API_KEY: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}