import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all clients (admin only)
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

    // Get all clients
    const clients = await prisma.client.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: { tags: true },
        },
      },
    });

    return new Response(JSON.stringify(clients), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET /api/clients error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch clients" }), {
      status: 500,
    });
  }
}