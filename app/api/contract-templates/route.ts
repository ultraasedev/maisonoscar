import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const CreateTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
  pdfData: z.string(), // Base64 PDF data
})

// GET - Récupérer les templates de contrat
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const templates = await prisma.contractTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: templates
    })
  } catch (error) {
    console.error('Erreur GET /api/contract-templates:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des templates' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau template
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = CreateTemplateSchema.parse(body)

    // Si ce template est marqué comme défaut, enlever le statut défaut des autres
    if (validatedData.isDefault) {
      await prisma.contractTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      })
    }

    const template = await prisma.contractTemplate.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        isDefault: validatedData.isDefault || false,
        pdfData: validatedData.pdfData,
        createdById: session.user.id
      }
    })

    return NextResponse.json({
      success: true,
      data: template,
      message: 'Template créé avec succès'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erreur POST /api/contract-templates:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du template' },
      { status: 500 }
    )
  }
}