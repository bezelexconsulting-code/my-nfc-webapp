import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../../../../lib/email';

const prisma = new PrismaClient();

// Temporary debug endpoint: send a reset email and echo the link used
export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { email: email.toLowerCase() } });

    // For security, behave like the regular endpoint even if the account does not exist
    if (!client) {
      return NextResponse.json({
        message: 'If an account with that email exists, a password reset link has been sent.',
        note: 'Debug endpoint: account not found, no email sent.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.client.update({
      where: { id: client.id },
      data: { resetToken, resetTokenExpiry },
    });

    const currentUrl = new URL(request.url);
    let originFromRequest = `${currentUrl.protocol}//${currentUrl.host}`;
    
    // Replace 0.0.0.0 with localhost for local development (0.0.0.0 is not valid for browsers)
    if (originFromRequest.includes('0.0.0.0')) {
      originFromRequest = originFromRequest.replace('0.0.0.0', 'localhost');
    }
    
    const baseUrl = originFromRequest || process.env.NEXTAUTH_URL || 'https://tags.vinditscandit.co.za';
    const resetLink = `${baseUrl}/client/reset-password?token=${resetToken}`;

    // Attempt send; swallow errors from mailer but expose link for debugging
    try {
      await sendPasswordResetEmail(email, resetLink);
    } catch (emailError) {
      console.error('Debug: failed to send password reset email:', emailError);
    }

    return NextResponse.json({
      message: 'Debug reset email attempted. Check your inbox.',
      baseUrl,
      resetLink,
      sentTo: email,
    });
  } catch (error) {
    console.error('Debug send-reset-email error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request) {
  const currentUrl = new URL(request.url);
  const originFromRequest = `${currentUrl.protocol}//${currentUrl.host}`;
  return NextResponse.json({
    status: 'ok',
    info: 'POST { email } to send reset email and echo link',
    originDetected: originFromRequest,
  });
}