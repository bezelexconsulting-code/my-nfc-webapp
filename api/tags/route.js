import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "tags.json");

export async function GET() {
  const data = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath))
    : [];
  return new Response(JSON.stringify(data), { status: 200 });
}

export async function POST(req) {
  const body = await req.json();
  const data = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath))
    : [];

  data.push(body);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  return new Response(JSON.stringify(body), { status: 201 });
}