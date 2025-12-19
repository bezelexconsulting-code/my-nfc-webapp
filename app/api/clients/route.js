import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

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

// Create a new client (admin only)
export async function POST(req) {
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

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ error: "Name, email, and password are required" }),
        { status: 400 }
      );
    }

    // Check if client already exists
    const existingClient = await prisma.client.findUnique({ where: { email } });
    if (existingClient) {
      return new Response(
        JSON.stringify({ error: "Client with this email already exists" }),
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const newClient = await prisma.client.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const { password: _, ...clientData } = newClient;
    return new Response(JSON.stringify(clientData), { status: 201 });
  } catch (error) {
    console.error("POST /api/clients error:", error);
    return new Response(JSON.stringify({ error: "Failed to create client" }), {
      status: 500,
    });
  }
}