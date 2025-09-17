import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema pour les propriétaires (nom propre)
const OwnerSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal(''))
})

// Schema de validation pour la configuration juridique
const LegalConfigSchema = z.object({
  legalType: z.enum(['INDIVIDUAL', 'COMPANY']),
  // Si nom propre
  owners: z.array(OwnerSchema).optional(),
  // Si entreprise
  companyName: z.string().optional(),
  tradeName: z.string().optional(),
  legalForm: z.string().optional(),
  siret: z.string().optional(),
  capital: z.number().optional(),
  rcsNumber: z.string().optional(),
  vatNumber: z.string().optional(),
  // Adresse du siège
  legalAddress: z.string().optional(),
  legalCity: z.string().optional(),
  legalZipCode: z.string().optional(),
  legalCountry: z.string().optional(),
  // Coordonnées bancaires
  bankName: z.string().optional(),
  iban: z.string().optional(),
  bic: z.string().optional()
})

// GET - Récupérer la configuration juridique
export async function GET(request: NextRequest) {
  try {
    let config = await prisma.legalConfig.findFirst()
    
    // Si aucune config n'existe, créer une config par défaut
    if (!config) {
      config = await prisma.legalConfig.create({
        data: {
          legalType: 'INDIVIDUAL',
          owners: JSON.stringify([])
        }
      })
    }
    
    // Parser le JSON des propriétaires
    const parsedConfig = {
      ...config,
      owners: config.owners ? JSON.parse(config.owners as string) : []
    }
    
    return NextResponse.json({
      success: true,
      data: parsedConfig
    })
    
  } catch (error) {
    console.error('Erreur GET /api/cms/legal-config:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de la configuration' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour la configuration juridique
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = LegalConfigSchema.parse(body)
    
    // Validation supplémentaire selon le type
    if (validatedData.legalType === 'INDIVIDUAL') {
      if (!validatedData.owners || validatedData.owners.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Au moins un propriétaire doit être défini' },
          { status: 400 }
        )
      }
    } else if (validatedData.legalType === 'COMPANY') {
      if (!validatedData.companyName || !validatedData.siret) {
        return NextResponse.json(
          { success: false, error: 'Le nom et le SIRET de l\'entreprise sont requis' },
          { status: 400 }
        )
      }
    }
    
    // Récupérer l'ID de la config existante
    const existing = await prisma.legalConfig.findFirst()
    
    // Préparer les données avec JSON stringifié pour owners
    const dataToSave = {
      ...validatedData,
      owners: validatedData.owners ? JSON.stringify(validatedData.owners) : null
    }
    
    let config
    if (existing) {
      // Mettre à jour la config existante
      config = await prisma.legalConfig.update({
        where: { id: existing.id },
        data: dataToSave
      })
    } else {
      // Créer une nouvelle config
      config = await prisma.legalConfig.create({
        data: dataToSave
      })
    }
    
    // Parser le JSON pour la réponse
    const parsedConfig = {
      ...config,
      owners: config.owners ? JSON.parse(config.owners as string) : []
    }
    
    return NextResponse.json({
      success: true,
      data: parsedConfig,
      message: 'Configuration juridique mise à jour avec succès'
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données invalides',
          details: error.issues
        },
        { status: 400 }
      )
    }
    
    console.error('Erreur PUT /api/cms/legal-config:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de la configuration' },
      { status: 500 }
    )
  }
}