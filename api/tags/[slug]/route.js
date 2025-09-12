import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "tags.json");

export async function GET(req, { params }) {
  const { slug } = params;
  const data = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath))
    : [];

  const tag = data.find(t => t.slug === slug);
  if (!tag) return new Response("Tag not found", { status: 404 });

  // Never return password to public
  const { password, ...publicData } = tag;
  return new Response(JSON.stringify(publicData), { status: 200 });
}

export async function PUT(req, { params }) {
  const { slug } = params;
  const body = await req.json();

  const data = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath))
    : [];

  const tagIndex = data.findIndex(t => t.slug === slug);
  if (tagIndex === -1)
    return new Response("Tag not found", { status: 404 });

  // Only update editable fields (name, phones, address, password)
  const allowedFields = ["name", "phone1", "phone2", "address", "password", "claimed"];
  allowedFields.forEach(field => {
    if (body[field] !== undefined) {
      data[tagIndex][field] = body[field];
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  return new Response(JSON.stringify(data[tagIndex]), { status: 200 });
}