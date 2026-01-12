import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Middleware to check for admin token
async function checkAdmin(req) {
  const adminToken = req.headers.get("x-admin-token");
  if (!adminToken) {
    return { error: "Admin token required", status: 401 };
  }
  const admin = await prisma.admin.findUnique({
    where: { token: adminToken },
  });
  if (!admin) {
    return { error: "Invalid admin token", status: 403 };
  }
  return { admin };
}

// UPDATE a tag (admin)
export async function PUT(req, { params }) {
  try {
    const { error, status } = await checkAdmin(req);
    if (error) {
      return new Response(JSON.stringify({ error }), { status });
    }

    const { id } = await params;
    const tagId = parseInt(id);
    if (isNaN(tagId)) {
      return new Response(JSON.stringify({ error: "Invalid tag ID" }), {
        status: 400,
      });
    }

    const data = await req.json();
    
    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!existingTag) {
      return new Response(JSON.stringify({ error: "Tag not found" }), {
        status: 404,
      });
    }

    // Update the tag
    // Allow updating any field passed in body that exists in schema
    // Sanitize data to avoid updating protected fields if necessary
    // For now, we allow updating most fields
    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: {
        slug: data.slug,
        name: data.name,
        phone1: data.phone1,
        phone2: data.phone2,
        address: data.address,
        street: data.street,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        country: data.country,
        url: data.url,
        instructions: data.instructions,
        clientId: data.clientId ? parseInt(data.clientId) : undefined,
      },
    });

    return new Response(JSON.stringify(updatedTag), { status: 200 });
  } catch (error) {
    console.error(`PUT /api/tags/${params.id} error:`, error);
    if (error.code === "P2002") {
       return new Response(JSON.stringify({ error: "Slug already exists" }), {
        status: 409,
      });
    }
    return new Response(
      JSON.stringify({ error: "Failed to update tag" }),
      { status: 500 }
    );
  }
}

// DELETE a tag
export async function DELETE(req, { params }) {
  try {
    const { error, status } = await checkAdmin(req);
    if (error) {
      return new Response(JSON.stringify({ error }), { status });
    }

    const { id } = await params;
    const tagId = parseInt(id);

    if (isNaN(tagId)) {
      return new Response(JSON.stringify({ error: "Invalid tag ID" }), {
        status: 400,
      });
    }

    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!existingTag) {
      return new Response(JSON.stringify({ error: "Tag not found" }), {
        status: 404,
      });
    }

    // Delete the tag
    await prisma.tag.delete({
      where: { id: tagId },
    });

    return new Response(JSON.stringify({ message: "Tag deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`DELETE /api/tags/${params.id} error:`, error);
    if (error.code === "P2025") {
      // Prisma error code for record not found
      return new Response(JSON.stringify({ error: "Tag not found" }), {
        status: 404,
      });
    }
    return new Response(
      JSON.stringify({ error: "Failed to delete tag" }),
      { status: 500 }
    );
  }
}
