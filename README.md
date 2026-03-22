# WhisperPay

Desktop-first Next.js web MVP for private crypto payments with personal paylinks.

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand
- Solana wallet adapter

## MagicBlock wiring in this MVP
- Default devnet RPC is routed via MagicBlock Router endpoint:
  - https://devnet-router.magicblock.app
- Public payment flow + private-note flow are separated in app architecture (ER-style + private layer).

## Run locally
1. npm install
2. npm run dev
3. Open http://localhost:3000

## Deploy (Vercel)
- Framework preset: Next.js
- Root Directory: ./
- Build command: npm run build
- Output directory: (leave empty)
