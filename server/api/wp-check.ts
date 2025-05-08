export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // Get the WordPress URL without the /graphql part for Faust endpoints
  const baseUrl = config.public.wordpressUrl.replace("/graphql", "");
  const graphqlUrl = config.public.wordpressUrl;

  try {
    // Check the basic WordPress site
    const wpResponse = await fetch(baseUrl);
    const wpStatus = wpResponse.status;

    // Check the GraphQL endpoint
    const gqlResponse = await fetch(graphqlUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `{
          generalSettings {
            title
            url
          }
        }`,
      }),
    });

    const gqlData = await gqlResponse.json();

    // Check the Faust endpoint
    let faustAvailable = false;
    try {
      const faustResponse = await fetch(`${baseUrl}/?rest_route=/faustwp/v1`);
      faustAvailable = faustResponse.ok;
    } catch (e) {
      // Ignore errors
    }

    return {
      success: true,
      wordpress: {
        baseUrl,
        status: wpStatus,
        isAccessible: wpStatus >= 200 && wpStatus < 300,
      },
      graphql: {
        endpoint: graphqlUrl,
        status: gqlResponse.status,
        isAccessible: gqlResponse.ok,
        data: gqlData,
      },
      faust: {
        endpoint: `${baseUrl}/?rest_route=/faustwp/v1`,
        isAvailable: faustAvailable,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Unknown error",
      wordpress: {
        baseUrl,
      },
      graphql: {
        endpoint: graphqlUrl,
      },
    };
  }
});
