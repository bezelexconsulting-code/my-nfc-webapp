import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// GET one tag (public view)
export async function GET(req, { params }) {
  try {
    const { slug } = await params;

    const tag = await prisma.tag.findUnique({
      where: { slug },
    });

    if (!tag) {
      return new Response(JSON.stringify({ error: "Tag not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(tag), { status: 200 });
  } catch (error) {
    console.error("GET /api/[slug] error:", error);
    return new Response(JSON.stringify({ error: "Failed to load tag" }), {
      status: 500,
    });
  }
}

// UPDATE one tag (client claim/edit)
export async function PUT(req, { params }) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const { name, phone1, phone2, address } = body;

    // For simplicity, this PUT route will now only update basic tag info
    // The complex logic for claiming and passwords has been removed as it's
    // handled by the client login and dashboard system now.

    const updatedTag = await prisma.tag.update({
      where: { slug: slug },
      data: {
        name: name,
        phone1: phone1,
        phone2: phone2,
        address: address,
      },
    });

    return new Response(JSON.stringify(updatedTag), { status: 200 });
  } catch (error) {
    console.error("PUT /api/[slug] error:", error);
    // Check for specific prisma error for record not found
    if (error.code === 'P2025') {
      return new Response(JSON.stringify({ error: "Tag not found" }), { status: 404 });
    }
    return new Response(JSON.stringify({ error: "Failed to update tag" }), {
      status: 500,
    });
  }
}