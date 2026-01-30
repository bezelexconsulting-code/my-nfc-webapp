import { PrismaClient } from "@prisma/client";
import { getClientFromRequest } from "../../../../lib/auth";

const prisma = new PrismaClient();

export async function DELETE(req) {
  try {
    const { error, status, client } = await getClientFromRequest(req, { includeTags: true });
    if (error) {
      return new Response(JSON.stringify({ error }), { status });
    }

    // Delete all tags first (due to foreign key constraint)
    await prisma.tag.deleteMany({
      where: { clientId: client.id },
    });

    // Delete client account
    await prisma.client.delete({
      where: { id: client.id },
    });

    return new Response(JSON.stringify({ 
      message: "Account deleted successfully",
    }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("DELETE /api/client/account error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete account" }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
