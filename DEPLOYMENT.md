# 🚀 Déploiement VPS Hostinger - Maison Oscar

## 📋 Étapes de migration Vercel → VPS

### 1. Configuration du VPS
```bash
# Lancer le script de configuration
bash scripts/setup-vps.sh
```

### 2. Configuration GitHub Actions
1. **Aller dans GitHub** → Settings → Secrets and variables → Actions
2. **Ajouter ces secrets :**
   - `VPS_SSH_KEY` = Clé privée SSH (générée par le script)

### 3. Configuration DNS (Hostinger ou votre registrar)
```
Type: A
Nom: @
Valeur: 31.97.154.11
TTL: 3600

Type: A
Nom: www
Valeur: 31.97.154.11
TTL: 3600
```

### 4. Déploiement automatique
```bash
# Push vers main déclenche le déploiement automatique
git push origin main
```

## 🏗️ Architecture déployée

```
Internet → Nginx (SSL) → Next.js App → MongoDB Atlas
    ↓
Certbot (SSL auto)
```

### Services Docker :
- **app** : Application Next.js (port 3000)
- **nginx** : Reverse proxy avec SSL (ports 80/443)
- **certbot** : Certification SSL automatique
- **MongoDB Atlas** : Base de données cloud (externe)

## 🔧 Commandes utiles VPS

```bash
# Se connecter au VPS
ssh root@31.97.154.11

# Voir les conteneurs
cd /opt/maisonoscar
docker compose -f docker-compose.prod.yml ps

# Voir les logs
docker compose -f docker-compose.prod.yml logs -f

# Redémarrer les services
docker compose -f docker-compose.prod.yml restart

# Tester la connexion MongoDB Atlas
docker exec maisonoscar-app node -e "console.log('DB:', process.env.MONGODB_URI.slice(0,20)+'...')"

# Mise à jour manuelle
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```

## 📊 Monitoring

- **Site** : https://maisonoscar.fr
- **Logs applicatifs** : `docker logs maisonoscar-app`
- **Logs MongoDB** : `docker logs maisonoscar-mongo`
- **Logs Nginx** : `docker logs maisonoscar-nginx`

## 🎯 Avantages vs Vercel

✅ **Base de données intégrée** (plus de problèmes de connexion)
✅ **Upload d'images illimité**
✅ **SSL automatique**
✅ **Déploiement automatique via GitHub**
✅ **Contrôle total du serveur**
✅ **Logs détaillés**

## 🔒 Sécurité

- Firewall configuré (ports 22, 80, 443 seulement)
- SSL/TLS automatique via Let's Encrypt
- Headers de sécurité configurés
- Utilisateur non-privilégié dans les conteneurs
- Base de données isolée dans le réseau Docker

## 📈 Performance

- Images statiques servies directement par Nginx
- Cache navigateur configuré
- Compression gzip activée
- Conteneurs optimisés pour la production