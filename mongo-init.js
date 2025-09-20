// Script d'initialisation MongoDB pour Maison Oscar
db = db.getSiblingDB('MAISONOSCAR');

// Créer un utilisateur pour l'application
db.createUser({
  user: 'maisonoscar_user',
  pwd: 'maisonoscar_password',
  roles: [{ role: 'readWrite', db: 'MAISONOSCAR' }]
});

// Créer les collections avec indexes
db.createCollection('Room');
db.Room.createIndex({ number: 1 }, { unique: true });

// Insérer 3 chambres de test
db.Room.insertMany([
  {
    name: 'Chambre Océan', number: 1, price: 520, surface: 12,
    description: 'Belle chambre lumineuse avec vue sur le jardin',
    status: 'AVAILABLE', isActive: true, createdAt: new Date(), updatedAt: new Date()
  },
  {
    name: 'Chambre Forêt', number: 2, price: 550, surface: 14,
    description: 'Chambre spacieuse avec balcon privatif',
    status: 'AVAILABLE', isActive: true, createdAt: new Date(), updatedAt: new Date()
  },
  {
    name: 'Chambre Soleil', number: 3, price: 680, surface: 18,
    description: 'Grande chambre avec salle de bain privative',
    status: 'AVAILABLE', isActive: true, createdAt: new Date(), updatedAt: new Date()
  }
]);

print('✅ Base de données initialisée - 3 chambres créées');