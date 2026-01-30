import { PrismaClient } from "@prisma/client";
import { compare, hash } from "bcryptjs";
import { getClientFromRequest } from "../../../../lib/auth";

const prisma = new PrismaClient();

export async function PUT(req) {
  try {
    const { error, status, client } = await getClientFromRequest(req);
    if (error) {
      return new Response(JSON.stringify({ error }), { status });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!newPassword) {
      return new Response(
        JSON.stringify({ error: "New password is required" }),
        { status: 400 }
      );
    }

    // Verify current password when account has one (email/password users); Google-only users can set password without current
    if (client.password) {
      if (!currentPassword) {
        return new Response(
          JSON.stringify({ error: "Current password is required" }),
          { status: 400 }
        );
      }
      const isCurrentPasswordValid = await compare(currentPassword, client.password);
      if (!isCurrentPasswordValid) {
        return new Response(
          JSON.stringify({ error: "Current password is incorrect" }),
          { status: 401 }
        );
      }
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return new Response(
        JSON.stringify({ error: "New password must be at least 8 characters long" }),
        { status: 400 }
      );
    }

    const passwordChecks = {
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[^A-Za-z0-9]/.test(newPassword),
    };

    if (!passwordChecks.uppercase || !passwordChecks.lowercase || !passwordChecks.number || !passwordChecks.special) {
      return new Response(
        JSON.stringify({ 
          error: "New password must include at least one uppercase letter, one lowercase letter, one number, and one special character" 
        }),
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 12);

    // Update password
    await prisma.client.update({
      where: { id: client.id },
      data: {
        password: hashedPassword,
      },
    });

    return new Response(JSON.stringify({ 
      message: "Password updated successfully",
    }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("PUT /api/client/password error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update password" }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
