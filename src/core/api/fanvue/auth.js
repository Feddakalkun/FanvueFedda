const crypto = require("crypto");

class FanvueAuth {
  constructor({ tokenStore, clientId, clientSecret, redirectUri, authorizationEndpoint, tokenEndpoint } = {}) {
    this.clientId = clientId || process.env.FANVUE_CLIENT_ID || "";
    this.clientSecret = clientSecret || process.env.FANVUE_CLIENT_SECRET || "";
    this.redirectUri = redirectUri || process.env.FANVUE_REDIRECT_URI || "https://localhost:3001/api/auth/fanvue/callback";
    this.authorizationEndpoint = authorizationEndpoint || process.env.FANVUE_AUTH_URL || "https://auth.fanvue.com/oauth2/auth";
    this.tokenEndpoint = tokenEndpoint || process.env.FANVUE_TOKEN_URL || "https://auth.fanvue.com/oauth2/token";
    this.tokenStore = tokenStore;
  }

  generatePKCE() {
    const codeVerifier = crypto.randomBytes(32).toString("base64url");
    const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");
    return { codeVerifier, codeChallenge, state: crypto.randomUUID() };
  }

  getAuthorizationUrl(codeChallenge, state) {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      scope: "read:self read:chat read:media read:post write:chat write:media write:post",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state,
    });
    return `${this.authorizationEndpoint}?${params.toString()}`;
  }

  async exchangeCodeForTokens(code, codeVerifier) {
    const res = await fetch(this.tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        code,
        code_verifier: codeVerifier,
      }),
    });
    if (!res.ok) throw new Error(`fanvue_token_exchange_failed_${res.status}`);
    return res.json();
  }

  async refreshAccessToken(refreshToken) {
    const res = await fetch(this.tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "refresh_token",
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
      }),
    });
    if (!res.ok) throw new Error(`fanvue_token_refresh_failed_${res.status}`);
    return res.json();
  }

  async getAccessToken(accountId = "default") {
    if (!this.tokenStore) throw new Error("missing_token_store");
    const tokens = await this.tokenStore.get(accountId);
    if (!tokens?.access_token) throw new Error("missing_access_token");

    const expiresAt = tokens.expires_at ? new Date(tokens.expires_at).getTime() : 0;
    const now = Date.now();
    if (expiresAt > now + 30_000) return tokens.access_token;
    if (!tokens.refresh_token) return tokens.access_token;

    const refreshed = await this.refreshAccessToken(tokens.refresh_token);
    const normalized = {
      ...tokens,
      ...refreshed,
      expires_at: new Date(Date.now() + ((refreshed.expires_in || 3600) * 1000)).toISOString(),
    };
    await this.tokenStore.save(accountId, normalized);
    return normalized.access_token;
  }
}

module.exports = { FanvueAuth };
