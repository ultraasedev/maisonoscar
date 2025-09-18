#!/bin/bash

# =============================================================================
# SCRIPT DE CONFIGURATION VERCEL - MAISON OSCAR
# =============================================================================
# Ce script configure automatiquement toutes les variables d'environnement
# nécessaires pour la production sur Vercel avec le domaine maisonoscar.fr
# =============================================================================

echo "🚀 Configuration Vercel pour maisonoscar.fr"
echo "============================================"

# Vérifier que Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé. Installation..."
    npm install -g vercel
fi

# Login Vercel
echo "🔐 Connexion à Vercel..."
vercel login

# Variables critiques (OBLIGATOIRES)
echo "⚡ Configuration des variables critiques..."

# Database
vercel env add MONGODB_URI production --value="mongodb+srv://gfranckrelouconduite:CQrNbTvzkQIHvn5l@maisonoscarcluster.my5fced.mongodb.net/MAISONOSCAR?retryWrites=true&w=majority&appName=maisonoscarcluster"
vercel env add MONGODB_DB production --value="MAISONOSCAR"

# NextAuth
vercel env add NEXTAUTH_URL production --value="https://maisonoscar.fr"
vercel env add NEXTAUTH_SECRET production --value="MaisonOscar2025ProdSecret_8kF9mQ3wE7rT2nL5pY6uI9oX1cV4bN"

# Site URLs
vercel env add NEXT_PUBLIC_SITE_URL production --value="https://maisonoscar.fr"
vercel env add SITE_URL production --value="https://maisonoscar.fr"

# Security Keys
vercel env add ENCRYPTION_KEY production --value="2a9f4b8c7e1d3f6a9b2e5c8d1a4f7b9e2c5f8a1d4b7e9c2f5a8b1e4c7f9a2d5"
vercel env add JWT_SECRET production --value="8f3e9a1c6d2b7e4f9a3c6e1d4b7f9e2a5c8f1d4b7e9a2c5f8e1d4b7f9a3c6e1"

# Contact & Admin
vercel env add ADMIN_EMAIL production --value="contact@maisonoscar.fr"
vercel env add CONTACT_EMAIL production --value="contact@maisonoscar.fr"

# SMTP Email
vercel env add SMTP_HOST production --value="smtp.hostinger.com"
vercel env add SMTP_PORT production --value="587"
vercel env add SMTP_USER production --value="contact@maisonoscar.fr"
vercel env add SMTP_PASSWORD production --value="MaisonOscar25"
vercel env add SMTP_FROM_EMAIL production --value="contact@maisonoscar.fr"
vercel env add SMTP_FROM_NAME production --value="Maison Oscar"

echo "✅ Variables critiques configurées"

# Variables de configuration
echo "⚙️ Configuration des paramètres système..."

vercel env add USE_LOCAL_DB production --value="false"
vercel env add MAINTENANCE_MODE production --value="false"
vercel env add DEBUG_LOGS production --value="false"
vercel env add NODE_ENV production --value="production"
vercel env add CACHE_DURATION production --value="7200"

# CORS
vercel env add ALLOWED_ORIGINS production --value="https://maisonoscar.fr,https://www.maisonoscar.fr"

# Webhooks
vercel env add WEBHOOK_SECRET production --value="MaisonOscar_WebhookSecret_2025_K8mN4pQ7wR3tY6u"
vercel env add WEBHOOK_RESERVATION_URL production --value="https://maisonoscar.fr/api/webhooks/reservation"
vercel env add WEBHOOK_PAYMENT_URL production --value="https://maisonoscar.fr/api/webhooks/payment"

# File uploads
vercel env add UPLOAD_PATH production --value="/tmp/uploads"
vercel env add MAX_FILE_SIZE production --value="10"

# External APIs
vercel env add NEXT_PUBLIC_GOOGLE_PLACES_API_KEY production --value="AIzaSyBvOkBwb09O6Z1XUTC4tZ9kQwXhK8M5LgU"

# SMS
vercel env add SMS_SENDER_NAME production --value="MaisonOscar"

echo "✅ Configuration système terminée"

# Variables optionnelles (peuvent être configurées plus tard)
echo "⚠️  Variables à configurer manuellement dans le dashboard Vercel:"
echo "   - STRIPE_PUBLIC_KEY (clé publique Stripe production)"
echo "   - STRIPE_SECRET_KEY (clé secrète Stripe production)"
echo "   - STRIPE_WEBHOOK_SECRET (secret webhook Stripe)"
echo "   - CLOUDINARY_CLOUD_NAME (nom cloud Cloudinary)"
echo "   - CLOUDINARY_API_KEY (clé API Cloudinary)"
echo "   - CLOUDINARY_API_SECRET (secret API Cloudinary)"
echo "   - TWILIO_ACCOUNT_SID (SID compte Twilio)"
echo "   - TWILIO_AUTH_TOKEN (token auth Twilio)"
echo "   - NEXT_PUBLIC_GA_ID (ID Google Analytics)"
echo "   - SENTRY_DSN (URL Sentry pour monitoring)"

echo ""
echo "🎯 Variables également disponibles pour Preview et Development:"

# Ajouter les variables critiques pour preview et development
vercel env add MONGODB_URI preview development --value="mongodb+srv://gfranckrelouconduite:CQrNbTvzkQIHvn5l@maisonoscarcluster.my5fced.mongodb.net/MAISONOSCAR?retryWrites=true&w=majority&appName=maisonoscarcluster"
vercel env add NEXTAUTH_SECRET preview development --value="MaisonOscar2025ProdSecret_8kF9mQ3wE7rT2nL5pY6uI9oX1cV4bN"
vercel env add ENCRYPTION_KEY preview development --value="2a9f4b8c7e1d3f6a9b2e5c8d1a4f7b9e2c5f8a1d4b7e9c2f5a8b1e4c7f9a2d5"
vercel env add JWT_SECRET preview development --value="8f3e9a1c6d2b7e4f9a3c6e1d4b7f9e2a5c8f1d4b7e9a2c5f8e1d4b7f9a3c6e1"

# URLs pour preview et development
vercel env add NEXTAUTH_URL preview --value="https://preview.maisonoscar.fr"
vercel env add NEXTAUTH_URL development --value="http://localhost:3000"
vercel env add NEXT_PUBLIC_SITE_URL preview --value="https://preview.maisonoscar.fr"
vercel env add NEXT_PUBLIC_SITE_URL development --value="http://localhost:3000"

# Debug activé pour preview et development
vercel env add DEBUG_LOGS preview development --value="true"

echo "✅ Configuration multi-environnement terminée"

echo ""
echo "🚀 Prêt pour le déploiement !"
echo "   1. vercel --prod (pour déployer en production)"
echo "   2. vercel (pour un déploiement preview)"
echo ""
echo "📊 Dashboard: https://vercel.com/dashboard"
echo "🌐 Site: https://maisonoscar.fr"
echo ""
echo "🔍 Pour vérifier les variables:"
echo "   vercel env ls"
echo ""
echo "📝 Pour ajouter d'autres variables:"
echo "   vercel env add VARIABLE_NAME production --value=\"valeur\""