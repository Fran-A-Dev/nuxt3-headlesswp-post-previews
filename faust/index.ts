type Tokens = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiration: number;
  refreshTokenExpiration: number;
};

export async function getTokensFromCode(code: string): Promise<Tokens> {
  const config = useRuntimeConfig();
  const apiClientSecret = config.faustSecretKey;

  if (!apiClientSecret) {
    throw new Error("The FAUST_SECRET_KEY must be specified in your .env file");
  }

  // Remove /graphql from the URL if it exists
  const baseUrl = config.public.wordpressUrl.replace("/graphql", "");
  const authorizeUrl = `${baseUrl}/?rest_route=/faustwp/v1/authorize`;

  try {
    const response = await fetch(authorizeUrl, {
      headers: {
        "Content-Type": "application/json",
        "x-faustwp-secret": apiClientSecret,
      },
      method: "POST",
      body: JSON.stringify({
        code,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to get tokens: ${response.statusText}. ${errorText}`
      );
    }

    const tokens: Tokens = await response.json();
    return tokens;
  } catch (error: any) {
    throw error;
  }
}

export async function getTokensFromRefreshToken(
  refreshToken: string
): Promise<Tokens> {
  const config = useRuntimeConfig();
  const apiClientSecret = config.faustSecretKey;

  if (!apiClientSecret) {
    throw new Error("The FAUST_SECRET_KEY must be specified in your .env file");
  }

  // Remove /graphql from the URL if it exists
  const baseUrl = config.public.wordpressUrl.replace("/graphql", "");
  const authorizeUrl = `${baseUrl}/?rest_route=/faustwp/v1/authorize`;

  try {
    const response = await fetch(authorizeUrl, {
      headers: {
        "Content-Type": "application/json",
        "x-faustwp-secret": apiClientSecret,
      },
      method: "POST",
      body: JSON.stringify({
        refreshToken,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to refresh tokens: ${response.statusText}. ${errorText}`
      );
    }

    const tokens: Tokens = await response.json();
    return tokens;
  } catch (error: any) {
    throw error;
  }
}
