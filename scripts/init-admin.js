const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  try {
    // Create admin user
    const hashedPassword = await hash("admin123", 10);
    const admin = await prisma.admin.create({
      data: {
        username: "admin",
        password: hashedPassword,
        token: "admin-token-123", // Simple token for testing
      },
    });

    console.log("Admin user created:", admin);
    console.log("\nUse this token in the admin interface: admin-token-123");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();