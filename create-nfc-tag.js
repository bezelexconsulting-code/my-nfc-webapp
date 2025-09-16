const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createNFCTag() {
  try {
    const newTag = await prisma.tag.create({
      data: {
        slug: 'tag-test-1',
        name: 'Test Tag for NFC',
        phone1: '123-456-7890',
        phone2: '',
        address: '123 Test Street',
        url: '',
        clientId: 1
      }
    });
    console.log('Created NFC-friendly tag:', newTag);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createNFCTag();