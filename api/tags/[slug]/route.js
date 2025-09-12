import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "tags.json");

export async function GET(req, { params }) {
  const slug = params?.slug;
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const tag = data.find(t => t.slug === slug);
  if (!tag) return new Response(JSON.stringify({ error: "Tag not found" }), { status: 404 });
  return new Response(JSON.stringify(tag), { status: 200 });
}

export async function PUT(req, { params }) {
  const slug = params?.slug;
  const body = await req.json();
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const index = data.findIndex(t => t.slug === slug);
  if (index === -1) return new Response(JSON.stringify({ error: "Tag not found" }), { status: 404 });
  
  data[index] = { ...data[index], ...body };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return new Response(JSON.stringify(data[index]), { status: 200 });
}