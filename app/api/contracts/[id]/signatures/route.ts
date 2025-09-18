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

    const signatures = await prisma.contractSignature.findMany({
      where: { contractId: contractId },
      orderBy: { signedAt: 'asc' }
    })

    return NextResponse.json({
      success: true,
      signatures: signatures
    })

  } catch (error) {
    console.error('Erreur récupération signatures:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des signatures' },
      { status: 500 }
    )
  }
}