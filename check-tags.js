const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTags() {
  try {
    const tags = await prisma.tag.findMany();
    console.log('Existing tags:', JSON.stringify(tags, null, 2));
    console.log(`Total tags: ${tags.length}`);
  } catch (error) {
    console.error('Error fetching tags:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTags();