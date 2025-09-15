import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function PUT(req, { params }) {
  const { id } = params;
  const { name, phone1, phone2, address } = await req.json();

  try {
    const tag = await prisma.tag.update({
      where: { id: parseInt(id) },
      data: { name, phone1, phone2, address },
    });

    return new Response(JSON.stringify(tag), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to update tag", details: err.message }),
      { status: 400 }
    );
  }
}