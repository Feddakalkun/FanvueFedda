const ERROR_CATEGORY = {
  AUTH: "auth",
  RATE_LIMIT: "rate_limit",
  MEDIA: "media",
  NETWORK: "network",
  VALIDATION: "validation",
  UNKNOWN: "unknown",
};

function categorizeError(input) {
  const msg = String(input?.message || input || "").toLowerCase();
  if (msg.includes("401") || msg.includes("403") || msg.includes("auth") || msg.includes("token")) return ERROR_CATEGORY.AUTH;
  if (msg.includes("429") || msg.includes("rate")) return ERROR_CATEGORY.RATE_LIMIT;
  if (msg.includes("media") || msg.includes("upload") || msg.includes("image") || msg.includes("video")) return ERROR_CATEGORY.MEDIA;
  if (msg.includes("network") || msg.includes("fetch") || msg.includes("timeout") || msg.includes("socket")) return ERROR_CATEGORY.NETWORK;
  if (msg.includes("invalid") || msg.includes("required")) return ERROR_CATEGORY.VALIDATION;
  return ERROR_CATEGORY.UNKNOWN;
}

module.exports = { ERROR_CATEGORY, categorizeError };
