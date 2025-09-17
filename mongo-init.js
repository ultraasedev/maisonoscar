// Script d'initialisation MongoDB pour créer la base de données

// Initialiser le replica set
try {
  rs.initiate({
    _id: "rs0",
    members: [
      { _id: 0, host: "localhost:27017" }
    ]
  });
  print('Replica set rs0 initialisé avec succès');
} catch (e) {
  print('Replica set déjà initialisé ou erreur: ' + e);
}

db = db.getSiblingDB('MAISONOSCAR');

// Créer quelques collections de base pour vérifier que tout fonctionne
db.createCollection('rooms');
db.createCollection('siteSettings');
db.createCollection('users');

print('Base de données MAISONOSCAR initialisée avec succès');