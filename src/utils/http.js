const { json } = require("../middleware/auth");
function cors(request) {
  const allowed = (process.env.CORS_ORIGINS || "").split(",").map(x=>x.trim()).filter(Boolean);
  const origin = request.headers.get("origin") || "";
  return allowed.includes(origin) ? {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Vary": "Origin"
  } : {};
}
function respond(request,status,body){return json(status,body,cors(request));}
async function body(request){try{return await request.json()}catch{return null}}
module.exports={cors,respond,body};