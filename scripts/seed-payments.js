// Script pour générer des données de test pour les paiements
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedPaymentsData() {
  try {
    console.log('🚀 Génération des données de test pour les paiements...')

    // 1. Créer des chambres si elles n'existent pas
    const existingRooms = await prisma.room.findMany()
    if (existingRooms.length === 0) {
      console.log('📦 Création des chambres...')
      await prisma.room.createMany({
        data: [
          {
            name: 'Chambre Lumière',
            number: 1,
            price: 450,
            surface: 15.5,
            isActive: true,
            description: 'Belle chambre lumineuse avec balcon'
          },
          {
            name: 'Suite Master',
            number: 2,
            price: 520,
            surface: 22.0,
            isActive: true,
            description: 'Grande suite avec salle de bain privée'
          },
          {
            name: 'Studio Cosy',
            number: 3,
            price: 380,
            surface: 12.0,
            isActive: true,
            description: 'Studio cosy parfait pour étudiant'
          },
          {
            name: 'Chambre Design',
            number: 4,
            price: 480,
            surface: 18.5,
            isActive: true,
            description: 'Chambre design avec bureau intégré'
          }
        ]
      })
    }

    // 2. Créer des utilisateurs locataires si ils n'existent pas
    const existingTenants = await prisma.user.findMany({
      where: { role: 'RESIDENT' }
    })

    if (existingTenants.length === 0) {
      console.log('👥 Création des locataires...')
      await prisma.user.createMany({
        data: [
          {
            email: 'marie.dupont@email.com',
            firstName: 'Marie',
            lastName: 'Dupont',
            phone: '06 12 34 56 78',
            role: 'RESIDENT'
          },
          {
            email: 'thomas.martin@email.com',
            firstName: 'Thomas',
            lastName: 'Martin',
            phone: '06 23 45 67 89',
            role: 'RESIDENT'
          },
          {
            email: 'julie.bernard@email.com',
            firstName: 'Julie',
            lastName: 'Bernard',
            phone: '06 34 56 78 90',
            role: 'RESIDENT'
          },
          {
            email: 'alexis.rousseau@email.com',
            firstName: 'Alexis',
            lastName: 'Rousseau',
            phone: '06 45 67 89 01',
            role: 'RESIDENT'
          }
        ]
      })
    }

    // 3. Récupérer les chambres et utilisateurs créés
    const rooms = await prisma.room.findMany()
    const tenants = await prisma.user.findMany({
      where: { role: 'RESIDENT' }
    })

    // 4. Créer des réservations si elles n'existent pas
    const existingBookings = await prisma.booking.findMany()
    if (existingBookings.length === 0) {
      console.log('🏠 Création des réservations...')

      const bookingsData = []
      for (let i = 0; i < Math.min(rooms.length, tenants.length); i++) {
        const startDate = new Date()
        startDate.setMonth(startDate.getMonth() - Math.floor(Math.random() * 6)) // Début il y a 0-6 mois

        bookingsData.push({
          userId: tenants[i].id,
          roomId: rooms[i].id,
          startDate: startDate,
          endDate: null, // Contrat en cours
          monthlyRent: rooms[i].price,
          securityDeposit: rooms[i].price * 2,
          totalAmount: rooms[i].price,
          status: 'ACTIVE'
        })
      }

      await prisma.booking.createMany({
        data: bookingsData
      })
    }

    // 5. Créer des paiements
    const bookings = await prisma.booking.findMany({
      include: { user: true, room: true }
    })

    console.log('💰 Création des paiements...')
    const paymentsData = []
    const today = new Date()

    for (const booking of bookings) {
      const startDate = new Date(booking.startDate)
      const currentDate = new Date(startDate)

      // Générer des paiements mensuels depuis le début du contrat
      while (currentDate <= today) {
        const dueDate = new Date(currentDate)
        dueDate.setDate(5) // Échéance le 5 de chaque mois

        // Statut du paiement selon la date
        let status = 'PAID'
        let paidDate = new Date(dueDate)
        paidDate.setDate(paidDate.getDate() + Math.floor(Math.random() * 5)) // Payé dans les 5 jours

        if (dueDate > today) {
          status = 'PENDING'
          paidDate = null
        } else if (Math.random() > 0.85) { // 15% de chance d'être en retard
          status = 'LATE'
          paidDate = null
        }

        paymentsData.push({
          userId: booking.userId,
          bookingId: booking.id,
          amount: booking.monthlyRent,
          paymentType: 'RENT',
          status: status,
          dueDate: dueDate,
          paidDate: paidDate,
          isLate: status === 'LATE',
          lateDays: status === 'LATE' ? Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)) : 0,
          reminderSent: status === 'LATE',
          reminderCount: status === 'LATE' ? Math.floor(Math.random() * 3) + 1 : 0
        })

        // Ajouter les cautions (une seule fois)
        if (currentDate.getTime() === startDate.getTime()) {
          paymentsData.push({
            userId: booking.userId,
            bookingId: booking.id,
            amount: booking.securityDeposit,
            paymentType: 'DEPOSIT',
            status: 'PAID',
            dueDate: startDate,
            paidDate: startDate,
            isLate: false,
            lateDays: 0,
            reminderSent: false,
            reminderCount: 0
          })
        }

        currentDate.setMonth(currentDate.getMonth() + 1)
      }
    }

    // Insérer les paiements
    if (paymentsData.length > 0) {
      await prisma.payment.createMany({
        data: paymentsData
      })
    }

    console.log(`✅ Données générées avec succès !`)
    console.log(`   - ${rooms.length} chambres`)
    console.log(`   - ${tenants.filter(t => t.role === 'RESIDENT').length} locataires`)
    console.log(`   - ${bookings.length} réservations`)
    console.log(`   - ${paymentsData.length} paiements`)

  } catch (error) {
    console.error('❌ Erreur lors de la génération des données:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedPaymentsData()