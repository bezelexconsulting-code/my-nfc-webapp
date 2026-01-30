import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find client by verification token
    const client = await prisma.client.findUnique({
      where: { emailVerificationToken: token },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }

    // Check if token has expired (24 hours expiry)
    if (!client.emailVerificationExpiry || new Date() > client.emailVerificationExpiry) {
      // Clean up expired token
      await prisma.client.update({
        where: { id: client.id },
        data: {
          emailVerificationToken: null,
          emailVerificationExpiry: null,
        },
      });
      
      return NextResponse.json(
        { error: 'Verification token has expired. Please request a new verification email.' },
        { status: 400 }
      );
    }

    // Verify the email
    await prisma.client.update({
      where: { id: client.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    return NextResponse.json({
      message: 'Email verified successfully! You can now access all features.',
      verified: true,
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Resend verification email
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

    // Always return success message for security
    if (!client) {
      return NextResponse.json({
        message: 'If an account with that email exists, a verification email has been sent.',
      });
    }

    // If already verified, don't send another email
    if (client.emailVerified) {
      return NextResponse.json({
        message: 'This email is already verified.',
      });
    }

    // Generate new verification token
    const crypto = await import('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 86400000); // 24 hours from now

    // Save verification token to database
    await prisma.client.update({
      where: { id: client.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
      },
    });

    // Send verification email
    const currentUrl = new URL(request.url);
    let originFromRequest = `${currentUrl.protocol}//${currentUrl.host}`;
    
    if (originFromRequest.includes('0.0.0.0')) {
      originFromRequest = originFromRequest.replace('0.0.0.0', 'localhost');
    }
    
    const baseUrl = originFromRequest || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`;
    
    const { sendVerificationEmail } = await import('../../../../lib/email');
    await sendVerificationEmail(email, verificationLink);

    return NextResponse.json({
      message: 'If an account with that email exists, a verification email has been sent.',
    });
  } catch (error) {
    console.error('Resend verification email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
