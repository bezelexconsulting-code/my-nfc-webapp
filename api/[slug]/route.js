import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "tags.json");

// GET all tags (admin use)
export async function GET() {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    const tags = JSON.parse(data || "[]");
    return Response.json(tags);
  } catch (error) {
    console.error("Error reading tags.json:", error);
    return new Response("Failed to load tags", { status: 500 });
  }
}

// POST new tag (admin creates a new tag)
export async function POST(request) {
  try {
    const body = await request.json();
    const data = await fs.readFile(filePath, "utf-8");
    const tags = JSON.parse(data || "[]");

    // Each tag must have a unique slug
    const newTag = {
      slug: body.slug,
      name: body.name || "",
      phone1: body.phone1 || "",
      phone2: body.phone2 || "",
      address: body.address || "",
      claimed: false,
      password: null,
    };

    // Check if slug already exists
    if (tags.find((tag) => tag.slug === newTag.slug)) {
      return new Response("Tag already exists", { status: 400 });
    }

    tags.push(newTag);

    await fs.writeFile(filePath, JSON.stringify(tags, null, 2));

    return Response.json(newTag, { status: 201 });
  } catch (error) {
    console.error("Error creating new tag:", error);
    return new Response("Failed to create tag", { status: 500 });
  }
}