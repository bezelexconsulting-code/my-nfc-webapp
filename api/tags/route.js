import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "tags.json");

function isValidAdmin(request) {
  const token = request.headers.get("x-admin-token") || "";
  const expected = process.env.ADMIN_TOKEN || "admin-secret";
  return token === expected;
}

// GET all tags (admin use)
export async function GET(request) {
  try {
    // Allow public listing by owner via query param: /api/tags?owner=email
    let owner = null;
    try {
      const url = request.url && (request.url.startsWith("http:") || request.url.startsWith("https:"))
        ? new URL(request.url)
        : new URL(request.url || "", `http://${request.headers.get("host") || "localhost"}`);
      owner = url.searchParams.get("owner");
    } catch (err) {
      console.error("Failed to parse request URL for owner param:", err, request.url);
      owner = null;
    }
    const data = await fs.readFile(filePath, "utf-8");
    const tags = JSON.parse(data || "[]");

    if (owner) {
      // Return public view of tags assigned to this owner (no password)
      const ownerTags = tags.filter((t) => t.owner === owner).map(({ password, ...rest }) => rest);
      return Response.json(ownerTags);
    }

    // Otherwise require admin token
    if (!isValidAdmin(request)) {
      return new Response("Admin token required", { status: 401 });
    }

    return Response.json(tags);
  } catch (error) {
    console.error("Error reading tags.json:", error);
    return new Response("Failed to load tags", { status: 500 });
  }
}

// POST new tag (admin creates a new tag)
export async function POST(request) {
  try {
    if (!isValidAdmin(request)) {
      return new Response("Admin token required", { status: 401 });
    }

    const body = await request.json();
    const data = await fs.readFile(filePath, "utf-8");
    const tags = JSON.parse(data || "[]");

    const newTag = {
      slug: body.slug,
      name: body.name || "",
      phone1: body.phone1 || "",
      phone2: body.phone2 || "",
      address: body.address || "",
      claimed: false,
      password: null,
      owner: body.owner || null
    };

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
