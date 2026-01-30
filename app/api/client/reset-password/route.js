import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Password strength validation (same as registration)
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
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
      return NextResponse.json(
        { 
          error: 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character' 
        },
        { status: 400 }
      );
    }

    // Find client by reset token
    const client = await prisma.client.findUnique({
      where: { resetToken: token },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token has expired (1 hour expiry)
    if (!client.resetTokenExpiry || new Date() > client.resetTokenExpiry) {
      // Clean up expired token
      await prisma.client.update({
        where: { id: client.id },
        data: {
          resetToken: null,
          resetTokenExpiry: null,
        },
      });
      
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new password reset.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await hash(password, 12);

    // Update client password and clear reset token
    await prisma.client.update({
      where: { id: client.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}