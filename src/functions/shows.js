const { app } = require("@azure/functions");
const db = require("../services/cosmos");
const { respond } = require("../utils/http");
app.http("showsList",{route:"shows",methods:["GET"],authLevel:"anonymous",handler:async req=>{
 try{const movieId=req.query.get("movieId");const q=movieId?"SELECT * FROM c WHERE c.type=@type AND c.movieId=@movieId":"SELECT * FROM c WHERE c.type=@type";const p=[{name:"@type",value:"show"}];if(movieId)p.push({name:"@movieId",value:movieId});return respond(req,200,{items:await db.query(q,p)});}catch(e){console.error(e);return respond(req,500,{error:"Unable to load shows"});}
}});
app.http("showSeats",{route:"shows/{showId}/seats",methods:["GET"],authLevel:"anonymous",handler:async req=>{
 try{const showId=req.params.showId;const show=await db.read(showId,showId);if(!show||show.type!=="show")return respond(req,404,{error:"Show not found"});const booked=await db.query("SELECT VALUE s FROM c JOIN s IN c.seatIds WHERE c.type=@type AND c.showId=@showId AND c.status != @cancelled",[{name:"@type",value:"booking"},{name:"@showId",value:showId},{name:"@cancelled",value:"cancelled"}]);const bookedSet=new Set(booked);const items=[];for(const row of ["A","B","C","D","E"])for(let n=1;n<=8;n++){const id=`${row}${n}`;items.push({id,status:bookedSet.has(id)?"booked":"available"});}return respond(req,200,{items});}catch(e){console.error(e);return respond(req,500,{error:"Unable to load seats"});}
}});