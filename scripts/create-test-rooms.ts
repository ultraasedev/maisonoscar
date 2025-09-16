// Script pour créer des chambres test dans la base de données

import { prisma } from '../lib/prisma'

async function createTestRooms() {
  try {
    console.log('🏗️  Création des chambres test...')
    
    // Vérifier si des chambres existent déjà
    const existingRooms = await prisma.room.findMany({
      where: {
        number: { in: [101, 102, 103] }
      }
    })
    
    if (existingRooms.length > 0) {
      console.log('⚠️  Des chambres test existent déjà')
      const numbers = existingRooms.map(r => r.number)
      console.log('   Numéros existants:', numbers.join(', '))
    }
    
    // Chambre 1 - Studio Confort
    const room1Exists = existingRooms.some(r => r.number === 101)
    if (!room1Exists) {
      const room1 = await prisma.room.create({
        data: {
          name: 'Studio Confort',
          number: 101,
          price: 450,
          surface: 18,
          description: 'Studio moderne et lumineux avec balcon, idéal pour étudiants ou jeunes actifs. Proche des transports et commerces.',
          status: 'AVAILABLE',
          isActive: true,
          floor: 1,
          orientation: 'Sud-Ouest',
          exposure: 'SUNNY',
          hasPrivateBathroom: false,
          hasBalcony: true,
          hasDesk: true,
          hasCloset: true,
          hasWindow: true,
          hasTV: false,
          bedType: 'DOUBLE',
          bedCount: 1,
          sheetsProvided: true,
          kitchenType: 'SHARED',
          kitchenEquipment: ['Réfrigérateur', 'Micro-ondes', 'Plaques de cuisson', 'Four'],
          hasMicrowave: true,
          hasOven: true,
          hasCookingPlates: true,
          cookingPlateType: 'INDUCTION',
          petsAllowed: false,
          smokingAllowed: false,
          images: [
            'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=800',
            'https://images.unsplash.com/photo-1505693314120-0d443867891c?q=80&w=800',
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800'
          ],
          virtualTour: 'https://my.matterport.com/show/?m=example',
          isVirtualTourActive: true
        }
      })
      console.log('✅ Chambre créée:', room1.name, '- Numéro', room1.number)
    }
    
    // Chambre 2 - Suite Premium
    const room2Exists = existingRooms.some(r => r.number === 102)
    if (!room2Exists) {
      const room2 = await prisma.room.create({
        data: {
          name: 'Suite Premium',
          number: 102,
          price: 550,
          surface: 25,
          description: 'Suite spacieuse avec salle de bain privée et grand balcon. Vue dégagée et calme absolu.',
          status: 'AVAILABLE',
          isActive: true,
          floor: 2,
          orientation: 'Est',
          exposure: 'SUNNY',
          hasPrivateBathroom: true,
          hasBalcony: true,
          hasDesk: true,
          hasCloset: true,
          hasWindow: true,
          hasTV: true,
          bedType: 'QUEEN',
          bedCount: 1,
          sheetsProvided: true,
          kitchenType: 'PRIVATE',
          kitchenEquipment: ['Réfrigérateur', 'Micro-ondes', 'Plaques de cuisson', 'Four', 'Lave-vaisselle'],
          hasMicrowave: true,
          hasOven: true,
          hasCookingPlates: true,
          cookingPlateType: 'INDUCTION',
          petsAllowed: false,
          smokingAllowed: false,
          images: [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800',
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800'
          ]
        }
      })
      console.log('✅ Chambre créée:', room2.name, '- Numéro', room2.number)
    }
    
    // Chambre 3 - Chambre Économique
    const room3Exists = existingRooms.some(r => r.number === 103)
    if (!room3Exists) {
      const room3 = await prisma.room.create({
        data: {
          name: 'Chambre Économique',
          number: 103,
          price: 380,
          surface: 12,
          description: 'Chambre simple et fonctionnelle, parfaite pour un budget serré. Tout le confort nécessaire.',
          status: 'OCCUPIED',
          isActive: true,
          floor: 0,
          orientation: 'Nord',
          exposure: 'SHADED',
          hasPrivateBathroom: false,
          hasBalcony: false,
          hasDesk: true,
          hasCloset: true,
          hasWindow: true,
          hasTV: false,
          bedType: 'SINGLE',
          bedCount: 1,
          sheetsProvided: true,
          kitchenType: 'SHARED',
          kitchenEquipment: ['Réfrigérateur', 'Micro-ondes'],
          hasMicrowave: true,
          hasOven: false,
          hasCookingPlates: false,
          cookingPlateType: 'ELECTRIC',
          petsAllowed: false,
          smokingAllowed: false,
          images: [
            'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=800',
            'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=800'
          ]
        }
      })
      console.log('✅ Chambre créée:', room3.name, '- Numéro', room3.number)
    }
    
    // Chambre 4 - Chambre Cosy
    const room4Exists = existingRooms.some(r => r.number === 104)
    if (!room4Exists) {
      const room4 = await prisma.room.create({
        data: {
          name: 'Chambre Cosy',
          number: 104,
          price: 420,
          surface: 15,
          description: 'Chambre chaleureuse et bien agencée, parfaite pour se sentir chez soi.',
          status: 'AVAILABLE',
          isActive: true,
          floor: 1,
          orientation: 'Ouest',
          exposure: 'MIXED',
          hasPrivateBathroom: false,
          hasBalcony: false,
          hasDesk: true,
          hasCloset: true,
          hasWindow: true,
          hasTV: true,
          bedType: 'DOUBLE',
          bedCount: 1,
          sheetsProvided: true,
          kitchenType: 'SHARED',
          kitchenEquipment: ['Réfrigérateur', 'Micro-ondes', 'Plaques de cuisson'],
          hasMicrowave: true,
          hasOven: false,
          hasCookingPlates: true,
          cookingPlateType: 'ELECTRIC',
          petsAllowed: false,
          smokingAllowed: false,
          images: [
            'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=800',
            'https://images.unsplash.com/photo-1556020685-ae41abfc9365?q=80&w=800'
          ]
        }
      })
      console.log('✅ Chambre créée:', room4.name, '- Numéro', room4.number)
    }
    
    console.log('\n🎉 Création des chambres test terminée !')
    
    // Afficher le résumé
    const totalRooms = await prisma.room.count()
    const availableRooms = await prisma.room.count({
      where: { status: 'AVAILABLE', isActive: true }
    })
    
    console.log('\n📊 Résumé:')
    console.log(`   Total chambres: ${totalRooms}`)
    console.log(`   Chambres disponibles: ${availableRooms}`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des chambres:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script
createTestRooms()