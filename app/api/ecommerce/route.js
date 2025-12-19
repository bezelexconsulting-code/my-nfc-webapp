import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// API endpoint for e-commerce integration
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      action, 
      productId, 
      productName, 
      productUrl, 
      customerEmail, 
      customerName,
      apiKey 
    } = body;

    // Verify API key (you should set this in environment variables)
    const validApiKey = process.env.ECOMMERCE_API_KEY || 'your-secure-api-key-here';
    if (apiKey !== validApiKey) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    switch (action) {
      case 'create_product_tag':
        return await createProductTag(productId, productName, productUrl, customerEmail, customerName);
      
      case 'get_product_tags':
        return await getProductTags(productId);
      
      case 'create_customer_account':
        return await createCustomerAccount(customerEmail, customerName);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('E-commerce API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function createProductTag(productId, productName, productUrl, customerEmail, customerName) {
  try {
    // Check if customer exists, create if not
    let client = await prisma.client.findUnique({
      where: { email: customerEmail }
    });

    if (!client) {
      // Create new client account
      client = await prisma.client.create({
        data: {
          email: customerEmail,
          name: customerName,
          password: 'temp-password-' + Date.now(), // They'll need to reset this
          isVerified: false
        }
      });
    }

    // Create unique slug for the product
    const slug = `product-${productId}-${Date.now()}`;

    // Create the NFC tag
    const tag = await prisma.tag.create({
      data: {
        slug: slug,
        title: `Smart Tag: ${productName}`,
        description: `NFC tag for ${productName}`,
        targetUrl: productUrl,
        clientId: client.id,
        isActive: true,
        // Store product-specific data
        customData: JSON.stringify({
          productId: productId,
          productName: productName,
          createdVia: 'ecommerce-integration',
          createdAt: new Date().toISOString()
        })
      }
    });

    // Generate the NFC tag URL
    const tagUrl = `${process.env.NEXTAUTH_URL || 'https://tags.vinditscandit.co.za'}/public-tag/${slug}`;

    return NextResponse.json({
      success: true,
      tag: {
        id: tag.id,
        slug: tag.slug,
        title: tag.title,
        url: tagUrl,
        targetUrl: tag.targetUrl
      },
      customer: {
        id: client.id,
        email: client.email,
        name: client.name
      },
      instructions: {
        nfcUrl: tagUrl,
        adminUrl: `${process.env.NEXTAUTH_URL || 'https://tags.vinditscandit.co.za'}/admin`,
        customerDashboard: `${process.env.NEXTAUTH_URL || 'https://tags.vinditscandit.co.za'}/client/dashboard`
      }
    });

  } catch (error) {
    console.error('Error creating product tag:', error);
    throw error;
  }
}

async function getProductTags(productId) {
  try {
    const tags = await prisma.tag.findMany({
      where: {
        customData: {
          contains: `"productId":"${productId}"`
        }
      },
      include: {
        client: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      tags: tags.map(tag => ({
        id: tag.id,
        slug: tag.slug,
        title: tag.title,
        url: `${process.env.NEXTAUTH_URL || 'https://tags.vinditscandit.co.za'}/public-tag/${tag.slug}`,
        targetUrl: tag.targetUrl,
        isActive: tag.isActive,
        createdAt: tag.createdAt,
        customer: tag.client
      }))
    });

  } catch (error) {
    console.error('Error getting product tags:', error);
    throw error;
  }
}

async function createCustomerAccount(customerEmail, customerName) {
  try {
    // Check if customer already exists
    const existingClient = await prisma.client.findUnique({
      where: { email: customerEmail }
    });

    if (existingClient) {
      return NextResponse.json({
        success: true,
        customer: {
          id: existingClient.id,
          email: existingClient.email,
          name: existingClient.name,
          exists: true
        },
        loginUrl: `${process.env.NEXTAUTH_URL || 'https://tags.vinditscandit.co.za'}/client/dashboard`
      });
    }

    // Create new customer account
    const client = await prisma.client.create({
      data: {
        email: customerEmail,
        name: customerName,
        password: 'temp-password-' + Date.now(), // They'll need to reset this
        isVerified: false
      }
    });

    return NextResponse.json({
      success: true,
      customer: {
        id: client.id,
        email: client.email,
        name: client.name,
        exists: false
      },
      instructions: {
        loginUrl: `${process.env.NEXTAUTH_URL || 'https://tags.vinditscandit.co.za'}/client/dashboard`,
        resetPasswordUrl: `${process.env.NEXTAUTH_URL || 'https://tags.vinditscandit.co.za'}/client/forgot-password`,
        message: 'Account created. Customer should reset password before first login.'
      }
    });

  } catch (error) {
    console.error('Error creating customer account:', error);
    throw error;
  }
}

// GET endpoint for checking API status
export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'NFC Tag Manager E-commerce API',
    version: '1.0.0',
    endpoints: {
      'POST /api/ecommerce': {
        actions: [
          'create_product_tag',
          'get_product_tags', 
          'create_customer_account'
        ],
        authentication: 'API Key required'
      }
    },
    documentation: 'See ecommerce-integration-kit.html for integration guide'
  });
}