export default {
  providers: [
    {
      domain: process.env.EXPO_PUBLIC_CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};