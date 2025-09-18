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

    console.log('✅ [API] Activation du contrat:', contractId)

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

    // Mettre à jour le statut
    const updatedContract = await prisma.contract.update({
      where: { id: contractId },
      data: {
        status: 'ACTIVE',
        signedAt: new Date() // Optionnel: marquer comme signé
      }
    })

    console.log('✅ [API] Contrat activé:', updatedContract.contractNumber)

    return NextResponse.json({
      success: true,
      message: 'Contrat activé avec succès'
    })

  } catch (error) {
    console.error('Erreur activation contrat:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'activation du contrat' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}