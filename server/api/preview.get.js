import { getTokensFromCode, getTokensFromRefreshToken } from "../../faust";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const query = getQuery(event);
  const { code, refreshToken, previewId } = query;

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

    // Get tokens via refresh token or code
    if (refreshToken) {
      try {
        tokens = await getTokensFromRefreshToken(refreshToken);
      } catch (e) {
        if (!code) {
          return {
            success: false,
            message:
              "Invalid refresh token and no authorization code available",
          };
        }
        tokens = await getTokensFromCode(decodeURIComponent(code));
      }
    } else if (code) {
      tokens = await getTokensFromCode(decodeURIComponent(code));
    } else {
      return {
        success: false,
        message: "No authorization code or refresh token provided",
      };
    }

    // Fetch preview post from WordPress
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
        variables: { id: parsedPreviewId },
      }),
    });

    const result = await response.json();

    if (!result?.data?.post) {
      return {
        success: false,
        message: "Preview post not found",
      };
    }

    // Set refresh token cookie for future requests
    setCookie(event, "faust_preview_rt", tokens.refreshToken, {
      httpOnly: true,
      maxAge: 300,
      path: "/",
    });

    return {
      success: true,
      data: result.data.post,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to fetch preview data",
    };
  }
});
