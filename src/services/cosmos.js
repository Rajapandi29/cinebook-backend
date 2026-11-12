const { CosmosClient } = require("@azure/cosmos");
const { DefaultAzureCredential } = require("@azure/identity");
let containerPromise;
async function getContainer() {
  if (!containerPromise) containerPromise = (async () => {
    const endpoint = process.env.COSMOS_ENDPOINT;
    if (!endpoint) throw new Error("COSMOS_ENDPOINT is not configured");
    const client = new CosmosClient({ endpoint, aadCredentials: new DefaultAzureCredential() });
    const db = client.database(process.env.COSMOS_DATABASE || "cinebook");
    return db.container(process.env.COSMOS_CONTAINER || "appdata");
  })();
  return containerPromise;
}
async function read(id, partitionKey) {
  const c = await getContainer();
  try { const { resource } = await c.item(id, partitionKey).read(); return resource || null; }
  catch (e) { if (e.code === 404) return null; throw e; }
}
async function query(querySpec, parameters = []) {
  const c = await getContainer();
  const { resources } = await c.items.query({ query: querySpec, parameters }).fetchAll();
  return resources;
}
async function create(doc) {
  const c = await getContainer();
  const { resource } = await c.items.create(doc);
  return resource;
}
async function upsert(doc) {
  const c = await getContainer();
  const { resource } = await c.items.upsert(doc);
  return resource;
}
module.exports = { getContainer, read, query, create, upsert };