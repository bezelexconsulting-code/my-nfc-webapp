import { PrismaClient } from "@prisma/client";
import { getClientFromRequest } from "../../../../lib/auth";

const prisma = new PrismaClient();

export async function PUT(req) {
  try {
    const { error, status, client } = await getClientFromRequest(req);
    if (error) {
      return new Response(JSON.stringify({ error }), { status });
    }

    const { name, email } = await req.json();

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return new Response(
          JSON.stringify({ error: "Invalid email format" }),
          { status: 400 }
        );
      }

      // Check if email is already taken by another user
      const existingClient = await prisma.client.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingClient && existingClient.id !== client.id) {
        return new Response(
          JSON.stringify({ error: "Email already in use" }),
          { status: 409 }
        );
      }
    }

    // Check if username is already taken by another user
    if (name && name !== client.name) {
      const existingClient = await prisma.client.findUnique({
        where: { name },
      });

      if (existingClient && existingClient.id !== client.id) {
        return new Response(
          JSON.stringify({ error: "Username already taken" }),
          { status: 409 }
        );
      }
    }

    // Update client
    const updatedClient = await prisma.client.update({
      where: { id: client.id },
      data: {
        ...(name && { name }),
        ...(email && { 
          email: email.toLowerCase(),
          emailVerified: email.toLowerCase() === client.email?.toLowerCase() ? client.emailVerified : false,
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
      },
    });

    return new Response(JSON.stringify({ 
      message: "Profile updated successfully",
      client: updatedClient,
    }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("PUT /api/client/profile error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update profile" }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
