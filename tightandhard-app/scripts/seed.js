/**
 * One-shot database seeder.
 * Creates categories, then seeds 12 starter personas.
 * Idempotent — safe to re-run.
 *
 * Usage:
 *   node scripts/seed.js
 */

const { PrismaClient } = require('@prisma/client');
const { PERSONAS } = require('./personas.js');

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
  // ---- Categories ----
  let catCreated = 0;
  let catSkipped = 0;
  for (const c of CATEGORIES) {
    const existing = await db.category.findFirst({ where: { name: c.name } });
    if (existing) {
      catSkipped += 1;
      continue;
    }
    await db.category.create({ data: c });
    catCreated += 1;
  }
  console.log(`Categories: ${catCreated} created, ${catSkipped} already existed`);

  // ---- Personas ----
  const categories = await db.category.findMany();
  const byName = {};
  categories.forEach((c) => {
    byName[c.name] = c.id;
  });

  const systemUserId = 'system_seed';
  const systemUserName = 'TightandHard';
  let personaCreated = 0;
  let personaSkipped = 0;

  for (const p of PERSONAS) {
    const existing = await db.companion.findFirst({ where: { name: p.name } });
    if (existing) {
      personaSkipped += 1;
      continue;
    }
    const categoryId = byName[p.category];
    if (!categoryId) {
      console.warn(`Category "${p.category}" not found for ${p.name} — skipped.`);
      continue;
    }
    await db.companion.create({
      data: {
        userId: systemUserId,
        userName: systemUserName,
        src: p.src,
        name: p.name,
        description: p.description,
        instructions: p.instructions,
        seed: p.seed,
        categoryId,
      },
    });
    personaCreated += 1;
  }
  console.log(`Personas: ${personaCreated} created, ${personaSkipped} already existed`);
}

main()
  .then(async () => {
    await db.$disconnect();
    console.log('Seed complete.');
  })
  .catch(async (err) => {
    console.error('Seed failed:', err);
    await db.$disconnect();
    process.exit(1);
  });
