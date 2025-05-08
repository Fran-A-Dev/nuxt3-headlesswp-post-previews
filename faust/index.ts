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

  console.log("Authorize URL:", authorizeUrl);
  console.log("Code being used:", code.slice(0, 10) + "...");

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
      console.error("Failed to get tokens:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(
        `Failed to get tokens: ${response.statusText}. ${errorText}`
      );
    }

    const tokens: Tokens = await response.json();
    console.log("Tokens successfully retrieved");
    return tokens;
  } catch (error: any) {
    console.error("Error in getTokensFromCode:", error.message);
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

  console.log("Authorize URL for refresh:", authorizeUrl);

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
      console.error("Failed to refresh tokens:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(
        `Failed to refresh tokens: ${response.statusText}. ${errorText}`
      );
    }

    const tokens: Tokens = await response.json();
    console.log("Tokens successfully refreshed");
    return tokens;
  } catch (error: any) {
    console.error("Error in getTokensFromRefreshToken:", error.message);
    throw error;
  }
}
