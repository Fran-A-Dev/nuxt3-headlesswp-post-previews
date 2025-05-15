/**
 * Functions for handling Faust WordPress authentication
 */

/**
 * Base function to fetch tokens from WordPress
 */
async function getTokens(payload) {
  const config = useRuntimeConfig();
  const apiClientSecret = config.faustSecretKey;

  if (!apiClientSecret) {
    throw new Error("FAUST_SECRET_KEY environment variable must be set");
  }

  const authorizeUrl = `${config.public.wordpressUrl}/?rest_route=/faustwp/v1/authorize`;

  const response = await fetch(authorizeUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-faustwp-secret": apiClientSecret,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const action = payload.code ? "get" : "refresh";
    throw new Error(
      `Failed to ${action} tokens: ${response.statusText}. ${errorText}`
    );
  }

  return await response.json();
}

/**
 * Get tokens using an authorization code
 */
export async function getTokensFromCode(code) {
  return getTokens({ code });
}

/**
 * Get tokens using a refresh token
 */
export async function getTokensFromRefreshToken(refreshToken) {
  return getTokens({ refreshToken });
}
