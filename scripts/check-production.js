#!/usr/bin/env node

/**
 * Script de vérification pré-production
 * Vérifie que toutes les configurations sont prêtes pour la production
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration production...\n');

let errors = [];
let warnings = [];
let success = [];

// Vérifier les variables d'environnement essentielles
const checkEnvVars = () => {
  console.log('📋 Vérification des variables d\'environnement...');
  
  const requiredVars = [
    'MONGODB_URI',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'EMAIL_USER',
    'EMAIL_APP_PASSWORD'
  ];
  
  const optionalVars = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'STRIPE_PUBLIC_KEY',
    'STRIPE_SECRET_KEY'
  ];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      errors.push(`❌ Variable manquante: ${varName}`);
    } else {
      success.push(`✅ ${varName} configuré`);
    }
  });
  
  optionalVars.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(`⚠️  ${varName} non configuré (optionnel)`);
    }
  });
};

// Vérifier la connexion MongoDB
const checkMongoDB = async () => {
  console.log('\n📦 Test de connexion MongoDB...');
  
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    success.push('✅ Connexion MongoDB réussie');
    
    // Vérifier qu'il y a au moins une chambre
    const roomCount = await prisma.room.count();
    if (roomCount === 0) {
      warnings.push('⚠️  Aucune chambre créée dans la base de données');
    } else {
      success.push(`✅ ${roomCount} chambre(s) trouvée(s)`);
    }
    
    // Vérifier qu'il y a au moins un admin
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (adminCount === 0) {
      errors.push('❌ Aucun admin créé - Exécutez: npm run create-admin');
    } else {
      success.push(`✅ ${adminCount} admin(s) trouvé(s)`);
    }
    
    await prisma.$disconnect();
  } catch (error) {
    errors.push(`❌ Erreur MongoDB: ${error.message}`);
  }
};

// Vérifier les fichiers essentiels
const checkFiles = () => {
  console.log('\n📁 Vérification des fichiers essentiels...');
  
  const essentialFiles = [
    'package.json',
    'next.config.ts',
    'prisma/schema.prisma',
    'middleware.ts',
    'app/layout.tsx',
    'app/page.tsx',
    'lib/auth.ts',
    'lib/prisma.ts'
  ];
  
  essentialFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      success.push(`✅ ${file} présent`);
    } else {
      errors.push(`❌ Fichier manquant: ${file}`);
    }
  });
};

// Vérifier la configuration NextAuth
const checkNextAuth = () => {
  console.log('\n🔐 Vérification NextAuth...');
  
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;
  
  if (nextAuthUrl && nextAuthUrl.includes('localhost')) {
    warnings.push('⚠️  NEXTAUTH_URL pointe vers localhost - Changez pour la production');
  }
  
  if (nextAuthSecret && nextAuthSecret.length < 32) {
    errors.push('❌ NEXTAUTH_SECRET trop court - Utilisez: openssl rand -base64 32');
  }
};

// Vérifier le build
const checkBuild = () => {
  console.log('\n🏗️  Vérification du build...');
  
  const buildPath = path.join(process.cwd(), '.next');
  if (!fs.existsSync(buildPath)) {
    warnings.push('⚠️  Pas de build trouvé - Exécutez: npm run build');
  } else {
    success.push('✅ Build .next trouvé');
  }
};

// Résumé
const printSummary = () => {
  console.log('\n' + '='.repeat(50));
  console.log('📊 RÉSUMÉ DE LA VÉRIFICATION');
  console.log('='.repeat(50));
  
  if (success.length > 0) {
    console.log('\n✅ Points validés:');
    success.forEach(s => console.log(`  ${s}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  Avertissements:');
    warnings.forEach(w => console.log(`  ${w}`));
  }
  
  if (errors.length > 0) {
    console.log('\n❌ Erreurs à corriger:');
    errors.forEach(e => console.log(`  ${e}`));
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (errors.length === 0) {
    console.log('🎉 Votre application est PRÊTE pour la production!');
    console.log('\nProchaines étapes:');
    console.log('1. npm run build');
    console.log('2. Déployez sur Vercel/votre hébergeur');
    console.log('3. Configurez les variables d\'environnement sur l\'hébergeur');
    console.log('4. Testez en production');
  } else {
    console.log('⚠️  Corrigez les erreurs avant de déployer en production');
    process.exit(1);
  }
};

// Exécution
const main = async () => {
  checkEnvVars();
  await checkMongoDB();
  checkFiles();
  checkNextAuth();
  checkBuild();
  printSummary();
};

main().catch(console.error);