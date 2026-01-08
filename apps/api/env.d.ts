declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      DATABASE_URL: string;
      CLERK_SECRET_KEY: string;
      CLERK_PUBLISHABLE_KEY: string;
      STRIPE_SECRET_KEY: string;
    }
  }
}

export {};
