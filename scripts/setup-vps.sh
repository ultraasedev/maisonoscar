#!/bin/bash

# Script de configuration initiale du VPS Hostinger
# Exécuter avec: bash scripts/setup-vps.sh

echo "🚀 Configuration initiale du VPS Hostinger pour Maison Oscar"
echo "============================================================"

# Variables
VPS_HOST="31.97.154.11"
VPS_USER="root"
DOMAIN="maisonoscar.fr"

echo "📡 Connexion au VPS: $VPS_HOST"

# Installation des dépendances
ssh $VPS_USER@$VPS_HOST << 'EOF'
    echo "📦 Mise à jour du système..."
    apt update && apt upgrade -y

    echo "🐳 Installation de Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker

    echo "📚 Installation de Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose

    echo "🔧 Installation des outils utiles..."
    apt install -y git curl wget unzip htop nano ufw

    echo "🔒 Configuration du firewall..."
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable

    echo "📁 Création des dossiers de travail..."
    mkdir -p /opt/maisonoscar
    mkdir -p /opt/maisonoscar/uploads
    mkdir -p /opt/maisonoscar/nginx/ssl

    echo "✅ Configuration initiale terminée!"
EOF

echo ""
echo "🔑 Configuration des clés SSH pour GitHub Actions..."
echo "Ajoutez cette clé publique à GitHub Secrets (VPS_SSH_KEY):"
echo ""

# Générer une clé SSH pour GitHub Actions si elle n'existe pas
if [ ! -f ~/.ssh/id_rsa_vps ]; then
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa_vps -N ""
    echo "📋 Clé SSH générée. Copiez cette clé privée dans GitHub Secrets:"
    echo "============================================================"
    cat ~/.ssh/id_rsa_vps
    echo "============================================================"
    echo ""
    echo "📤 Ajout de la clé publique au VPS..."
    ssh-copy-id -i ~/.ssh/id_rsa_vps.pub $VPS_USER@$VPS_HOST
else
    echo "📋 Clé SSH existante. Copiez cette clé privée dans GitHub Secrets:"
    echo "============================================================"
    cat ~/.ssh/id_rsa_vps
    echo "============================================================"
fi

echo ""
echo "🌐 Instructions pour pointer le domaine vers le VPS:"
echo "======================================================="
echo "1. Connectez-vous à votre registrar de domaine"
echo "2. Modifiez les enregistrements DNS:"
echo "   Type: A"
echo "   Nom: @"
echo "   Valeur: $VPS_HOST"
echo "   TTL: 3600"
echo ""
echo "   Type: A"
echo "   Nom: www"
echo "   Valeur: $VPS_HOST"
echo "   TTL: 3600"
echo ""
echo "🚀 Une fois le DNS configuré, lancez le déploiement avec:"
echo "git push origin main"
echo ""
echo "✅ Configuration VPS terminée!"