const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

const CATEGORIES = [
  { name: 'Girl Next Door' },
  { name: 'Sassy & Bold' },
  { name: 'Sweet & Nurturing' },
  { name: 'Athletic & Active' },
  { name: 'Sultry & Mature' },
  { name: 'Playful & Flirty' },
  { name: 'Elegant & Sophisticated' },
  { name: 'Adventurous & Wild' },
  { name: 'Intellectual & Deep' },
  { name: 'Shy & Gentle' },
];

async function main() {
  try {
    // Upsert categories idempotently
    await db.category.createMany({ data: CATEGORIES });

    console.log(`Seeded ${CATEGORIES.length} categories.`);
    console.log('Tip: starter companion personas are defined in /scripts/personas.ts.');
    console.log('Run `node scripts/seed-personas.ts` after categories to load the 12 starter girlfriends.');
  } catch (error) {
    console.error('Error seeding default categories:', error);
  } finally {
    await db.$disconnect();
  }
}

main();
