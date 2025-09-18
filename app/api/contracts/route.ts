import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  console.log('🔥 [API] GET /api/contracts appelée')

  try {
    const contracts = await prisma.contract.findMany({
      include: {
        booking: {
          include: {
            user: true,
            room: true
          }
        },
        signatures: true
      }
    })

    console.log(`🔥 [API] ${contracts.length} contrats trouvés`)

    return NextResponse.json({
      success: true,
      data: contracts
    })

  } catch (error) {
    console.error('🔥 [API] Erreur:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur serveur'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  console.log('🔥 [API] POST /api/contracts appelée')

  try {
    const body = await request.json()
    console.log('🔥 [API] Body:', body)

    // TODO: Créer le contrat

    return NextResponse.json({
      success: true,
      message: 'Contrat créé'
    })

  } catch (error) {
    console.error('🔥 [API] Erreur POST:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur création'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}