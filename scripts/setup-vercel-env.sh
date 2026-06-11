#!/usr/bin/env bash
# ÉLI — Injection des variables d'environnement Production sur Vercel.
# Prérequis : npm i -g vercel && vercel login && vercel link
# Les secrets ne vivent QUE dans Vercel (chiffrés), jamais dans le code.
set -e
add() { printf '%s' "$2" | vercel env add "$1" production; }
add NEXT_PUBLIC_DATA_MODE       "live"
add NEXT_PUBLIC_SUPABASE_URL    "https://wbmeqhaopfdsqscalhga.supabase.co"
add NEXT_PUBLIC_SUPABASE_ANON_KEY "$SUPABASE_ANON"
add SUPABASE_SERVICE_ROLE_KEY   "$SUPABASE_SERVICE"
add PAYMENT_ENV                 "sandbox"
add PAYMENT_WEBHOOK_SECRET      "$WEBHOOK_SECRET"
add GEMINI_API_KEY              "$GEMINI_KEY"
add UPSTASH_REDIS_REST_URL      "$UPSTASH_URL"
add UPSTASH_REDIS_REST_TOKEN    "$UPSTASH_TOKEN"
add RESEND_API_KEY              "$RESEND_KEY"
echo "✔ Variables Production injectées sur Vercel."
