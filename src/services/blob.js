const { BlobServiceClient } = require("@azure/storage-blob");
const { DefaultAzureCredential } = require("@azure/identity");
async function uploadPoster(buffer, fileName, contentType = "image/jpeg") {
  const accountUrl = process.env.BLOB_ACCOUNT_URL;
  if (!accountUrl) throw new Error("BLOB_ACCOUNT_URL is not configured");
  const service = new BlobServiceClient(accountUrl, new DefaultAzureCredential());
  const container = service.getContainerClient(process.env.BLOB_CONTAINER || "posters");
  await container.createIfNotExists();
  const blob = container.getBlockBlobClient(fileName);
  await blob.uploadData(buffer, { blobHTTPHeaders: { blobContentType: contentType } });
  return blob.url;
}
module.exports = { uploadPoster };