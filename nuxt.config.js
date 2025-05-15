export default defineNuxtConfig({
  modules: ["@nuxt/devtools", "@nuxtjs/tailwindcss"],
  runtimeConfig: {
    faustSecretKey: process.env.NUXT_FAUST_SECRET_KEY,
    public: {
      wordpressUrl: process.env.NUXT_PUBLIC_WORDPRESS_URL,
      frontendSiteUrl: process.env.NUXT_PUBLIC_FRONTEND_SITE_URL,
    },
  },
});
