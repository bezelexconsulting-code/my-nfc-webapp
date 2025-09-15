import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Update a tag (client only)
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const { name, phone1, phone2, address, url } = await req.json();
    
    // Validate tag ID
    const tagId = parseInt(id, 10);
    if (isNaN(tagId)) {
      return new Response(JSON.stringify({ error: "Invalid tag ID" }), { status: 400 });
    }

    // Find the tag
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: { client: true },
    });

    if (!tag) {
      return new Response(JSON.stringify({ error: "Tag not found" }), { status: 404 });
    }

    // Update the tag
    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: {
        name: name ?? tag.name,
        phone1: phone1 ?? tag.phone1,
        phone2: phone2 ?? tag.phone2,
        address: address ?? tag.address,
        url: url ?? tag.url,
      },
    });

    return new Response(JSON.stringify(updatedTag), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("PUT /api/tags/[id] error:", error);
    return new Response(JSON.stringify({ error: "Failed to update tag" }), { status: 500 });
  }
}

// Get a specific tag (client only)
export async function GET(req, { params }) {
  try {
    const { id } = params;
    
    // Validate tag ID
    const tagId = parseInt(id, 10);
    if (isNaN(tagId)) {
      return new Response(JSON.stringify({ error: "Invalid tag ID" }), { status: 400 });
    }

    // Find the tag
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      return new Response(JSON.stringify({ error: "Tag not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(tag), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET /api/tags/[id] error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch tag" }), { status: 500 });
  }
}