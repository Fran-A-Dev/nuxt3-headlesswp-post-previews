import { getTokensFromCode, getTokensFromRefreshToken } from "../../faust";

// Define the route explicitly with a specific path
export default defineEventHandler(async (event) => {
  // Log the full request details
  console.log("Preview API called with:", {
    path: event.path,
    method: event.method,
    query: getQuery(event),
    headers: event.headers,
  });

  const config = useRuntimeConfig();
  const query = getQuery(event);
  const { code, refreshToken, previewId } = query;

  if (!previewId) {
    throw createError({
      statusCode: 400,
      message: "previewId is required",
    });
  }

  try {
    let tokens;

    // Try to use refresh token first if available
    if (refreshToken) {
      try {
        tokens = await getTokensFromRefreshToken(refreshToken as string);
      } catch (e) {
        console.error("Refresh token error:", e);
        // If refresh fails, try with code
        if (!code) {
          throw createError({
            statusCode: 401,
            message:
              "Invalid refresh token and no authorization code available",
          });
        }
        tokens = await getTokensFromCode(decodeURIComponent(code as string));
      }
    } else if (code) {
      tokens = await getTokensFromCode(decodeURIComponent(code as string));
    } else {
      throw createError({
        statusCode: 400,
        message: "No authorization code or refresh token provided",
      });
    }

    console.log("Tokens received:", {
      hasAccessToken: !!tokens.accessToken,
      hasRefreshToken: !!tokens.refreshToken,
    });

    // Fetch preview data from WordPress
    const response = await fetch(`${config.public.wordpressUrl}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokens.accessToken}`,
      },
      body: JSON.stringify({
        query: `
          query DraftQuery($id: ID!) {
            post(id: $id, idType: DATABASE_ID, asPreview: true) {
              id
              title
              content
              date
            }
          }
        `,
        variables: {
          id: previewId,
        },
      }),
    });

    const result = await response.json();
    console.log("GraphQL response:", {
      hasData: !!result?.data,
      hasPost: !!result?.data?.post,
    });

    if (!result?.data?.post) {
      throw createError({
        statusCode: 404,
        message: "Preview post not found",
      });
    }

    // Set refresh token in cookie
    setCookie(
      event,
      `${config.public.frontendSiteUrl}-rt`,
      tokens.refreshToken,
      {
        httpOnly: true,
        maxAge: 300,
        path: "/",
      }
    );

    return result.data.post;
  } catch (error: any) {
    console.error("Preview error:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to fetch preview data",
    });
  }
});
