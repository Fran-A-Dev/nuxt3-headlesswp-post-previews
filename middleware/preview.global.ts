export default defineNuxtRouteMiddleware(async (to, from) => {
  const config = useRuntimeConfig();

  console.log("Middleware checking URL:", to.fullPath);

  // Handle the regular preview flow from WordPress
  if (to.query.preview === "true") {
    const previewId = to.query.p;
    console.log("WordPress preview request detected:", { previewId });
    // Remove /graphql from the URL if it exists
    const baseUrl = config.public.wordpressUrl.replace("/graphql", "");
    return navigateTo(
      `${baseUrl}/generate?redirect_uri=${config.public.frontendSiteUrl}/preview?preview_id=${previewId}`,
      { external: true }
    );
  }

  // Direct preview link handling - if we're on the preview page and have code but no authorization
  if (to.path === "/preview" && to.query.preview_id && to.query.code) {
    console.log("Direct preview link detected, proceeding with API call");
    // We'll let the preview page handle this
    return;
  }
});
