import { promises as fs } from "fs";
import path from "path";

const dataFile = path.join(process.cwd(), "data", "tags.json");

// GET one tag (public view)
export async function GET(req, { params }) {
  try {
    const { slug } = params;
    const data = await fs.readFile(dataFile, "utf-8");
    const tags = JSON.parse(data);

    const tag = tags.find(t => t.slug === slug);
    if (!tag) {
      return new Response(JSON.stringify({ error: "Tag not found" }), { status: 404 });
    }

    // Hide password from public
    const { password, ...publicData } = tag;

    return new Response(JSON.stringify(publicData), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to load tag" }), { status: 500 });
  }
}

// UPDATE one tag (client claim/edit)
export async function PUT(req, { params }) {
  try {
    const { slug } = params;
    const body = await req.json();
    const { name, phone, address, password } = body;

    const data = await fs.readFile(dataFile, "utf-8");
    const tags = JSON.parse(data);

    const tagIndex = tags.findIndex(t => t.slug === slug);
    if (tagIndex === -1) {
      return new Response(JSON.stringify({ error: "Tag not found" }), { status: 404 });
    }

    const existingTag = tags[tagIndex];

    // If unclaimed, allow first password set
    if (!existingTag.password) {
      tags[tagIndex] = { ...existingTag, name, phone, address, password };
    } else {
      // Require correct password to update
      if (existingTag.password !== password) {
        return new Response(JSON.stringify({ error: "Invalid password" }), { status: 403 });
      }
      tags[tagIndex] = { ...existingTag, name, phone, address, password };
    }

    await fs.writeFile(dataFile, JSON.stringify(tags, null, 2));

    return new Response(JSON.stringify(tags[tagIndex]), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to update tag" }), { status: 500 });
  }
}