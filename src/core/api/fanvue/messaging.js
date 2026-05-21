const crypto = require("crypto");

class FanvueMessagingAPI {
  constructor({ auth } = {}) {
    this.auth = auth;
    this.baseUrl = process.env.FANVUE_API_BASE || "https://api.fanvue.com";
  }

  async sendMessage(fanId, content, accountId = "default") {
    const accessToken = await this.auth.getAccessToken(accountId);
    const res = await fetch(`${this.baseUrl}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Fanvue-API-Version": "2025-06-26",
      },
      body: JSON.stringify({ fan_id: fanId, content }),
    });
    if (!res.ok) throw new Error(`fanvue_send_message_failed_${res.status}`);
    return res.json();
  }

  verifyWebhookSignature(rawBody, signature) {
    const secret = process.env.FANVUE_WEBHOOK_SECRET || "";
    if (!secret || !signature) return false;
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    return expected === signature;
  }
}

module.exports = { FanvueMessagingAPI };
