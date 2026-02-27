const fs=require("fs");
const p="C:\claude_projects\as-you-cost\insert-detail-data.js";
const b=process.argv[1];
fs.writeFileSync(p, Buffer.from(b,"base64").toString("utf8"));
console.log("Written: "+fs.statSync(p).size+" bytes");
