import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";

const prisma = new PrismaClient();

// Helper function to authenticate client
async function authenticateClient(req) {
  const clientName = req.headers.get("x-client-name");
  const clientPassword = req.headers.get("x-client-password");
  
  if (!clientName || !clientPassword) {
    return { error: "Client authentication required", status: 401 };
  }
  
  const client = await prisma.client.findUnique({
    where: { name: clientName },
  });
  
  if (!client) {
    return { error: "Client not found", status: 404 };
  }
  
  const isValid = await compare(clientPassword, client.password);
  if (!isValid) {
    return { error: "Invalid client credentials", status: 401 };
  }
  
  return { client };
}

// UPDATE a tag (client can only update their own tags)
export async function PUT(req, { params }) {
  try {
    const { error, status, client } = await authenticateClient(req);
    if (error) {
      return new Response(JSON.stringify({ error }), { status });
    }

    const { id } = params;
    const { name, phone1, phone2, address, url } = await req.json();

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
        JSON.stringify({ error: "You can only update your own tags" }),
        { status: 403 }
      );
    }

    // Update the tag
    const updatedTag = await prisma.tag.update({
      where: { id: parseInt(id) },
      data: {
        name: name || tag.name,
        phone1: phone1 || tag.phone1,
        phone2: phone2 || tag.phone2,
        address: address || tag.address,
        url: url !== undefined ? url : tag.url,
      },
    });

    return new Response(JSON.stringify(updatedTag), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`PUT /api/client/tags/${params.id} error:`, error);
    return new Response(
      JSON.stringify({ error: "Failed to update tag" }),
      { status: 500 }
    );
  }
}