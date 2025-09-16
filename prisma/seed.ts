// Fichier : prisma/seed.ts
// Description : Script pour initialiser les données de base

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seeding...')

  // === NETTOYAGE DES DONNÉES === //
  console.log('🧹 Nettoyage des anciennes données...')
  
  await prisma.payment.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.room.deleteMany()
  await prisma.user.deleteMany()
  await prisma.house.deleteMany()
  await prisma.contactInfo.deleteMany()
  await prisma.siteConfig.deleteMany()

  // === CRÉATION DE L'ADMIN === //
  console.log('👤 Création de l\'utilisateur admin...')
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@maisonoscar.fr',
      firstName: 'Admin',
      lastName: 'Maison Oscar',
      role: 'ADMIN',
      status: 'ACTIVE',
      phone: '+33 6 12 34 56 78',
    }
  })

  // === CRÉATION DES 9 CHAMBRES === //
  console.log('🏠 Création des 9 chambres...')

  const rooms = await Promise.all([
    // Chambres RDC
    prisma.room.create({
      data: {
        name: 'Chambre Arche 1',
        number: 1,
        price: 520,
        surface: 12,
        description: 'Chambre cosy au rez-de-chaussée avec accès direct au jardin. Parfaite pour ceux qui aiment la tranquillité.',
        status: 'AVAILABLE',
        hasPrivateBathroom: false,
        hasBalcony: false,
        hasDesk: true,
        hasCloset: true,
        hasWindow: true,
        floor: 0,
        orientation: 'Sud',
        images: [
          '/images/rooms/chambre-1-1.jpg',
          '/images/rooms/chambre-1-2.jpg',
          '/images/rooms/chambre-1-3.jpg'
        ],
        virtualTour: 'https://my.matterport.com/show/?m=exemple1',
        isVirtualTourActive: true,
      }
    }),

    prisma.room.create({
      data: {
        name: 'Chambre Jardin 2',
        number: 2,
        price: 550,
        surface: 14,
        description: 'Grande chambre avec vue sur le jardin et beaucoup de luminosité. Idéale pour étudier.',
        status: 'AVAILABLE',
        hasPrivateBathroom: false,
        hasBalcony: false,
        hasDesk: true,
        hasCloset: true,
        hasWindow: true,
        floor: 0,
        orientation: 'Sud-Ouest',
        images: [
          '/images/rooms/chambre-2-1.jpg',
          '/images/rooms/chambre-2-2.jpg'
        ],
        virtualTour: 'https://my.matterport.com/show/?m=exemple2',
        isVirtualTourActive: true,
      }
    }),

    prisma.room.create({
      data: {
        name: 'Chambre Cocon 3',
        number: 3,
        price: 500,
        surface: 11,
        description: 'Chambre intime et chaleureuse, parfaite pour se ressourcer après une journée bien remplie.',
        status: 'OCCUPIED',
        hasPrivateBathroom: false,
        hasBalcony: false,
        hasDesk: true,
        hasCloset: true,
        hasWindow: true,
        floor: 0,
        orientation: 'Est',
        images: [
          '/images/rooms/chambre-3-1.jpg',
          '/images/rooms/chambre-3-2.jpg',
          '/images/rooms/chambre-3-3.jpg'
        ],
        virtualTour: 'https://my.matterport.com/show/?m=exemple3',
        isVirtualTourActive: false,
      }
    }),

    // Chambres à l'étage
    prisma.room.create({
      data: {
        name: 'Chambre Lumière 4',
        number: 4,
        price: 580,
        surface: 15,
        description: 'Chambre spacieuse à l\'étage avec une belle luminosité et vue dégagée.',
        status: 'AVAILABLE',
        hasPrivateBathroom: false,
        hasBalcony: true,
        hasDesk: true,
        hasCloset: true,
        hasWindow: true,
        floor: 1,
        orientation: 'Sud',
        images: [
          '/images/rooms/chambre-4-1.jpg',
          '/images/rooms/chambre-4-2.jpg'
        ],
        virtualTour: 'https://my.matterport.com/show/?m=exemple4',
        isVirtualTourActive: true,
      }
    }),

    prisma.room.create({
      data: {
        name: 'Chambre Zen 5',
        number: 5,
        price: 560,
        surface: 13,
        description: 'Ambiance zen et apaisante, idéale pour la détente et la concentration.',
        status: 'AVAILABLE',
        hasPrivateBathroom: false,
        hasBalcony: false,
        hasDesk: true,
        hasCloset: true,
        hasWindow: true,
        floor: 1,
        orientation: 'Nord',
        images: [
          '/images/rooms/chambre-5-1.jpg',
          '/images/rooms/chambre-5-2.jpg',
          '/images/rooms/chambre-5-3.jpg'
        ],
        virtualTour: 'https://my.matterport.com/show/?m=exemple5',
        isVirtualTourActive: true,
      }
    }),

    prisma.room.create({
      data: {
        name: 'Chambre Balcon 6',
        number: 6,
        price: 620,
        surface: 16,
        description: 'Grande chambre avec balcon privé. Le plus de cette chambre : l\'espace extérieur personnel.',
        status: 'AVAILABLE',
        hasPrivateBathroom: false,
        hasBalcony: true,
        hasDesk: true,
        hasCloset: true,
        hasWindow: true,
        floor: 1,
        orientation: 'Sud-Est',
        images: [
          '/images/rooms/chambre-6-1.jpg',
          '/images/rooms/chambre-6-2.jpg'
        ],
        virtualTour: 'https://my.matterport.com/show/?m=exemple6',
        isVirtualTourActive: true,
      }
    }),

    prisma.room.create({
      data: {
        name: 'Chambre Suite 7',
        number: 7,
        price: 720,
        surface: 18,
        description: 'La plus grande chambre avec salle de bain privée. Confort premium pour plus d\'intimité.',
        status: 'OCCUPIED',
        hasPrivateBathroom: true,
        hasBalcony: true,
        hasDesk: true,
        hasCloset: true,
        hasWindow: true,
        floor: 1,
        orientation: 'Sud-Ouest',
        images: [
          '/images/rooms/chambre-7-1.jpg',
          '/images/rooms/chambre-7-2.jpg',
          '/images/rooms/chambre-7-3.jpg',
          '/images/rooms/chambre-7-4.jpg'
        ],
        virtualTour: 'https://my.matterport.com/show/?m=exemple7',
        isVirtualTourActive: false,
      }
    }),

    prisma.room.create({
      data: {
        name: 'Chambre Panorama 8',
        number: 8,
        price: 590,
        surface: 14.5,
        description: 'Vue panoramique sur Bruz et les environs. Chambre lumineuse avec caractère.',
        status: 'MAINTENANCE',
        hasPrivateBathroom: false,
        hasBalcony: false,
        hasDesk: true,
        hasCloset: true,
        hasWindow: true,
        floor: 1,
        orientation: 'Nord-Ouest',
        images: [
          '/images/rooms/chambre-8-1.jpg',
          '/images/rooms/chambre-8-2.jpg'
        ],
        virtualTour: 'https://my.matterport.com/show/?m=exemple8',
        isVirtualTourActive: false,
      }
    }),

    prisma.room.create({
      data: {
        name: 'Chambre Étoile 9',
        number: 9,
        price: 600,
        surface: 15.5,
        description: 'Chambre sous les toits avec poutres apparentes. Charme authentique et moderne.',
        status: 'AVAILABLE',
        hasPrivateBathroom: false,
        hasBalcony: false,
        hasDesk: true,
        hasCloset: true,
        hasWindow: true,
        floor: 1,
        orientation: 'Est-Ouest',
        images: [
          '/images/rooms/chambre-9-1.jpg',
          '/images/rooms/chambre-9-2.jpg',
          '/images/rooms/chambre-9-3.jpg'
        ],
        virtualTour: 'https://my.matterport.com/show/?m=exemple9',
        isVirtualTourActive: true,
      }
    }),
  ])

  // === CRÉATION DES INFORMATIONS MAISON === //
  console.log('🏡 Création des informations maison...')

  const house = await prisma.house.create({
    data: {
      name: 'Maison Oscar',
      description: 'Une maison de co-living moderne et chaleureuse au cœur de Bruz, pensée pour créer des liens authentiques entre les résidents. Espaces communs conviviaux, jardin privatif et proximité des transports.',
      address: '123 Rue de la Paix',
      city: 'Bruz',
      zipCode: '35170',
      country: 'France',
      totalSurface: 180,
      totalRooms: 9,
      commonAreas: [
        'Salon spacieux avec TV',
        'Cuisine équipée moderne',
        'Salle à manger conviviale',
        'Bureau partagé',
        'Buanderie',
        'Jardin privatif',
        'Terrasse extérieure',
        'Cave de stockage'
      ],
      hasGarden: true,
      gardenSurface: 200,
      hasParking: true,
      parkingSpaces: 4,
      metroDistance: '15 min de Rennes en transport',
      busLines: ['Ligne 57', 'Ligne 156'],
      images: [
        '/images/house/facade.jpg',
        '/images/house/jardin.jpg',
        '/images/house/salon.jpg',
        '/images/house/cuisine.jpg',
        '/images/house/terrasse.jpg'
      ],
      virtualTour: 'https://my.matterport.com/show/?m=maison-oscar-complete',
      floorPlan: '/images/house/plan-maison.pdf',
      isActive: true,
    }
  })

  // === CRÉATION DES INFORMATIONS DE CONTACT === //
  console.log('📞 Création des informations de contact...')

  const contactInfo = await prisma.contactInfo.create({
    data: {
      email: 'contact@maisonoscar.fr',
      phone: '+33 2 99 12 34 56',
      whatsapp: '+33 6 12 34 56 78',
      openingHours: JSON.stringify({
        lundi: '9h00-18h00',
        mardi: '9h00-18h00',
        mercredi: '9h00-18h00',
        jeudi: '9h00-18h00',
        vendredi: '9h00-18h00',
        samedi: '10h00-16h00',
        dimanche: 'Fermé'
      }),
      address: '123 Rue de la Paix',
      city: 'Bruz',
      zipCode: '35170',
      instagram: '@maisonoscar',
      facebook: 'Maison Oscar Bruz',
      linkedin: 'company/maison-oscar',
      siret: '12345678901234',
      companyName: 'Maison Oscar SARL',
      isActive: true,
    }
  })

  // === CRÉATION D'UTILISATEURS TESTS === //
  console.log('👥 Création d\'utilisateurs de test...')

  const resident1 = await prisma.user.create({
    data: {
      email: 'marie.dubois@email.com',
      firstName: 'Marie',
      lastName: 'Dubois',
      phone: '+33 6 23 45 67 89',
      birthDate: new Date('1998-03-15'),
      role: 'RESIDENT',
      status: 'ACTIVE',
      profession: 'Développeuse web',
      school: 'EPITECH Rennes',
      bio: 'Passionnée de tech et de voyage, j\'adore cuisiner pour les autres !',
    }
  })

  const resident2 = await prisma.user.create({
    data: {
      email: 'lucas.martin@email.com',
      firstName: 'Lucas',
      lastName: 'Martin',
      phone: '+33 6 34 56 78 90',
      birthDate: new Date('1996-07-22'),
      role: 'RESIDENT',
      status: 'ACTIVE',
      profession: 'Designer UX/UI',
      school: 'École de Design Nantes',
      emergencyContact: 'Sophie Martin',
      emergencyPhone: '+33 6 45 67 89 01',
      bio: 'Créatif et sportif, toujours partant pour une soirée jeux !',
    }
  })

  const prospect = await prisma.user.create({
    data: {
      email: 'emma.leroy@email.com',
      firstName: 'Emma',
      lastName: 'Leroy',
      phone: '+33 6 45 67 89 12',
      birthDate: new Date('1999-11-08'),
      role: 'PROSPECT',
      status: 'PENDING',
      profession: 'Étudiante en commerce',
      school: 'ESC Rennes',
      bio: 'Étudiante dynamique recherchant une colocation sympa !',
    }
  })

  // === CRÉATION DES RÉSERVATIONS === //
  console.log('📅 Création des réservations...')

  const booking1 = await prisma.booking.create({
    data: {
      userId: resident1.id,
      roomId: rooms[2].id, // Chambre Cocon 3 (occupée)
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-08-31'),
      status: 'ACTIVE',
      monthlyRent: 500,
      securityDeposit: 500,
      totalAmount: 6500, // 12 mois + caution
      contractSigned: true,
      inventorySigned: true,
      keysGiven: true,
      notes: 'Résidente modèle, très investie dans la vie de la maison.',
    }
  })

  const booking2 = await prisma.booking.create({
    data: {
      userId: resident2.id,
      roomId: rooms[6].id, // Chambre Suite 7 (occupée)
      startDate: new Date('2024-10-15'),
      endDate: new Date('2025-10-14'),
      status: 'ACTIVE',
      monthlyRent: 720,
      securityDeposit: 720,
      totalAmount: 9360, // 12 mois + caution
      contractSigned: true,
      inventorySigned: true,
      keysGiven: true,
      notes: 'Excellent résident, organise souvent des événements communautaires.',
    }
  })

  const booking3 = await prisma.booking.create({
    data: {
      userId: prospect.id,
      roomId: rooms[0].id, // Chambre Arche 1
      startDate: new Date('2025-02-01'),
      status: 'PENDING',
      monthlyRent: 520,
      securityDeposit: 520,
      totalAmount: 520,
      contractSigned: false,
      inventorySigned: false,
      keysGiven: false,
      notes: 'En attente de finalisation du dossier.',
    }
  })

  // === CRÉATION DES PAIEMENTS === //
  console.log('💰 Création des paiements...')

  // Paiements pour Marie (résident actif)
  const payments1 = await Promise.all([
    // Caution payée
    prisma.payment.create({
      data: {
        userId: resident1.id,
        bookingId: booking1.id,
        amount: 500,
        dueDate: new Date('2024-08-25'),
        paidDate: new Date('2024-08-25'),
        paymentType: 'DEPOSIT',
        status: 'PAID',
      }
    }),
    // Loyers payés (septembre à décembre 2024)
    ...Array.from({ length: 4 }, (_, i) => {
      const month = 9 + i
      return prisma.payment.create({
        data: {
          userId: resident1.id,
          bookingId: booking1.id,
          amount: 500,
          dueDate: new Date(`2024-${month.toString().padStart(2, '0')}-01`),
          paidDate: new Date(`2024-${month.toString().padStart(2, '0')}-01`),
          paymentType: 'RENT',
          status: 'PAID',
        }
      })
    }),
    // Loyer janvier 2025 (en attente)
    prisma.payment.create({
      data: {
        userId: resident1.id,
        bookingId: booking1.id,
        amount: 500,
        dueDate: new Date('2025-01-01'),
        paymentType: 'RENT',
        status: 'PENDING',
      }
    }),
  ])

  // Paiements pour Lucas
  const payments2 = await Promise.all([
    // Caution payée
    prisma.payment.create({
      data: {
        userId: resident2.id,
        bookingId: booking2.id,
        amount: 720,
        dueDate: new Date('2024-10-10'),
        paidDate: new Date('2024-10-10'),
        paymentType: 'DEPOSIT',
        status: 'PAID',
      }
    }),
    // Loyers payés (octobre à décembre 2024)
    ...Array.from({ length: 3 }, (_, i) => {
      const month = 10 + i
      return prisma.payment.create({
        data: {
          userId: resident2.id,
          bookingId: booking2.id,
          amount: 720,
          dueDate: new Date(`2024-${month.toString().padStart(2, '0')}-15`),
          paidDate: new Date(`2024-${month.toString().padStart(2, '0')}-15`),
          paymentType: 'RENT',
          status: 'PAID',
        }
      })
    }),
    // Loyer janvier 2025 (en retard)
    prisma.payment.create({
      data: {
        userId: resident2.id,
        bookingId: booking2.id,
        amount: 720,
        dueDate: new Date('2025-01-15'),
        paymentType: 'RENT',
        status: 'LATE',
        isLate: true,
        lateDays: 5,
        reminderSent: true,
        reminderDate: new Date('2025-01-18'),
      }
    }),
  ])

  // === CRÉATION DES MESSAGES DE CONTACT === //
  console.log('📧 Création des messages de contact...')

  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        firstName: 'Sophie',
        lastName: 'Bernard',
        email: 'sophie.bernard@email.com',
        phone: '+33 6 56 78 90 12',
        subject: 'Demande de visite',
        message: 'Bonjour, je suis intéressée par une chambre pour février 2025. Serait-il possible d\'organiser une visite cette semaine ?',
        type: 'VISIT',
        status: 'NEW',
      }
    }),

    prisma.contact.create({
      data: {
        firstName: 'Thomas',
        lastName: 'Moreau',
        email: 'thomas.moreau@email.com',
        phone: '+33 6 67 89 01 23',
        subject: 'Informations tarifs',
        message: 'Bonjour, pourriez-vous me communiquer les tarifs pour une chambre avec balcon ? Merci !',
        type: 'INFORMATION',
        status: 'RESPONDED',
        adminResponse: 'Bonjour Thomas, merci pour votre intérêt ! Les chambres avec balcon sont disponibles à partir de 580€/mois. Je vous envoie une brochure détaillée.',
        respondedAt: new Date('2025-01-18'),
        respondedBy: 'admin@maisonoscar.fr',
      }
    }),

    prisma.contact.create({
      data: {
        firstName: 'Julie',
        lastName: 'Petit',
        email: 'julie.petit@email.com',
        subject: 'Problème chauffage',
        message: 'Bonjour, le chauffage de ma chambre ne fonctionne plus depuis hier. Pourriez-vous intervenir rapidement ? Merci.',
        type: 'MAINTENANCE',
        status: 'PENDING',
      }
    }),

    prisma.contact.create({
      data: {
        firstName: 'Antoine',
        lastName: 'Rousseau',
        email: 'antoine.rousseau@email.com',
        phone: '+33 6 78 90 12 34',
        subject: 'Disponibilités septembre 2025',
        message: 'Bonjour, je commence mes études à Rennes en septembre 2025. Auriez-vous des disponibilités pour cette période ?',
        type: 'BOOKING',
        status: 'NEW',
      }
    }),
  ])

  // === CONFIGURATION DU SITE === //
  console.log('⚙️ Création de la configuration du site...')

  const siteConfigs = await Promise.all([
    prisma.siteConfig.create({
      data: {
        key: 'hero_stats',
        value: JSON.stringify({
          rooms: 9,
          surface: 180,
          distance_rennes: '15min',
          garden_surface: 200
        })
      }
    }),

    prisma.siteConfig.create({
      data: {
        key: 'about_pillars',
        value: JSON.stringify([
          {
            title: 'Mode de vie',
            description: 'Un cadre de vie moderne et confortable'
          },
          {
            title: 'Communauté',
            description: 'Des relations authentiques et durables'
          },
          {
            title: 'Humain',
            description: 'L\'entraide et le partage au centre'
          },
          {
            title: 'Services',
            description: 'Tout inclus pour simplifier votre quotidien'
          }
        ])
      }
    }),

    prisma.siteConfig.create({
      data: {
        key: 'testimonials',
        value: JSON.stringify([
          {
            name: 'Marie D.',
            role: 'Développeuse web',
            content: 'Maison Oscar a changé ma vie ! L\'ambiance est incroyable et j\'ai trouvé de vrais amis ici.',
            rating: 5
          },
          {
            name: 'Lucas M.',
            role: 'Designer UX/UI',
            content: 'Un concept génial ! Les espaces sont magnifiques et la communauté très bienveillante.',
            rating: 5
          },
          {
            name: 'Emma L.',
            role: 'Étudiante',
            content: 'Parfait pour les étudiants ! Proche de Rennes, bien équipé et ambiance familiale.',
            rating: 5
          }
        ])
      }
    }),

    prisma.siteConfig.create({
      data: {
        key: 'maintenance_mode',
        value: 'false'
      }
    }),

    prisma.siteConfig.create({
      data: {
        key: 'booking_enabled',
        value: 'true'
      }
    }),
  ])

  // === STATISTIQUES FINALES === //
  console.log('\n🎉 Seeding terminé avec succès !')
  console.log('📊 Résumé des données créées :')
  console.log(`👤 Utilisateurs : ${await prisma.user.count()}`)
  console.log(`🏠 Chambres : ${await prisma.room.count()}`)
  console.log(`📅 Réservations : ${await prisma.booking.count()}`)
  console.log(`💰 Paiements : ${await prisma.payment.count()}`)
  console.log(`📧 Messages contact : ${await prisma.contact.count()}`)
  console.log(`🏡 Informations maison : ${await prisma.house.count()}`)
  console.log(`📞 Informations contact : ${await prisma.contactInfo.count()}`)
  console.log(`⚙️ Configurations : ${await prisma.siteConfig.count()}`)

  console.log('\n✅ Base de données initialisée et prête à l\'utilisation !')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Erreur durant le seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })