# TightandHard Character Generator

Consistent photorealistic AI model generator for advertising campaigns. Second product in the TightandHard stack. Licensable to brands, agencies, and indie marketers for use as their in-house AI models.

## What it does

- Build a character profile (name, bio, visual direction, photography settings)
- Generate images on demand — the same character across thousands of poses, outfits, and scenes
- Seed locking + face swap + LoRA training keep the face **consistent** (this is the product moat)
- Campaign management for grouping characters by brand/client
- Licensing tiers: personal, commercial, exclusive

## Stack

- Next.js 14 App Router + TypeScript + Tailwind
- Clerk auth (shared account with the companion app)
- MongoDB Atlas (separate database from the companion app)
- Prisma ORM
- **Replicate** for image generation (SDXL, FLUX, LoRA, face swap, upscale)
- **Cloudinary** for image hosting and CDN
- Stripe subscriptions + per-image billing
- OpenAI for prompt optimization + bio generation

## Running locally

Copy `.env.local.example` to `.env` and fill in keys. Then:

```bash
yarn install
npx prisma generate
npx prisma db push
yarn dev
```

App runs at http://localhost:3001 (companion app runs on :3000).

## Architecture

```
character-generator/
├── prisma/schema.prisma      Campaign, Character, GeneratedImage, License, UserSubscription
├── src/
│   ├── lib/
│   │   ├── replicate.ts      SDXL / FLUX / face-swap / upscale
│   │   ├── prompt-builder.ts Structured prompt assembly
│   │   └── ...
│   ├── app/
│   │   ├── api/              REST endpoints
│   │   └── character-gen/    UI pages
│   └── components/
└── package.json              Port 3001
```

## Key concepts

### Consistency via seed locking
Every character has a `baseSeed`. All images for that character reuse this seed (plus small variations) so SDXL produces the same face reliably.

### LoRA training (later)
For true consistency (same face, totally different pose/outfit/setting), train a LoRA on 15-30 initial images of the character. Replicate handles training at ~$0.002/sec. Then every generation applies the LoRA via `lora_url` parameter.

### Face swap fallback
If a generation drifts off-face, the optional face-swap stage pastes the master face onto the new body pose. Fast, cheap, less identity-preserving than LoRA.

### Negative prompts
Shared baseline negative prompt blocks the usual SDXL artifacts (extra fingers, plastic skin, text, watermarks, cartoon style).

## Pricing tiers (proposed)

| Tier | Monthly | Images/mo | Characters | Commercial use |
|---|---|---|---|---|
| Free | $0 | 10 | 1 | No (watermarked) |
| Starter | $19 | 100 | 3 | Yes |
| Pro | $49 | 500 | 10 | Yes |
| Studio | $149 | 2000 | 25 | Yes, redistribution OK |
| Enterprise | Contact | Unlimited | Unlimited | Full rights |

## License (code)

Source code: proprietary. Generated images: licensed to customer per tier.
