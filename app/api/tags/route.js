import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req) {
  const { clientName, slug, name, phone1, phone2, address } = await req.json();

  const client = await prisma.client.findUnique({ where: { name: clientName } });
  if (!client) {
    return new Response(JSON.stringify({ error: "Client not found" }), { status: 404 });
  }

  const tag = await prisma.tag.create({
    data: { slug, name, phone1, phone2, address, clientId: client.id },
  });

  return new Response(JSON.stringify(tag), {
    headers: { "Content-Type": "application/json" },
  });
}