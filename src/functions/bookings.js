const { app } = require("@azure/functions");
const crypto = require("crypto");
const db = require("../services/cosmos");
const { publishBookingEvent } = require("../services/serviceBus");
const { requireAuth } = require("../middleware/auth");
const { respond } = require("../utils/http");

app.http("bookingCreate",{route:"bookings",methods:["POST"],authLevel:"anonymous",handler:async req=>{
 const auth=await requireAuth(req);if(auth.error)return auth.error;
 try{
  const input=await req.json();const showId=String(input.showId||"");const seatIds=[...new Set(input.seatIds||[])];
  if(!showId||!seatIds.length||seatIds.length>6)return respond(req,400,{error:"showId and 1–6 unique seatIds are required"});
  if(seatIds.some(s=>! /^[A-E][1-8]$/.test(s)))return respond(req,400,{error:"Invalid seat identifier"});
  const show=await db.read(showId,showId);if(!show||show.type!=="show")return respond(req,404,{error:"Show not found"});
  const existing=await db.query("SELECT * FROM c WHERE c.type=@type AND c.showId=@showId AND c.status=@status AND ARRAY_LENGTH(ARRAY_INTERSECT(c.seatIds,@seats)) > 0",
   [{name:"@type",value:"booking"},{name:"@showId",value:showId},{name:"@status",value:"confirmed"},{name:"@seats",value:seatIds}]);
  if(existing.length)return respond(req,409,{error:"One or more seats are no longer available"});
  const booking={id:crypto.randomUUID(),type:"booking",showId,seatIds,userId:auth.user.sub,status:"confirmed",createdAt:new Date().toISOString()};
  await db.create(booking);
  try{await publishBookingEvent({eventId:crypto.randomUUID(),type:"BookingCreated",bookingId:booking.id,showId,seatIds,userId:booking.userId,createdAt:booking.createdAt});}
  catch(e){console.error("Booking saved but event publish failed",e);/* outbox/retry should be added before production */}
  return respond(req,201,{bookingId:booking.id,status:booking.status});
 }catch(e){console.error(e);if(e.code===409)return respond(req,409,{error:"Booking conflict; refresh seats and try again"});return respond(req,500,{error:"Unable to create booking"});}
}});
app.http("bookingsList",{route:"bookings",methods:["GET"],authLevel:"anonymous",handler:async req=>{
 const auth=await requireAuth(req);if(auth.error)return auth.error;
 try{const items=await db.query("SELECT * FROM c WHERE c.type=@type AND c.userId=@userId ORDER BY c.createdAt DESC",[{name:"@type",value:"booking"},{name:"@userId",value:auth.user.sub}]);return respond(req,200,{items});}
 catch(e){console.error(e);return respond(req,500,{error:"Unable to load bookings"});}
}});