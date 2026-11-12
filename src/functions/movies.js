const { app } = require("@azure/functions");
const db = require("../services/cosmos");
const { requireAuth } = require("../middleware/auth");
const { respond } = require("../utils/http");

app.http("moviesList", { route:"movies", methods:["GET"], authLevel:"anonymous", handler:async req=>{
  try {
    const items=await db.query("SELECT * FROM c WHERE c.type = @type AND (NOT IS_DEFINED(c.isActive) OR c.isActive = true)",[{name:"@type",value:"movie"}]);
    return respond(req,200,{items});
  } catch(e){ console.error(e); return respond(req,500,{error:"Unable to load movies"}); }
}});
app.http("movieGet", { route:"movies/{id}", methods:["GET"], authLevel:"anonymous", handler:async req=>{
  try { const item=await db.read(req.params.id,req.params.id); return item?.type==="movie"?respond(req,200,item):respond(req,404,{error:"Movie not found"}); }
  catch(e){console.error(e);return respond(req,500,{error:"Unable to load movie"});}
}});
app.http("movieCreate", { route:"admin/movies", methods:["POST"], authLevel:"anonymous", handler:async req=>{
  const auth=await requireAuth(req); if(auth.error)return auth.error;
  try {
    const input=await req.json();
    if(!input.title?.trim())return respond(req,400,{error:"title is required"});
    const doc={id:input.id||require("crypto").randomUUID(),type:"movie",title:input.title.trim(),description:input.description||"",genre:input.genre||"",language:input.language||"",posterUrl:input.posterUrl||"",durationMinutes:Number(input.durationMinutes)||0,isActive:true,createdAt:new Date().toISOString()};
    return respond(req,201,await db.create(doc));
  }catch(e){console.error(e);return respond(req,500,{error:"Unable to create movie"});}
}});