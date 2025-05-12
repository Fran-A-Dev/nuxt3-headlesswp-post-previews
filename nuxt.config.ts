// https://nuxt.com/docs/api/configuration/nuxt-config
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/devtools", "@nuxtjs/tailwindcss"],
  runtimeConfig: {
    faustSecretKey: process.env.FAUST_SECRET_KEY,
    public: {
      wordpressUrl: "",
      frontendSiteUrl: "",
    },
  },
});
