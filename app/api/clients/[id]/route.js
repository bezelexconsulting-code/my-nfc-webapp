import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Middleware to check for admin token
async function checkAdmin(req) {
  const adminToken = req.headers.get('x-admin-token');
  if (!adminToken) {
    return { error: 'Admin token required', status: 401 };
  }
  const admin = await prisma.admin.findUnique({
    where: { token: adminToken },
  });
  if (!admin) {
    return { error: 'Invalid admin token', status: 403 };
  }
  return { admin };
}

// Update a client (admin only)
export async function PUT(req, { params }) {
  try {
    const { error, status } = await checkAdmin(req);
    if (error) {
      return new Response(JSON.stringify({ error }), { status });
    }

    const { id } = await params;
    const clientId = parseInt(id);
    if (isNaN(clientId)) {
      return new Response(JSON.stringify({ error: 'Invalid client ID' }), {
        status: 400,
      });
    }

    const { name, email } = await req.json();

    if (!name && !email) {
      return new Response(
        JSON.stringify({ error: 'Name or email is required for update' }),
        { status: 400 }
      );
    }

    // If email is being changed, check if the new one is already taken
    if (email) {
      const existingClient = await prisma.client.findFirst({
        where: {
          email,
          id: { not: clientId },
        },
      });
      if (existingClient) {
        return new Response(
          JSON.stringify({ error: 'Email already in use by another client' }),
          { status: 409 }
        );
      }
    }

    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      },
    });

    const { password, ...clientData } = updatedClient;
    return new Response(JSON.stringify(clientData), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const { id } = await params;
    console.error(`PUT /api/clients/${id} error:`, error);
    if (error.code === 'P2025') {
      // Prisma error code for record not found
      return new Response(JSON.stringify({ error: 'Client not found' }), {
        status: 404,
      });
    }
    return new Response(
      JSON.stringify({ error: 'Failed to update client' }),
      { status: 500 }
    );
  }
}

// Delete a client (admin only)
export async function DELETE(req, { params }) {
  try {
    const { error, status } = await checkAdmin(req);
    if (error) {
      return new Response(JSON.stringify({ error }), { status });
    }

    const { id } = await params;
    const clientId = parseInt(id);
    if (isNaN(clientId)) {
      return new Response(JSON.stringify({ error: 'Invalid client ID' }), {
        status: 400,
      });
    }

    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id: clientId },
      include: { _count: { select: { tags: true } } },
    });

    if (!existingClient) {
      return new Response(JSON.stringify({ error: 'Client not found' }), {
        status: 404,
      });
    }

    // Check if client has tags
    if (existingClient._count.tags > 0) {
      return new Response(
        JSON.stringify({
          error: 'Cannot delete client. Client has ' + existingClient._count.tags + ' associated tags. Please delete or reassign the tags first.'
        }),
        { status: 400 }
      );
    }

    // Delete the client
    await prisma.client.delete({
      where: { id: clientId },
    });

    return new Response(JSON.stringify({ message: 'Client deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('DELETE /api/clients/[id] error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete client' }), {
      status: 500,
    });
  }
}
