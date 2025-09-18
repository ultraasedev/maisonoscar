# 🚀 Guide de Déploiement Vercel - Maison Oscar

## 📋 Prérequis

- Compte Vercel actif
- Projet GitHub/GitLab connecté
- Base de données MongoDB Atlas configurée
- Email SMTP Hostinger configuré

## 🔧 Configuration Vercel Dashboard

### 1. **Importer le Projet**
```bash
# Via Vercel CLI
npm i -g vercel
vercel login
vercel --prod
```

### 2. **Variables d'Environnement**
Dans le dashboard Vercel > Settings > Environment Variables, ajoutez :

#### 🔴 **CRITIQUES (À configurer en premier)**
```env
MONGODB_URI=mongodb+srv://gfranckrelouconduite:CQrNbTvzkQIHvn5l@maisonoscarcluster.my5fced.mongodb.net/MAISONOSCAR?retryWrites=true&w=majority&appName=maisonoscarcluster
NEXTAUTH_URL=https://maisonoscar.vercel.app
NEXTAUTH_SECRET=P7Q5N605zL9ZcE+HLROxpmOME51mQu4zOCuiPWBXVh8=
ENCRYPTION_KEY=f6b71561020497cd1d62fdf8465d8f8522220f08f189f697bfb63b7af3c4e6cb
JWT_SECRET=f58175cb90093cb86741f2d2ab3566a95fa9a431a7c47529299d540a597ad6af
```

#### 📧 **EMAIL SMTP**
```env
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=contact@maisonoscar.fr
SMTP_PASSWORD=MaisonOscar25
SMTP_FROM_EMAIL=contact@maisonoscar.fr
```

#### 🌐 **URLs & CONTACT**
```env
NEXT_PUBLIC_SITE_URL=https://maisonoscar.vercel.app
SITE_URL=https://maisonoscar.vercel.app
ADMIN_EMAIL=contact@maisonoscar.fr
CONTACT_EMAIL=contact@maisonoscar.fr
```

### 3. **Build Configuration**

Créer `vercel.json` :
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["cdg1"],
  "env": {
    "MONGODB_URI": "@mongodb-uri",
    "NEXTAUTH_SECRET": "@nextauth-secret"
  }
}
```

## 🗂️ Structure des Variables par Environnement

### **Production** (maisonoscar.vercel.app)
- ✅ Toutes les variables du fichier `.env.vercel`
- ✅ `DEBUG_LOGS=false`
- ✅ `MAINTENANCE_MODE=false`

### **Preview** (branches de développement)
- ✅ Variables de base (DB, Auth, Email)
- ✅ `DEBUG_LOGS=true`
- ❌ Pas de variables sensibles de paiement

### **Development** (local uniquement)
- ✅ Variables de test
- ✅ `DEBUG_LOGS=true`

## 📦 Commandes de Déploiement

```bash
# Déploiement production
vercel --prod

# Déploiement preview
vercel

# Vérifier le déploiement
vercel inspect https://maisonoscar.vercel.app

# Logs de debug
vercel logs https://maisonoscar.vercel.app
```

## 🔍 Checklist Post-Déploiement

### ✅ **Tests Fonctionnels**
- [ ] Page d'accueil se charge
- [ ] Connexion admin fonctionne
- [ ] Base de données accessible
- [ ] Envoi d'emails fonctionne
- [ ] Upload de fichiers fonctionne
- [ ] Génération PDF fonctionne

### ✅ **Performance**
- [ ] Vitesse de chargement < 3s
- [ ] Images optimisées
- [ ] Build size acceptable
- [ ] Pas d'erreurs console

### ✅ **Sécurité**
- [ ] HTTPS activé
- [ ] Variables sensibles masquées
- [ ] CORS configuré
- [ ] Headers de sécurité

## 🐛 Debug et Résolution de Problèmes

### **Erreur de Base de Données**
```bash
# Vérifier la connexion MongoDB
vercel logs --tail
```

### **Erreur d'Authentification**
```bash
# Vérifier NEXTAUTH_URL et NEXTAUTH_SECRET
vercel env ls
```

### **Erreur de Build**
```bash
# Nettoyer le cache et rebuild
vercel --force
```

### **Erreur d'Emails**
```bash
# Tester les paramètres SMTP
curl -X POST https://maisonoscar.vercel.app/api/test-email
```

## 🔄 Mise à Jour Continue

### **Auto-déploiement GitHub**
1. Connecter le repo GitHub à Vercel
2. Chaque push sur `main` = déploiement production
3. Chaque push sur autres branches = déploiement preview

### **Variables d'environnement**
1. Modifier dans Vercel Dashboard
2. Redéploiement automatique
3. Vérifier les logs

## 📊 Monitoring

### **Analytics Vercel**
- Activer dans Settings > Analytics
- Surveiller les performances
- Alertes automatiques

### **Logs et Erreurs**
```bash
# Logs en temps réel
vercel logs --tail

# Logs d'une fonction spécifique
vercel logs --tail --filter "api/contracts"
```

## 🚨 Alertes et Notifications

### **Slack/Discord Webhooks**
Configurer des webhooks pour :
- Déploiements réussis/échoués
- Erreurs de production
- Métriques de performance

### **Monitoring Uptime**
Utiliser des services comme :
- Uptime Robot
- Pingdom
- StatusPage

## 🔐 Sécurité Production

### **Variables Sensibles**
- ❌ Jamais dans le code source
- ✅ Uniquement dans Vercel Dashboard
- ✅ Différentes pour chaque environnement

### **Domaines Autorisés**
```env
ALLOWED_ORIGINS=https://maisonoscar.fr,https://www.maisonoscar.fr,https://maisonoscar.vercel.app
```

### **Rate Limiting**
Activer dans `vercel.json` :
```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

---

## ⚡ Déploiement Rapide

```bash
# 1. Cloner et installer
git clone [repo-url]
cd maisonoscar
npm install

# 2. Configurer Vercel
vercel login
vercel

# 3. Ajouter les variables d'environnement via dashboard

# 4. Déployer
vercel --prod
```

**🎉 Votre application Maison Oscar est maintenant en ligne !**