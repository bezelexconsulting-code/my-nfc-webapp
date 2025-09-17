import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Delete a client (admin only)
export async function DELETE(req, { params }) {
  try {
    // Check admin token
    const adminToken = req.headers.get('x-admin-token');
    if (!adminToken) {
      return new Response(JSON.stringify({ error: 'Admin token required' }), {
        status: 401,
      });
    }

    // Verify admin token
    const admin = await prisma.admin.findUnique({
      where: { token: adminToken },
    });

    if (!admin) {
      return new Response(JSON.stringify({ error: 'Invalid admin token' }), {
        status: 403,
      });
    }

    const clientId = parseInt(params.id);
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
