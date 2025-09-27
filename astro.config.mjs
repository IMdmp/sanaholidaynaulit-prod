import { defineConfig, envField } from "astro/config"

// Astro configuration with type-safe environment variables (Astro 5.0+)
export default defineConfig({
  env: {
    schema: {
      // Client-accessible variable for runtime API calls
      API_BASE_URL: envField.string({
        context: "client",
        access: "public",
        default: "https://api.sanaholidaynaulit.com",
      }),

      // Server-only variable for build-time fetching (optional for MVP)
      API_SECRET: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
    },
  },
})
