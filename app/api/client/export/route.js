import { PrismaClient } from "@prisma/client";
import { getClientFromRequest } from "../../../../lib/auth";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { error, status, client } = await getClientFromRequest(req, { includeTags: true });
    if (error) {
      return new Response(JSON.stringify({ error }), { status });
    }

    // Prepare export data (exclude sensitive information)
    const exportData = {
      account: {
        id: client.id,
        name: client.name,
        email: client.email,
        emailVerified: client.emailVerified,
        createdAt: client.createdAt,
      },
      tags: client.tags.map(tag => ({
        id: tag.id,
        slug: tag.slug,
        name: tag.name,
        phone1: tag.phone1,
        phone2: tag.phone2,
        address: tag.address,
        street: tag.street,
        city: tag.city,
        province: tag.province,
        postalCode: tag.postalCode,
        country: tag.country,
        url: tag.url,
        instructions: tag.instructions,
        imageUrl: tag.imageUrl,
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt,
      })),
      exportedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(exportData), {
      headers: { 
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="nfc-tag-data-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("GET /api/client/export error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to export data" }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
