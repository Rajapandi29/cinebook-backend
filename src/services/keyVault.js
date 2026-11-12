const { SecretClient } = require("@azure/keyvault-secrets");
const { DefaultAzureCredential } = require("@azure/identity");
let client;
function getClient() {
  if (!process.env.KEY_VAULT_URL) throw new Error("KEY_VAULT_URL is not configured");
  if (!client) client = new SecretClient(process.env.KEY_VAULT_URL, new DefaultAzureCredential());
  return client;
}
async function getSecret(name) {
  const secret = await getClient().getSecret(name);
  return secret.value;
}
module.exports = { getSecret };