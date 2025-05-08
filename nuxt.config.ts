// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/devtools", "@nuxtjs/tailwindcss"],
  runtimeConfig: {
    faustSecretKey: process.env.FAUST_SECRET_KEY,
    public: {
      wordpressUrl:
        process.env.WORDPRESS_URL ||
        "https://smartcache.wpenginepowered.com/graphql",
      frontendSiteUrl: process.env.FRONTEND_URL || "http://localhost:3000",
    },
  },
});
