# WhisperPay

Desktop-first web MVP for private crypto payments through personal paylinks.

## Overview

WhisperPay lets users create a personal paylink, receive real SOL transfers, and attach a private note with permission-based reveal.

The product is designed around a split payment architecture:
- a fast public lane for paylink metadata, payment intents, sender/receiver identifiers, timestamps, statuses, and transaction signatures
- a separate confidential lane for private notes and reveal permissions linked by `paymentId`

## What works today

- Solana wallet connection
- Real SOL payment flow
- Personal paylink creation
- Demo mode and live mode
- Inbox / payment history
- Permission-based private note reveal
- Multi-language UI
- MagicBlock Router-aware transaction flow

## MagicBlock integration

This MVP integrates MagicBlock Router in the payment flow.

- Default devnet RPC is routed through the MagicBlock Router endpoint
- Before sending a payment transaction, the app uses MagicBlock Router blockhash routing via `getBlockhashForAccounts`
- A standard Solana fallback is kept for demo reliability

This makes the payment flow MagicBlock-aware while keeping the UX stable for a hackathon MVP.

## Why it matters

Public crypto payments often expose too much context by default.

WhisperPay explores a better UX:
- the payment flow stays simple and fast
- sensitive note content is handled separately from public payment metadata
- recipients reveal private details only with permission

## Core flow

1. Connect a Solana wallet
2. Create a personal paylink
3. Share the link
4. Sender opens the paylink
5. Sender sends a real SOL payment
6. Sender can attach a private note
7. Recipient sees the payment in inbox
8. Recipient reveals the private note if authorized

## Demo

Live app: https://whisper-pay-teal.vercel.app


## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand
- Solana Wallet Adapter
- Solana Web3.js
- MagicBlock Router RPC integration

## Run locally

```bash
npm install
npm run dev
