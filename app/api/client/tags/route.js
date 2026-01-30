import { PrismaClient } from "@prisma/client";
import { getClientFromRequest } from "../../../../lib/auth";

const prisma = new PrismaClient();

// GET all tags for authenticated client
export async function GET(req) {
  try {
    const { error, status, client } = await getClientFromRequest(req);
    if (error) {
      return new Response(JSON.stringify({ error }), { status });
    }

    // Get all tags for this client
    const tags = await prisma.tag.findMany({
      where: { clientId: client.id },
      orderBy: { createdAt: 'desc' },
    });

    return new Response(JSON.stringify(tags), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET /api/client/tags error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch tags", details: error.message }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create a new tag for authenticated client
export async function POST(req) {
  try {
    const { error, status, client } = await getClientFromRequest(req);
    if (error) {
      return new Response(JSON.stringify({ error }), { status });
    }

    const body = await req.json();
    const { slug, name, phone1, phone2, address, url, instructions } = body;

    // Validation
    if (!slug) {
      return new Response(
        JSON.stringify({ error: "Slug is required" }),
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingTag = await prisma.tag.findUnique({
      where: { slug },
    });

    if (existingTag) {
      return new Response(
        JSON.stringify({ error: "Tag slug already exists" }),
        { status: 409 }
      );
    }

    // Create tag
    const tag = await prisma.tag.create({
      data: {
        slug,
        name: name || "",
        phone1: phone1 || "",
        phone2: phone2 || "",
        address: address || "",
        url: url || "",
        instructions: instructions || "",
        clientId: client.id,
      },
    });

    return new Response(JSON.stringify(tag), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("POST /api/client/tags error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create tag", details: error.message }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
