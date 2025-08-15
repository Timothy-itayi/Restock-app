import { defineConfig } from "convex/config";

export default defineConfig({
  // Enable Clerk authentication
  auth: {
    providers: [
      {
        domain: "https://clerk.com",
        applicationID: "convex",
      },
    ],
  },
});
