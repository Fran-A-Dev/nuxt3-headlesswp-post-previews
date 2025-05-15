export default defineNuxtRouteMiddleware(async (to) => {
  const config = useRuntimeConfig();

  // Redirect to WordPress preview generation if coming from WP admin
  if (to.query.preview === "true") {
    const previewId = to.query.p;
    return navigateTo(
      `${config.public.wordpressUrl}/generate?redirect_uri=${config.public.frontendSiteUrl}/preview?preview_id=${previewId}`,
      { external: true }
    );
  }

  // Allow direct access to preview page with code and preview_id
  if (to.path === "/preview" && to.query.preview_id && to.query.code) {
    return;
  }
});
