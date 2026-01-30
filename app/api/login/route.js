import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";

export const runtime = "nodejs";
const prisma = new PrismaClient();

export async function POST(req) {
  const body = await req.json();
  let { name, password } = body;

  // Normalize inputs
  if (typeof name === "string") {
    name = name.trim();
  }

  const identifier = name;
  let client = null;
  if (identifier && identifier.includes("@")) {
    client = await prisma.client.findUnique({
      where: { email: identifier },
      include: { tags: true },
    });
  } else {
    client = await prisma.client.findUnique({
      where: { name: identifier },
      include: { tags: true },
    });
  }

  if (!client) {
    return new Response(JSON.stringify({ error: "Client not found" }), { status: 404 });
  }

  const isValid = await compare(password, client.password);
  if (!isValid) {
    return new Response(JSON.stringify({ error: "Invalid password" }), { status: 401 });
  }

  return new Response(
    JSON.stringify({
      success: true,
      client: { 
        id: client.id, 
        name: client.name,
        email: client.email,
        emailVerified: client.emailVerified || false,
      },
      tags: client.tags || [],
      tagCount: client.tags?.length || 0,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}
