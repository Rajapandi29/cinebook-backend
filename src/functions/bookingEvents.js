const { app } = require("@azure/functions");
// Create a Service Bus topic named booking-events and a subscription named notifications.
// This consumer is intentionally separate from the HTTP booking response.
app.serviceBusTopic("bookingEventConsumer",{
 connection:"SERVICE_BUS_CONNECTION",
 topicName:process.env.SERVICE_BUS_TOPIC||"booking-events",
 subscriptionName:process.env.SERVICE_BUS_SUBSCRIPTION||"notifications",
 handler:async message=>{
  console.log("Booking event received",JSON.stringify(message));
  // Add email/SMS/push notification provider here. Keep this handler idempotent.
 }
});