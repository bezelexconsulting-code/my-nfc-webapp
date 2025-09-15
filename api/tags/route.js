import { promises as fs } from "fs";
import path from "path";

const dataFile = path.join(process.cwd(), "data", "tags.json");

// GET all tags
export async function GET() {
  try {
    const data = await fs.readFile(dataFile, "utf-8");
    return new Response(data, { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to load tags" }), { status: 500 });
  }
}

// CREATE new tag
export async function POST(req) {
  try {
    const body = await req.json();
    const { slug, name } = body;

    if (!slug || !name) {
      return new Response(JSON.stringify({ error: "Slug and name required" }), { status: 400 });
    }

    const data = await fs.readFile(dataFile, "utf-8");
    const tags = JSON.parse(data);

    if (tags.find(t => t.slug === slug)) {
      return new Response(JSON.stringify({ error: "Slug already exists" }), { status: 400 });
    }

    const newTag = { slug, name, phone: "", address: "", password: "" };
    tags.push(newTag);

    await fs.writeFile(dataFile, JSON.stringify(tags, null, 2));

    return new Response(JSON.stringify(newTag), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to create tag" }), { status: 500 });
  }
}