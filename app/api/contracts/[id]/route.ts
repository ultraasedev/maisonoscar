import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const contractId = id

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        booking: {
          include: {
            room: true,
            user: true
          }
        },
        signatures: true
      }
    })

    if (!contract) {
      return NextResponse.json(
        { success: false, error: 'Contrat non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      contract: contract
    })

  } catch (error) {
    console.error('Erreur récupération contrat:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du contrat' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const contractId = id
    const updates = await request.json()

    const contract = await prisma.contract.update({
      where: { id: contractId },
      data: updates,
      include: {
        booking: {
          include: {
            room: true,
            user: true
          }
        },
        signatures: true
      }
    })

    return NextResponse.json({
      success: true,
      contract: contract
    })

  } catch (error) {
    console.error('Erreur mise à jour contrat:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du contrat' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const contractId = id

    console.log('🗑️ [API] Suppression du contrat:', contractId)

    // Supprimer d'abord toutes les signatures liées
    await prisma.contractSignature.deleteMany({
      where: { contractId }
    })
    console.log('✅ [API] Signatures supprimées')

    // Supprimer le contrat
    await prisma.contract.delete({
      where: { id: contractId }
    })
    console.log('✅ [API] Contrat supprimé')

    return NextResponse.json({
      success: true,
      message: 'Contrat supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur suppression contrat:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du contrat' },
      { status: 500 }
    )
  }
}