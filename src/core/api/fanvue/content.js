class FanvueContentAPI {
  constructor({ auth } = {}) {
    this.auth = auth;
    this.baseUrl = process.env.FANVUE_API_BASE || "https://api.fanvue.com";
  }

  async createPost(payload, accountId = "default") {
    const accessToken = await this.auth.getAccessToken(accountId);
    const res = await fetch(`${this.baseUrl}/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Fanvue-API-Version": "2025-06-26",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`fanvue_create_post_failed_${res.status}`);
    return res.json();
  }
}

module.exports = { FanvueContentAPI };
