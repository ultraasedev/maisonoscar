# 🚀 Checklist de Déploiement Production - Maison Oscar

## ⚠️ ERREUR NextAuth CLIENT_FETCH_ERROR - Solution

L'erreur `CLIENT_FETCH_ERROR` est causée par une mauvaise configuration de NextAuth. Voici les corrections :

### 1. Variables d'environnement OBLIGATOIRES

```env
# Pour la PRODUCTION
NEXTAUTH_URL=https://maisonoscar.fr  # ⚠️ SANS le /admin
NEXTAUTH_SECRET=owjIdIoGdPG+46XrSLgGX5bZySEr/p59mbRVW95RXNs
NODE_ENV=production
```

### 2. Correction immédiate de l'erreur

Créez/modifiez le fichier `.env.production` :
```env
NEXTAUTH_URL=https://maisonoscar.fr
NEXTAUTH_SECRET=owjIdIoGdPG+46XrSLgGX5bZySEr/p59mbRVW95RXNs
```

## ✅ Checklist Complète Production

### 🔐 1. Sécurité

- [ ] **Variables d'environnement production**
  ```env
  NODE_ENV=production
  NEXTAUTH_URL=https://maisonoscar.fr
  NEXTAUTH_SECRET=[Générer nouveau avec: openssl rand -base64 32]
  ```

- [ ] **MongoDB Atlas**
  - ✅ URI configuré : `mongodb+srv://...`
  - [ ] IP de production autorisée dans Atlas
  - [ ] Backup automatique activé

- [ ] **Emails**
  - ✅ Gmail configuré avec mot de passe d'application
  - ✅ Templates stylisés prêts

### 📦 2. Build Production

```bash
# Test build local
npm run build

# Vérifier les erreurs TypeScript
npm run type-check

# Test production local
npm run start
```

### 🔧 3. Configuration Vercel/Hosting

#### Variables d'environnement à ajouter dans Vercel :

```env
# Essentielles
MONGODB_URI=mongodb+srv://gfranckrelouconduite:CQrNbTvzkQIHvn5l@maisonoscarcluster.my5fced.mongodb.net/MAISONOSCAR?retryWrites=true&w=majority
NEXTAUTH_URL=https://maisonoscar.fr
NEXTAUTH_SECRET=[GÉNÉRER NOUVEAU]
NODE_ENV=production

# Email
EMAIL_USER=maisonoscar.breizh@gmail.com
EMAIL_APP_PASSWORD=wwae tbht vjgt sikc

# WhatsApp (optionnel)
TWILIO_ACCOUNT_SID=[Si configuré]
TWILIO_AUTH_TOKEN=[Si configuré]
```

### 🎯 4. Fonctionnalités Prêtes

#### ✅ Complètement fonctionnelles :
- Système d'authentification admin
- Gestion des chambres
- Demandes de réservation avec colocataires
- Génération PDF contrats
- Emails stylisés automatiques
- Dashboard responsive
- Mode Dev/Production
- Suppression demandes
- Actions utilisateurs

#### ⚠️ À configurer (optionnel) :
- WhatsApp notifications (nécessite compte Twilio)
- Upload documents (nécessite Cloudinary/S3)
- Paiements Stripe

### 📱 5. Tests Finaux

- [ ] Test sur mobile (iPhone/Android)
- [ ] Test création utilisateur admin
- [ ] Test soumission formulaire réservation
- [ ] Test génération PDF contrat
- [ ] Test envoi emails
- [ ] Test mode production dans Settings

### 🚨 6. Monitoring

```javascript
// Ajouter dans app/layout.tsx pour monitoring
if (process.env.NODE_ENV === 'production') {
  // Google Analytics
  // Sentry pour les erreurs
}
```

### 🔄 7. Commandes de Déploiement

```bash
# Sur Vercel
vercel --prod

# Ou avec Git (si connecté à Vercel)
git add .
git commit -m "Production ready"
git push origin main
```

### 📝 8. Post-Déploiement

1. **Créer le premier admin** :
   ```bash
   npm run create-admin
   ```

2. **Vérifier les logs** :
   - Vercel Dashboard → Functions → Logs
   - MongoDB Atlas → Monitoring

3. **Tester en production** :
   - https://maisonoscar.fr/admin/login
   - Créer une demande test
   - Vérifier réception emails

## 🐛 Problèmes Courants et Solutions

### Erreur CLIENT_FETCH_ERROR
→ Vérifier `NEXTAUTH_URL` sans `/admin` à la fin

### Erreur de connexion MongoDB
→ Vérifier IP autorisée dans Atlas Network Access

### Emails non reçus
→ Vérifier mot de passe d'application Gmail

### Images non affichées
→ Configurer Cloudinary ou utiliser images publiques

## 📞 Support

Pour toute question :
- Email : maisonoscar.breizh@gmail.com
- Issues : github.com/votre-repo/issues

---

**IMPORTANT** : Avant de déployer, générez un nouveau `NEXTAUTH_SECRET` pour la production avec :
```bash
openssl rand -base64 32
```

Et mettez à jour dans Vercel/votre hébergeur.