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
      email = email.trim().toLowerCase();
    }

    // Validation - Email is now required
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email address is required" }),
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Please enter a valid email address" }),
        { status: 400 }
      );
    }

    // Password validation
    if (!password) {
      return new Response(
        JSON.stringify({ error: "Password is required" }),
        { status: 400 }
      );
    }

    // Password strength validation
    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 8 characters long" }),
        { status: 400 }
      );
    }

    const passwordChecks = {
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    if (!passwordChecks.uppercase || !passwordChecks.lowercase || !passwordChecks.number || !passwordChecks.special) {
      return new Response(
        JSON.stringify({ 
          error: "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character" 
        }),
        { status: 400 }
      );
    }

    // Check if email already exists
    const clientWithEmail = await prisma.client.findUnique({
      where: { email },
    });

    if (clientWithEmail) {
      return new Response(
        JSON.stringify({ error: "An account with this email already exists" }),
        { status: 409 }
      );
    }

    // Generate username from name or email if name not provided
    const username = name || email.split("@")[0];

    // Check if username already exists (if name was provided)
    if (name) {
      const existingClient = await prisma.client.findUnique({
        where: { name: username },
      });

      if (existingClient) {
        return new Response(
          JSON.stringify({ error: "This username is already taken. Please choose another or leave it blank to use your email username." }),
          { status: 409 }
        );
      }
    }

    // Hash password with higher rounds for better security
    const hashedPassword = await hash(password, 12);

    // Generate email verification token
    const crypto = await import('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 86400000); // 24 hours from now

    // Create new client
    const newClient = await prisma.client.create({
      data: {
        name: username,
        email: email,
        password: hashedPassword,
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
        emailVerified: false,
      },
    });

    // Send verification email
    try {
      const currentUrl = new URL(req.url);
      let originFromRequest = `${currentUrl.protocol}//${currentUrl.host}`;
      
      if (originFromRequest.includes('0.0.0.0')) {
        originFromRequest = originFromRequest.replace('0.0.0.0', 'localhost');
      }
      
      const baseUrl = originFromRequest || process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`;
      
      const { sendVerificationEmail } = await import('../../../lib/email');
      await sendVerificationEmail(email, verificationLink);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue execution - don't fail registration if email fails
    }

    // Return success without exposing password
    const { password: _, ...clientData } = newClient;
    
    return new Response(
      JSON.stringify({
        message: "Registration successful! Please check your email to verify your account.",
        client: clientData,
        requiresVerification: true,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    
    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0];
      if (field === "email") {
        return new Response(
          JSON.stringify({ error: "An account with this email already exists" }),
          { status: 409 }
        );
      }
      if (field === "name") {
        return new Response(
          JSON.stringify({ error: "This username is already taken" }),
          { status: 409 }
        );
      }
    }
    
    return new Response(
      JSON.stringify({ error: "Failed to register. Please try again." }),
      { status: 500 }
    );
  }
}
