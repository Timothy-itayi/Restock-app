import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    eas: {
      projectId: '0641bf2c-7f00-4f4f-b5a2-7552036f4fda',
    },
    // These are baked into the JS bundle at build time
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    EXPO_PUBLIC_CLERK_JWT_ISSUER_DOMAIN: process.env.EXPO_PUBLIC_CLERK_JWT_ISSUER_DOMAIN,
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
   
  },
});
