import { getTokensFromCode, getTokensFromRefreshToken } from "../../faust";

// Using the .get.ts extension ensures this is registered as a GET endpoint
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);
  const { code, refreshToken, previewId } = query;

  // Parse the preview ID as an integer
  const parsedPreviewId =
    typeof previewId === "string" ? parseInt(previewId, 10) : previewId;

  if (!parsedPreviewId) {
    return {
      success: false,
      message: "previewId is required or not a valid number",
    };
  }

  try {
    let tokens;

    // Try to use refresh token first if available
    if (refreshToken) {
      try {
        tokens = await getTokensFromRefreshToken(refreshToken as string);
      } catch (e) {
        // If refresh fails, try with code
        if (!code) {
          return {
            success: false,
            message:
              "Invalid refresh token and no authorization code available",
          };
        }
        tokens = await getTokensFromCode(decodeURIComponent(code as string));
      }
    } else if (code) {
      tokens = await getTokensFromCode(decodeURIComponent(code as string));
    } else {
      return {
        success: false,
        message: "No authorization code or refresh token provided",
      };
    }

    // Fetch preview data from WordPress
    const graphqlUrl = `${config.public.wordpressUrl}/graphql`.replace(
      "/graphql/graphql",
      "/graphql"
    );

    const response = await fetch(graphqlUrl, {
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
          id: parsedPreviewId,
        },
      }),
    });

    const result = await response.json();

    if (!result?.data?.post) {
      return {
        success: false,
        message: "Preview post not found",
      };
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

    return {
      success: true,
      data: result.data.post,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch preview data",
    };
  }
});
