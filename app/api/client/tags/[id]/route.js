import { PrismaClient } from "@prisma/client";
import { getClientFromRequest } from "../../../../../lib/auth";

const prisma = new PrismaClient();

// GET a single tag (client can only read their own tags)
export async function GET(req, { params }) {
  try {
    const { error, status, client } = await getClientFromRequest(req);
    if (error) {
      return new Response(JSON.stringify({ error }), { status });
    }

    const { id } = await params;
    const tag = await prisma.tag.findFirst({
      where: {
        id: parseInt(id),
        clientId: client.id,
      },
    });

    if (!tag) {
      return new Response(JSON.stringify({ error: "Tag not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(tag), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const { id } = await params;
    console.error(`GET /api/client/tags/${id} error:`, error);
    return new Response(
      JSON.stringify({ error: "Failed to load tag", details: error.message }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// UPDATE a tag (client can only update their own tags)
export async function PUT(req, { params }) {
  try {
    const { error, status, client } = await getClientFromRequest(req);
    if (error) {
      return new Response(JSON.stringify({ error }), { status });
    }

    const { id } = await params;
    const { name, phone1, phone2, address, url, instructions, imageUrl } = await req.json();

    // Check if the tag belongs to the authenticated client
    const tag = await prisma.tag.findUnique({
      where: { id: parseInt(id) },
      include: { client: true },
    });

    if (!tag) {
      console.log(`Tag not found: ${id}`);
      return new Response(JSON.stringify({ error: "Tag not found" }), {
        status: 404,
      });
    }

    if (tag.clientId !== client.id) {
      console.log(`Unauthorized update attempt. Tag Client ID: ${tag.clientId}, Request Client ID: ${client.id}`);
      return new Response(
        JSON.stringify({ error: "You can only update your own tags" }),
        { status: 403 }
      );
    }

    // Update the tag
    const updatedTag = await prisma.tag.update({
      where: { id: parseInt(id) },
      data: {
        name: name !== undefined ? name : tag.name,
        phone1: phone1 !== undefined ? phone1 : tag.phone1,
        phone2: phone2 !== undefined ? phone2 : tag.phone2,
        address: address !== undefined ? address : tag.address,
        url: url !== undefined ? url : tag.url,
        instructions: instructions !== undefined ? instructions : tag.instructions,
        imageUrl: imageUrl !== undefined ? imageUrl : tag.imageUrl,
      },
    });

    return new Response(JSON.stringify(updatedTag), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const { id } = await params;
    console.error(`PUT /api/client/tags/${id} error:`, error);
    return new Response(
      JSON.stringify({ error: "Failed to update tag", details: error.message }),
      { status: 500 }
    );
  }
}

// DELETE a tag (client can only delete their own tags)
export async function DELETE(req, { params }) {
  try {
    const { error, status, client } = await getClientFromRequest(req);
    if (error) {
      return new Response(JSON.stringify({ error }), { status });
    }

    const { id } = await params;

    // Check if the tag belongs to the authenticated client
    const tag = await prisma.tag.findUnique({
      where: { id: parseInt(id) },
      include: { client: true },
    });

    if (!tag) {
      return new Response(JSON.stringify({ error: "Tag not found" }), {
        status: 404,
      });
    }

    if (tag.clientId !== client.id) {
      return new Response(
        JSON.stringify({ error: "You can only delete your own tags" }),
        { status: 403 }
      );
    }

    // Delete the tag
    await prisma.tag.delete({
      where: { id: parseInt(id) },
    });

    return new Response(JSON.stringify({ message: "Tag deleted successfully" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const { id } = await params;
    console.error(`DELETE /api/client/tags/${id} error:`, error);
    return new Response(
      JSON.stringify({ error: "Failed to delete tag", details: error.message }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}