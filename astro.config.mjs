import { defineConfig, envField } from "astro/config";

// Astro configuration with type-safe environment variables (Astro 5.0+)
export default defineConfig({
  env: {
    schema: {
      // Server-side API base for build-time fetching
      API_BASE_URL: envField.string({
        context: "server",
        access: "public",
        default: "http://localhost:8787",
      }),

      // Client-side API base for optional runtime freshness checks
      PUBLIC_API_BASE_URL: envField.string({
        context: "client",
        access: "public",
        default: "http://localhost:8787",
      }),

      // Server-only variable for build-time authenticated requests (if needed)
      API_SECRET: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),

      // Use local data instead of API calls when backend is not available
      USE_LOCAL_DATA: envField.boolean({
        context: "server",
        access: "secret",
        default: false,
      }),
    },
  },
});
