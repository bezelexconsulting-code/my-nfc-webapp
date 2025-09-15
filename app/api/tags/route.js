import { promises as fs } from "fs";
import path from "path";

const dataFile = path.join(process.cwd(), "data", "tags.json");

function getAdminToken() {
  return process.env.ADMIN_TOKEN || "admin-secret";
}

function isAdmin(request) {
  try {
    return (request.headers && request.headers.get && request.headers.get("x-admin-token") === getAdminToken());
  } catch (e) {
    return false;
  }
}

// GET all tags (admin or owner listing)
export async function GET(request) {
  try {
    // parse owner param if present
    let owner = null;
    try {
      const raw = request?.url || "";
      const url = raw.startsWith("http:") || raw.startsWith("https:")
        ? new URL(raw)
        : new URL(raw, `http://${request?.headers?.get?.("host") || "localhost"}`);
      owner = url.searchParams.get("owner");
    } catch (e) {
      owner = null;
    }

    const data = await fs.readFile(dataFile, "utf-8");
    const tags = JSON.parse(data || "[]");

    if (owner) {
      const ownerTags = tags
        .filter((t) => t.owner === owner)
        .map(({ password, ...rest }) => rest);
      return new Response(JSON.stringify(ownerTags), { status: 200 });
    }

    // require admin for full listing
    if (!isAdmin(request)) {
      return new Response(JSON.stringify({ error: "Admin token required" }), { status: 401 });
    }

    return new Response(JSON.stringify(tags), { status: 200 });
  } catch (error) {
    console.error("GET /api/tags error:", error);
    return new Response(JSON.stringify({ error: "Failed to load tags" }), { status: 500 });
  }
}

// CREATE new tag (admin only)
export async function POST(request) {
  try {
    if (!isAdmin(request)) {
      return new Response(JSON.stringify({ error: "Admin token required" }), { status: 401 });
    }

    const body = await request.json();
    const slug = body.slug;
    const name = body.name || "";

    if (!slug) {
      return new Response(JSON.stringify({ error: "Slug required" }), { status: 400 });
    }

    const data = await fs.readFile(dataFile, "utf-8");
    const tags = JSON.parse(data || "[]");

    if (tags.find((t) => t.slug === slug)) {
      return new Response(JSON.stringify({ error: "Slug already exists" }), { status: 400 });
    }

    const newTag = { slug, name, phone1: "", phone2: "", address: "", claimed: false, password: null, owner: null };
    tags.push(newTag);

    await fs.writeFile(dataFile, JSON.stringify(tags, null, 2));

    return new Response(JSON.stringify(newTag), { status: 201 });
  } catch (error) {
    console.error("POST /api/tags error:", error);
    return new Response(JSON.stringify({ error: "Failed to create tag" }), { status: 500 });
  }
}