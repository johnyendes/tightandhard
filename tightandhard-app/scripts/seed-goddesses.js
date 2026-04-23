/**
 * Seed/update the three goddess-tier personas.
 * Creates new Companion records OR updates existing by name.
 * Idempotent — safe to re-run.
 *
 * Intended to run AFTER girls-library is uploaded to Cloudinary
 * (this script will substitute Cloudinary base URL automatically
 * via the CLOUDINARY_PERSONA_BASE env var).
 *
 * Usage:
 *   node scripts/seed-goddesses.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { GODDESS_PERSONAS } = require('./goddess-personas.js');

const db = new PrismaClient();

const CLOUDINARY_CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUD_BASE = CLOUDINARY_CLOUD
  ? `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/q_auto,f_auto/tightandhard/personas/`
  : null;

function resolveImage(relativePath) {
  if (CLOUD_BASE) return CLOUD_BASE + relativePath;
  // Fallback to a placeholder if Cloudinary isn't ready yet.
  return 'https://res.cloudinary.com/demo/image/upload/v1/placeholders/female_portrait.jpg';
}

async function ensureCategory(name) {
  const existing = await db.category.findFirst({ where: { name } });
  if (existing) return existing;
  return db.category.create({ data: { name } });
}

async function main() {
  const systemUserId = 'system_seed';
  const systemUserName = 'TightandHard';

  let created = 0;
  let updated = 0;

  for (const p of GODDESS_PERSONAS) {
    const category = await ensureCategory(p.category);
    const existing = await db.companion.findFirst({ where: { name: p.name } });

    const data = {
      userId: systemUserId,
      userName: systemUserName,
      src: resolveImage(p.heroImage),
      name: p.name,
      description: p.description,
      instructions: p.instructions,
      seed: p.seed,
      categoryId: category.id,
    };

    if (existing) {
      await db.companion.update({ where: { id: existing.id }, data });
      updated += 1;
      console.log(`Updated: ${p.name}`);
    } else {
      await db.companion.create({ data });
      created += 1;
      console.log(`Created: ${p.name}`);
    }
  }

  console.log(`\nDone — ${created} created, ${updated} updated.`);
  if (!CLOUD_BASE) {
    console.log(
      '\nNOTE: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME not in env — personas point at placeholder. Run bulk upload then re-seed to fix.',
    );
  }
}

main()
  .then(async () => db.$disconnect())
  .catch(async (err) => {
    console.error('Seed goddesses failed:', err);
    await db.$disconnect();
    process.exit(1);
  });
