import fs from "fs";
import path from "path";

export async function GET() {
  const filePath = path.join(process.cwd(), "data", "tags.json");
  const jsonData = fs.readFileSync(filePath, "utf-8");
  const tags = JSON.parse(jsonData);
  return new Response(JSON.stringify(tags), { status: 200 });
}

export async function POST(req) {
  const filePath = path.join(process.cwd(), "data", "tags.json");
  const body = await req.json();
  const tags = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  tags.push(body);

  fs.writeFileSync(filePath, JSON.stringify(tags, null, 2));
  return new Response(JSON.stringify(body), { status: 201 });
}