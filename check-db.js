const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('Checking current database state...');
    
    // Try to get all clients
    const clients = await prisma.client.findMany();
    console.log('Current clients:', clients);
    
    // Check if email column exists by trying to query it
    try {
      const clientsWithEmail = await prisma.client.findMany({
        select: { id: true, name: true, email: true }
      });
      console.log('Email column exists:', clientsWithEmail);
    } catch (error) {
      console.log('Email column does not exist:', error.message);
    }
    
  } catch (error) {
    console.error('Database check error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();