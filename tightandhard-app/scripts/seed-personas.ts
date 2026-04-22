/**
 * Seed the 12 starter personas into the database.
 * Run after `node scripts/seed.ts` (which creates the categories they reference).
 *
 *   node scripts/seed-personas.ts
 *
 * Idempotent: checks for existing persona by name before creating.
 */

const { PrismaClient } = require('@prisma/client');
const { PERSONAS } = require('./personas');

const db = new PrismaClient();

async function main() {
  const systemUserId = 'system_seed';
  const systemUserName = 'TightandHard';

  const categories = await db.category.findMany();
  const byName: Record<string, string> = {};
  categories.forEach((c: { name: string; id: string }) => {
    byName[c.name] = c.id;
  });

  let created = 0;
  let skipped = 0;

  for (const p of PERSONAS) {
    const existing = await db.companion.findFirst({ where: { name: p.name } });
    if (existing) {
      skipped++;
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
    created++;
  }

  console.log(`Personas: ${created} created, ${skipped} skipped (already existed).`);
  await db.$disconnect();
}

main().catch((err) => {
  console.error('seed-personas failed:', err);
  process.exit(1);
});
