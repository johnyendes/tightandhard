/**
 * Bulk-upload everything in /girls-library to Cloudinary.
 * Flat structure: tightandhard/personas/<folder>/<filename>
 *
 *   node scripts/upload-girls-to-cloudinary.js                # upload all
 *   node scripts/upload-girls-to-cloudinary.js --persona ana  # only one folder
 *   node scripts/upload-girls-to-cloudinary.js --dry-run      # list what would upload
 *
 * Requires CLOUDINARY_* env vars set.
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const GIRLS_ROOT = path.join(__dirname, '..', '..', 'girls-library');

function walkImages(dir, relativeFolder = '') {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    const rel = relativeFolder ? `${relativeFolder}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      results.push(...walkImages(abs, rel));
    } else if (/\.(jpg|jpeg|png|webp)$/i.test(entry.name)) {
      results.push({ abs, rel });
    }
  }
  return results;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const personaIdx = args.indexOf('--persona');
  const onlyPersona = personaIdx >= 0 ? args[personaIdx + 1] : null;

  if (!process.env.CLOUDINARY_API_KEY) {
    console.error('CLOUDINARY_API_KEY not set — check .env');
    process.exit(1);
  }

  const rootExists = fs.existsSync(GIRLS_ROOT);
  if (!rootExists) {
    console.error(`girls-library not found at ${GIRLS_ROOT}`);
    process.exit(1);
  }

  const all = walkImages(GIRLS_ROOT);
  const filtered = onlyPersona
    ? all.filter((f) => f.rel.startsWith(`${onlyPersona}/`) || (!f.rel.includes('/') && onlyPersona === '_loose'))
    : all;

  console.log(`Found ${filtered.length} images${onlyPersona ? ` in ${onlyPersona}` : ''}`);
  if (dryRun) {
    filtered.slice(0, 20).forEach((f) => console.log(`  ${f.rel}`));
    if (filtered.length > 20) console.log(`  ... and ${filtered.length - 20} more`);
    return;
  }

  let uploaded = 0;
  let failed = 0;
  for (const f of filtered) {
    const publicId = f.rel.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    try {
      await cloudinary.uploader.upload(f.abs, {
        folder: 'tightandhard/personas',
        public_id: publicId,
        overwrite: true,
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
      });
      uploaded += 1;
      process.stdout.write(`\r  ${uploaded}/${filtered.length} uploaded`);
    } catch (err) {
      failed += 1;
      console.error(`\n  FAILED ${f.rel}:`, err.message);
    }
  }
  console.log(`\n\nDone. ${uploaded} uploaded, ${failed} failed.`);
  console.log(`URLs will be: https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/q_auto,f_auto/tightandhard/personas/<folder>/<filename>`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
