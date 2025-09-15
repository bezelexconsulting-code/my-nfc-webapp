import { PrismaClient } from "@prisma/client";
import { compare } from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    // Validate input
    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: "Username and password are required" }),
        { status: 400 }
      );
    }

    // Find admin by username
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      return new Response(
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 401 }
      );
    }

    // Verify password
    const passwordValid = await compare(password, admin.password);
    if (!passwordValid) {
      return new Response(
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 401 }
      );
    }

    // Return admin data (excluding password)
    const { password: _, ...adminData } = admin;
    
    return new Response(
      JSON.stringify({
        success: true,
        admin: adminData,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("POST /api/admin/login error:", error);
    return new Response(
      JSON.stringify({ error: "Login failed" }),
      { status: 500 }
    );
  }
}