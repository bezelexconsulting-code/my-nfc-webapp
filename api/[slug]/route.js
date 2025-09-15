import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "tags.json");

// GET single tag (public view)
export async function GET(request, { params }) {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    const tags = JSON.parse(data || "[]");

    const tag = tags.find((t) => t.slug === params.slug);
    if (!tag) {
      return new Response("Tag not found", { status: 404 });
    }

    // Hide password from public response
    const { password, ...publicTag } = tag;

    return Response.json(publicTag);
  } catch (error) {
    console.error("Error reading tag:", error);
    return new Response("Failed to load tag", { status: 500 });
  }
}

// PUT update tag (client edit/claim)
export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const data = await fs.readFile(filePath, "utf-8");
    const tags = JSON.parse(data || "[]");

    const tagIndex = tags.findIndex((t) => t.slug === params.slug);
    if (tagIndex === -1) {
      return new Response("Tag not found", { status: 404 });
    }

    const existingTag = tags[tagIndex];
    // If tag is not claimed yet, require a password to claim and save owner
    if (!existingTag.claimed) {
      if (!body.password) {
        return new Response("Password required to claim tag", { status: 400 });
      }

      tags[tagIndex] = {
        ...existingTag,
        name: body.name ?? existingTag.name,
        phone1: body.phone1 ?? existingTag.phone1,
        phone2: body.phone2 ?? existingTag.phone2,
        address: body.address ?? existingTag.address,
        claimed: true,
        password: body.password,
        owner: body.owner || null,
      };
    } else {
      // If claimed, require correct password
      if (body.password !== existingTag.password) {
        return new Response("Invalid password", { status: 403 });
      }

      // Update only safe fields
      tags[tagIndex] = {
        ...existingTag,
        name: body.name ?? existingTag.name,
        phone1: body.phone1 ?? existingTag.phone1,
        phone2: body.phone2 ?? existingTag.phone2,
        address: body.address ?? existingTag.address,
      };
    }

    await fs.writeFile(filePath, JSON.stringify(tags, null, 2));

    // Do not return password in the response
    const { password, ...safeTag } = tags[tagIndex];
    return Response.json(safeTag);
  } catch (error) {
    console.error("Error updating tag:", error);
    return new Response("Failed to update tag", { status: 500 });
  }
}
