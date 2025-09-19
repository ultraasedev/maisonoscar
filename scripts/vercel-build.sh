#!/bin/bash

echo "🔧 Build script pour Vercel avec Tailwind v4"

# Vérifier Node.js version
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Nettoyer les caches
echo "🧹 Nettoyage des caches..."
rm -rf .next
rm -rf node_modules/.cache

# Vérifier les variables d'environnement critiques
echo "🔍 Vérification des variables..."
if [ -z "$MONGODB_URI" ]; then
  echo "❌ MONGODB_URI manquante"
  exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
  echo "❌ NEXTAUTH_SECRET manquante"
  exit 1
fi

echo "✅ Variables OK"

# Générer Prisma
echo "🗄️ Génération Prisma..."
npx prisma generate

# Build Next.js avec variables d'environnement spécifiques à Vercel
echo "🏗️ Build Next.js..."
NODE_ENV=production \
SKIP_ENV_VALIDATION=true \
ANALYZE=false \
npm run build

echo "✅ Build terminé"