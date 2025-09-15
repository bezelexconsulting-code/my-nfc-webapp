import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Get all tags (admin only)
export async function GET(req) {
  try {
    // Check admin token
    const adminToken = req.headers.get("x-admin-token");
    if (!adminToken) {
      return new Response(JSON.stringify({ error: "Admin token required" }), {
        status: 401,
      });
    }

    // Verify admin token
    const admin = await prisma.admin.findUnique({
      where: { token: adminToken },
    });

    if (!admin) {
      return new Response(JSON.stringify({ error: "Invalid admin token" }), {
        status: 403,
      });
    }

    // Get all tags with client info
    const tags = await prisma.tag.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return new Response(JSON.stringify(tags), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET /api/tags error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch tags" }), {
      status: 500,
    });
  }
}

// Create a new tag (admin only)
export async function POST(req) {
  try {
    const { clientName, slug } = await req.json();

    // Validation
    if (!clientName || !slug) {
      return new Response(
        JSON.stringify({ error: "Client name and slug are required" }),
        { status: 400 }
      );
    }

    // Check admin token
    const adminToken = req.headers.get("x-admin-token");
    if (!adminToken) {
      return new Response(JSON.stringify({ error: "Admin token required" }), {
        status: 401,
      });
    }

    // Verify admin token
    const admin = await prisma.admin.findUnique({
      where: { token: adminToken },
    });

    if (!admin) {
      return new Response(JSON.stringify({ error: "Invalid admin token" }), {
        status: 403,
      });
    }

    // Check if slug already exists
    const existingTag = await prisma.tag.findUnique({
      where: { slug },
    });

    if (existingTag) {
      return new Response(JSON.stringify({ error: "Tag slug already exists" }), {
        status: 409,
      });
    }

    // Find client
    const client = await prisma.client.findUnique({ where: { name: clientName } });
    if (!client) {
      return new Response(JSON.stringify({ error: "Client not found" }), { status: 404 });
    }

    // Create tag with empty fields (client will fill them later)
    const tag = await prisma.tag.create({
      data: { 
        slug, 
        name: "", 
        phone1: "", 
        phone2: "", 
        address: "", 
        clientId: client.id 
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return new Response(JSON.stringify(tag), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("POST /api/tags error:", error);
    return new Response(JSON.stringify({ error: "Failed to create tag" }), {
      status: 500,
    });
  }
}