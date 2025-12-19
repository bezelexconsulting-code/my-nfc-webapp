import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../../../../lib/email';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find client by email
    const client = await prisma.client.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success message for security (don't reveal if email exists)
    if (!client) {
      return NextResponse.json({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await prisma.client.update({
      where: { id: client.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send password reset email
    // Prefer the current request origin (domain user is on), then env, then tags domain
    const currentUrl = new URL(request.url);
    let originFromRequest = `${currentUrl.protocol}//${currentUrl.host}`;
    
    // Replace 0.0.0.0 with localhost for local development (0.0.0.0 is not valid for browsers)
    if (originFromRequest.includes('0.0.0.0')) {
      originFromRequest = originFromRequest.replace('0.0.0.0', 'localhost');
    }
    
    const baseUrl = originFromRequest || process.env.NEXTAUTH_URL || 'https://tags.vinditscandit.co.za';
    const resetLink = `${baseUrl}/client/reset-password?token=${resetToken}`;
    
    // Validate resetLink is absolute URL starting with http
    if (!resetLink.startsWith('http')) {
      console.error('Invalid resetLink generated - not absolute URL:', resetLink);
      return NextResponse.json(
        { error: 'Internal server error - invalid reset link' },
        { status: 500 }
      );
    }
    
    try {
      await sendPasswordResetEmail(email, resetLink);
      console.log(`Password reset email sent to: ${email}`);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Continue execution - don't reveal email sending failure to user for security
    }

    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}