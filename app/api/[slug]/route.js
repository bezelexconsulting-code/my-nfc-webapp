import { promises as fs } from "fs";
import path from "path";

const dataFile = path.join(process.cwd(), "data", "tags.json");

// GET one tag (public view)
export async function GET(req, { params }) {
  try {
    const { slug } = params;
    const data = await fs.readFile(dataFile, "utf-8");
    const tags = JSON.parse(data || "[]");

    const tag = tags.find((t) => t.slug === slug);
    if (!tag) {
      return new Response(JSON.stringify({ error: "Tag not found" }), { status: 404 });
    }

    const { password, ...publicData } = tag;
    return new Response(JSON.stringify(publicData), { status: 200 });
  } catch (error) {
    console.error("GET /api/[slug] error:", error);
    return new Response(JSON.stringify({ error: "Failed to load tag" }), { status: 500 });
  }
}

// UPDATE one tag (client claim/edit)
export async function PUT(req, { params }) {
  try {
    const { slug } = params;
    const body = await req.json();
    const { name, phone1, phone2, address, url, password, owner } = body;

    const data = await fs.readFile(dataFile, "utf-8");
    const tags = JSON.parse(data || "[]");

    const tagIndex = tags.findIndex((t) => t.slug === slug);
    if (tagIndex === -1) {
      return new Response(JSON.stringify({ error: "Tag not found" }), { status: 404 });
    }

    const existingTag = tags[tagIndex];

    // If unclaimed, require password to claim
    if (!existingTag.claimed) {
      if (!password) {
        return new Response(JSON.stringify({ error: "Password required to claim tag" }), { status: 400 });
      }

      tags[tagIndex] = {
        ...existingTag,
        name: name ?? existingTag.name,
        phone1: phone1 ?? existingTag.phone1,
        phone2: phone2 ?? existingTag.phone2,
        address: address ?? existingTag.address,
        url: url ?? existingTag.url,
        claimed: true,
        password: password,
        owner: owner || null,
      };
    } else {
      // Require correct password to update
      if (existingTag.password !== password) {
        return new Response(JSON.stringify({ error: "Invalid password" }), { status: 403 });
      }

      tags[tagIndex] = {
        ...existingTag,
        name: name ?? existingTag.name,
        phone1: phone1 ?? existingTag.phone1,
        phone2: phone2 ?? existingTag.phone2,
        address: address ?? existingTag.address,
      };
    }

    await fs.writeFile(dataFile, JSON.stringify(tags, null, 2));

    const { password: pwd, ...safeTag } = tags[tagIndex];
    return new Response(JSON.stringify(safeTag), { status: 200 });
  } catch (error) {
    console.error("PUT /api/[slug] error:", error);
    return new Response(JSON.stringify({ error: "Failed to update tag" }), { status: 500 });
  }
}