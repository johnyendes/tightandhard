# TightandHard

Private monorepo for the TightandHard product line.

## Apps

- **[`tightandhard-app/`](./tightandhard-app/)** — 18+ AI companion chat SaaS (Next.js, port 3000)
- **[`character-generator/`](./character-generator/)** — Consistent photorealistic AI model generator for advertising campaigns (Next.js, port 3001)

## Stack

- Next.js 14 App Router + TypeScript + Tailwind
- Clerk auth (shared account across both apps)
- MongoDB Atlas (separate databases per app)
- Prisma ORM
- OpenAI (chat + memory extraction)
- Replicate (image generation + LoRA training)
- Pinecone (vector memory)
- Upstash Redis (rate limiting + chat history)
- ElevenLabs (voice synthesis)
- Cloudinary (image hosting)
- Stripe (subscription billing)

## Running locally

Each app runs independently. See their individual READMEs for setup.

```bash
# Companion app
cd tightandhard-app
npm install
npm run db:push
npm run db:seed
npm run dev                  # http://localhost:3000

# Character generator (separate terminal)
cd character-generator
npm install
npm run db:push
npm run dev                  # http://localhost:3001
```

## Secrets

All credentials live in `keys.txt` (gitignored) and are mirrored into each app's `.env` file (also gitignored). Never commit either.

## License

© 2026 John Yendes. Proprietary. All rights reserved.
