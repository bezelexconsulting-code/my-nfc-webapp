import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Middleware to check for admin token
async function checkAdmin(req) {
  const adminToken = req.headers.get("x-admin-token");
  if (!adminToken) {
    return { error: "Admin token required", status: 401 };
  }
  const admin = await prisma.admin.findUnique({
    where: { token: adminToken },
  });
  if (!admin) {
    return { error: "Invalid admin token", status: 403 };
  }
  return { admin };
}

// UPDATE a client
export async function PUT(req, { params }) {
  try {
    const { error, status } = await checkAdmin(req);
    if (error) {
      return new Response(JSON.stringify({ error }), { status });
    }

    const { id } = params;
    const { name, email } = await req.json();

    if (!name && !email) {
      return new Response(
        JSON.stringify({ error: "Name or email is required for update" }),
        { status: 400 }
      );
    }

    // If email is being changed, check if the new one is already taken
    if (email) {
      const existingClient = await prisma.client.findFirst({
        where: {
          email,
          id: { not: parseInt(id) },
        },
      });
      if (existingClient) {
        return new Response(
          JSON.stringify({ error: "Email already in use by another client" }),
          { status: 409 }
        );
      }
    }

    const updatedClient = await prisma.client.update({
      where: { id: parseInt(id) },
      data: {
        name: name,
        email: email,
      },
    });

    const { password, ...clientData } = updatedClient;
    return new Response(JSON.stringify(clientData), { status: 200 });
  } catch (error) {
    console.error(`PUT /api/clients/${params.id} error:`, error);
    if (error.code === "P2025") {
      // Prisma error code for record not found
      return new Response(JSON.stringify({ error: "Client not found" }), {
        status: 404,
      });
    }
    return new Response(
      JSON.stringify({ error: "Failed to update client" }),
      { status: 500 }
    );
  }
}

// DELETE a client
export async function DELETE(req, { params }) {
  try {
    const { error, status } = await checkAdmin(req);
    if (error) {
      return new Response(JSON.stringify({ error }), { status });
    }

    const { id } = params;

    // Prisma will handle cascading deletes if configured in the schema.
    await prisma.client.delete({
      where: { id: parseInt(id) },
    });

    return new Response(null, { status: 204 }); // No Content
  } catch (error) {
    console.error(`DELETE /api/clients/${params.id} error:`, error);
    if (error.code === "P2025") {
      // Prisma error code for record not found
      return new Response(JSON.stringify({ error: "Client not found" }), {
        status: 404,
      });
    }
    // Foreign key constraint failed
    if (error.code === "P2003") {
      return new Response(
        JSON.stringify({
          error:
            "Cannot delete client. They still have tags assigned to them. Please reassign or delete the tags first.",
        }),
        { status: 409 }
      );
    }
    return new Response(
      JSON.stringify({ error: "Failed to delete client" }),
      { status: 500 }
    );
  }
}