import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

export const runtime = "nodejs";
const prisma = new PrismaClient();

export async function POST(req) {
  try {
    let { name, email, password } = await req.json();

    // Normalize inputs
    if (typeof name === "string") {
      name = name.trim();
    }
    if (typeof email === "string") {
      email = email.trim();
    }

    // Validation
    if (!name || !password) {
      return new Response(
        JSON.stringify({ error: "Name and password are required" }),
        { status: 400 }
      );
    }

    // Check if client already exists
    const existingClient = await prisma.client.findUnique({
      where: { name },
    });

    if (existingClient) {
      return new Response(
        JSON.stringify({ error: "Username already exists" }),
        { status: 409 }
      );
    }

    // Check email uniqueness if provided
    if (email) {
      const clientWithEmail = await prisma.client.findUnique({
        where: { email },
      });

      if (clientWithEmail) {
        return new Response(
          JSON.stringify({ error: "Email already in use" }),
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create new client
    const newClient = await prisma.client.create({
      data: {
        name,
        email: email || null, // Handle optional email
        password: hashedPassword,
      },
    });

    // Return success without exposing password
    const { password: _, ...clientData } = newClient;
    
    return new Response(
      JSON.stringify({
        message: "Registration successful",
        client: clientData,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to register" }),
      { status: 500 }
    );
  }
}
