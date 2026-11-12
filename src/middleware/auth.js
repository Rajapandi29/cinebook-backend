const { createRemoteJWKSet, jwtVerify } = require("jose");
let jwks;
function json(status, body, extra = {}) {
  return { status, jsonBody: body, headers: { "Content-Type":"application/json", ...extra } };
}
async function requireAuth(request) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return { error: json(401, { error:"Bearer token required" }) };
  const tenantId = process.env.ENTRA_TENANT_ID;
  const audience = process.env.ENTRA_API_AUDIENCE;
  const issuer = process.env.ENTRA_ISSUER;
  if (!tenantId || !audience || !issuer) return { error: json(500, { error:"Identity validation is not configured" }) };
  try {
    const metadataUrl = `https://${tenantId}.ciamlogin.com/${tenantId}/discovery/v2.0/keys`;
    jwks ||= createRemoteJWKSet(new URL(metadataUrl));
    const { payload } = await jwtVerify(token, jwks, { audience, issuer });
    return { user: payload };
  } catch { return { error: json(401, { error:"Invalid or expired access token" }) }; }
}
module.exports = { requireAuth, json };