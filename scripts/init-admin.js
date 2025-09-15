const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  try {
    // Create admin user
    const hashedPassword = await hash("secure_password_2024", 10);
    const admin = await prisma.admin.create({
      data: {
        username: "administrator",
        password: hashedPassword,
        token: "admin-secure-token-2024", // More secure token
      },
    });

    console.log("Admin user created:", admin);
    console.log("\nUse this token in the admin interface: admin-secure-token-2024");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();