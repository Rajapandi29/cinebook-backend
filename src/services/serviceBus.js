const { ServiceBusClient } = require("@azure/service-bus");
const { DefaultAzureCredential } = require("@azure/identity");
async function publishBookingEvent(event) {
  const namespace = process.env.SERVICE_BUS_NAMESPACE;
  const topic = process.env.SERVICE_BUS_TOPIC || "booking-events";
  if (!namespace) throw new Error("SERVICE_BUS_NAMESPACE is not configured");
  const client = new ServiceBusClient(namespace, new DefaultAzureCredential());
  const sender = client.createSender(topic);
  try { await sender.sendMessages({ body: event, contentType: "application/json", subject: event.type, messageId: event.eventId }); }
  finally { await sender.close(); await client.close(); }
}
module.exports = { publishBookingEvent };