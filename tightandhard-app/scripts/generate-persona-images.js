/**
 * Generate all 12 persona images via Replicate, upload to Cloudinary, update DB.
 * One-shot script — safe to re-run for personas without images.
 *
 *   node scripts/generate-persona-images.js              # generate missing
 *   node scripts/generate-persona-images.js --force      # regenerate all
 *   node scripts/generate-persona-images.js --name Luna  # single persona
 *
 * Reads Replicate + Cloudinary creds from .env.
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const Replicate = require('replicate');
const { v2: cloudinary } = require('cloudinary');
const { IMAGE_PROMPTS, COMMON_NEGATIVE } = require('./persona-image-prompts.js');

const db = new PrismaClient();
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// SDXL pinned for consistency
const SDXL = 'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc';

async function generateOne(name, prompt) {
  console.log(`  [${name}] calling Replicate SDXL...`);
  const output = await replicate.run(SDXL, {
    input: {
      prompt,
      negative_prompt: COMMON_NEGATIVE,
      width: 1024,
      height: 1024,
      num_inference_steps: 30,
      guidance_scale: 7.5,
      scheduler: 'K_EULER',
      num_outputs: 1,
    },
  });

  const replicateUrl = Array.isArray(output) ? output[0] : output;
  if (typeof replicateUrl !== 'string') {
    throw new Error(`Replicate returned unexpected output for ${name}: ${JSON.stringify(output)}`);
  }
  const urlStr = typeof replicateUrl === 'object' && replicateUrl?.url ? replicateUrl.url() : replicateUrl;
  const finalUrl = typeof urlStr === 'string' ? urlStr : String(urlStr);

  console.log(`  [${name}] uploading to Cloudinary...`);
  const uploadResult = await cloudinary.uploader.upload(finalUrl, {
    folder: 'tightandhard/personas',
    public_id: name.toLowerCase(),
    overwrite: true,
    resource_type: 'image',
    format: 'jpg',
    quality: 'auto',
    fetch_format: 'auto',
  });

  return uploadResult.secure_url;
}

function isPlaceholder(src) {
  return !src || src.includes('cloudinary.com/demo/') || src.includes('placeholders/');
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const nameIdx = args.indexOf('--name');
  const onlyName = nameIdx >= 0 ? args[nameIdx + 1] : null;

  const names = Object.keys(IMAGE_PROMPTS);
  const toProcess = onlyName ? names.filter((n) => n === onlyName) : names;

  if (toProcess.length === 0) {
    console.error(`No persona matched name "${onlyName}". Valid names:`, names.join(', '));
    process.exit(1);
  }

  console.log(`Generating images for ${toProcess.length} persona(s).`);
  console.log(`Replicate: SDXL, 1024x1024, ~15-25s each, ~$0.015 each.`);
  console.log();

  let done = 0;
  let skipped = 0;
  let failed = 0;

  for (const name of toProcess) {
    const companion = await db.companion.findFirst({ where: { name } });
    if (!companion) {
      console.log(`  [${name}] not in DB, skipping`);
      skipped += 1;
      continue;
    }
    if (!force && !isPlaceholder(companion.src)) {
      console.log(`  [${name}] already has an image, skipping (use --force to regenerate)`);
      skipped += 1;
      continue;
    }

    try {
      const url = await generateOne(name, IMAGE_PROMPTS[name]);
      await db.companion.update({
        where: { id: companion.id },
        data: { src: url },
      });
      console.log(`  [${name}] ✓ saved`);
      done += 1;
    } catch (err) {
      console.error(`  [${name}] FAILED:`, err.message);
      failed += 1;
    }
  }

  console.log();
  console.log(`Done. ${done} generated, ${skipped} skipped, ${failed} failed.`);
}

main()
  .then(async () => db.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await db.$disconnect();
    process.exit(1);
  });
