import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const contractId = id

    // Vérifier que le contrat existe
    const contract = await prisma.contract.findUnique({
      where: { id: contractId }
    })

    if (!contract) {
      return NextResponse.json(
        { success: false, error: 'Contrat non trouvé' },
        { status: 404 }
      )
    }

    console.log('⭐ [API] Définition comme défaut:', contractId)

    // 1. Désactiver tous les templates par défaut existants
    await prisma.contractTemplate.updateMany({
      where: { isDefault: true },
      data: { isDefault: false }
    })
    console.log('📄 [API] Anciens templates par défaut désactivés')

    // 2. Créer un nouveau template basé sur ce contrat
    const contractWithData = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        booking: {
          include: {
            user: true,
            room: true
          }
        }
      }
    })

    if (!contractWithData) {
      throw new Error('Contrat non trouvé pour créer le template')
    }

    // 3. Créer le template par défaut
    await prisma.contractTemplate.create({
      data: {
        name: `Template basé sur ${contractWithData.contractNumber}`,
        description: `Template créé automatiquement depuis le contrat ${contractWithData.contractNumber}`,
        pdfData: contractWithData.pdfUrl || '',
        isDefault: true,
        createdById: contractWithData.booking.user.id
      }
    })
    console.log('✅ [API] Nouveau template par défaut créé')

    return NextResponse.json({
      success: true,
      message: 'Contrat défini comme modèle par défaut'
    })

  } catch (error) {
    console.error('Erreur définition défaut:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la définition comme défaut' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}