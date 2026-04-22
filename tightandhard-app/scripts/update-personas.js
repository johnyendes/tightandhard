/**
 * Update existing seeded companions with the latest persona content.
 * Safe to re-run — updates by name match, only touches core content fields.
 */

const { PrismaClient } = require('@prisma/client');
const { PERSONAS } = require('./personas.js');

const db = new PrismaClient();

async function main() {
  let updated = 0;
  for (const p of PERSONAS) {
    const existing = await db.companion.findFirst({ where: { name: p.name } });
    if (!existing) {
      console.log(`Skipping ${p.name} — not found in DB`);
      continue;
    }
    await db.companion.update({
      where: { id: existing.id },
      data: {
        description: p.description,
        instructions: p.instructions,
        seed: p.seed,
      },
    });
    updated += 1;
  }
  console.log(`Updated ${updated} personas with new erotic content.`);
}

main()
  .then(async () => db.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await db.$disconnect();
    process.exit(1);
  });
