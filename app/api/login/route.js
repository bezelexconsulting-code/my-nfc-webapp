import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req) {
  const body = await req.json();
  const { name, password } = body;

  const client = await prisma.client.findUnique({
    where: { name },
    include: { tags: true },
  });

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
      client: { id: client.id, name: client.name },
      tags: client.tags || [],
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}