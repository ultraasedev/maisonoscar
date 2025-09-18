# 🚀 GUIDE DE DÉPLOIEMENT PRODUCTION - maisonoscar.fr

## ⚡ Déploiement Rapide (5 minutes)

### 1. **Prérequis**
```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login
```

### 2. **Configuration Automatique**
```bash
# Exécuter le script de configuration
./scripts/setup-vercel-env.sh
```

### 3. **Déploiement**
```bash
# Déployer en production
vercel --prod
```

### 4. **Vérification**
- ✅ Site accessible : https://maisonoscar.fr
- ✅ Admin accessible : https://maisonoscar.fr/admin
- ✅ API fonctionnelle : https://maisonoscar.fr/api/health

---

## 🔧 Configuration Manuelle (Alternative)

### **Variables Critiques à Ajouter dans Vercel Dashboard**

#### 🔴 **OBLIGATOIRES**
```env
MONGODB_URI=mongodb+srv://gfranckrelouconduite:CQrNbTvzkQIHvn5l@maisonoscarcluster.my5fced.mongodb.net/MAISONOSCAR?retryWrites=true&w=majority&appName=maisonoscarcluster
NEXTAUTH_URL=https://maisonoscar.fr
NEXTAUTH_SECRET=MaisonOscar2025ProdSecret_8kF9mQ3wE7rT2nL5pY6uI9oX1cV4bN
ENCRYPTION_KEY=2a9f4b8c7e1d3f6a9b2e5c8d1a4f7b9e2c5f8a1d4b7e9c2c5f8a1d4b7e9c2f5a8b1e4c7f9a2d5
JWT_SECRET=8f3e9a1c6d2b7e4f9a3c6e1d4b7f9e2a5c8f1d4b7e9a2c5f8e1d4b7f9a3c6e1
```

#### 📧 **EMAIL**
```env
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=contact@maisonoscar.fr
SMTP_PASSWORD=MaisonOscar25
SMTP_FROM_EMAIL=contact@maisonoscar.fr
```

#### 🌐 **SITE**
```env
NEXT_PUBLIC_SITE_URL=https://maisonoscar.fr
SITE_URL=https://maisonoscar.fr
ADMIN_EMAIL=contact@maisonoscar.fr
CONTACT_EMAIL=contact@maisonoscar.fr
```

---

## 🔐 Variables de Sécurité Générées

### **Nouvelles Clés pour Production**
- ✅ **NEXTAUTH_SECRET** : Nouveau secret pour l'authentification
- ✅ **ENCRYPTION_KEY** : Nouvelle clé de chiffrement 256-bit
- ✅ **JWT_SECRET** : Nouveau secret pour les tokens JWT
- ✅ **WEBHOOK_SECRET** : Secret pour valider les webhooks

### **Domaines Autorisés**
```env
ALLOWED_ORIGINS=https://maisonoscar.fr,https://www.maisonoscar.fr
```

---

## 🔄 Variables à Configurer Plus Tard

### **💳 Stripe (Paiements)**
```env
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### **☁️ Cloudinary (Images)**
```env
CLOUDINARY_CLOUD_NAME=maisonoscar-prod
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### **📱 Twilio (SMS)**
```env
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+33...
```

### **📊 Analytics**
```env
NEXT_PUBLIC_GA_ID=G-...
SENTRY_DSN=https://...@sentry.io/...
```

---

## ✅ Checklist Post-Déploiement

### **Tests Fonctionnels**
- [ ] Page d'accueil se charge (https://maisonoscar.fr)
- [ ] Connexion admin fonctionne (/admin/login)
- [ ] Envoi d'emails fonctionne
- [ ] Upload de fichiers fonctionne
- [ ] Génération PDF fonctionne
- [ ] Base de données accessible

### **Performance**
- [ ] Vitesse < 3 secondes (PageSpeed Insights)
- [ ] Images optimisées
- [ ] Cache fonctionnel

### **Sécurité**
- [ ] HTTPS actif
- [ ] Headers de sécurité
- [ ] Variables sensibles masquées

---

## 🚨 Résolution de Problèmes

### **Erreur de Build**
```bash
# Nettoyer et rebuilder
vercel --force
```

### **Problème de Base de Données**
```bash
# Vérifier les logs
vercel logs --tail
```

### **Test Email**
```bash
# Tester l'envoi d'email
curl -X POST https://maisonoscar.fr/api/test-email
```

### **Vérifier les Variables**
```bash
# Lister toutes les variables
vercel env ls

# Ajouter une variable manquante
vercel env add VARIABLE_NAME production --value="valeur"
```

---

## 📊 Monitoring

### **Logs en Temps Réel**
```bash
vercel logs --tail
```

### **Métriques Vercel**
- Dashboard : https://vercel.com/dashboard
- Analytics : Activées automatiquement
- Error Tracking : Via Sentry (à configurer)

### **Health Check**
```bash
curl https://maisonoscar.fr/api/health
```

---

## 🔄 Workflow de Développement

### **Branches**
- `main` → Production (maisonoscar.fr)
- `develop` → Preview (preview-xxx.vercel.app)
- `feature/*` → Preview branches

### **Déploiement Automatique**
- Push sur `main` = Déploiement production
- Push sur autres branches = Preview deployment
- Pull Request = Preview avec commentaire automatique

---

## 🎯 URLs Importantes

- **Production** : https://maisonoscar.fr
- **Admin** : https://maisonoscar.fr/admin
- **API** : https://maisonoscar.fr/api
- **Dashboard Vercel** : https://vercel.com/dashboard
- **Logs** : https://vercel.com/dashboard (Functions tab)

---

## 🆘 Support

### **Logs d'Erreur**
```bash
# Logs spécifiques à une fonction
vercel logs --filter "api/contracts"

# Logs d'une URL spécifique
vercel logs --filter "maisonoscar.fr"
```

### **Variables d'Environnement**
```bash
# Voir toutes les variables
vercel env ls

# Supprimer une variable
vercel env rm VARIABLE_NAME production

# Modifier une variable
vercel env add VARIABLE_NAME production --value="nouvelle_valeur"
```

---

**🎉 Votre application Maison Oscar est maintenant en production sur maisonoscar.fr !**