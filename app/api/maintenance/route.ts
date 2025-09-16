import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'

const MAINTENANCE_FILE = path.join(process.cwd(), '.maintenance.json')

// GET - Vérifier le statut de maintenance
export async function GET() {
  try {
    const fileExists = await fs.access(MAINTENANCE_FILE).then(() => true).catch(() => false)
    
    if (!fileExists) {
      return NextResponse.json({
        success: true,
        data: {
          enabled: false,
          message: ''
        }
      })
    }
    
    const content = await fs.readFile(MAINTENANCE_FILE, 'utf-8')
    const data = JSON.parse(content)
    
    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Erreur GET /api/maintenance:', error)
    return NextResponse.json({
      success: true,
      data: {
        enabled: false,
        message: ''
      }
    })
  }
}

// POST - Activer/Désactiver le mode maintenance
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { enabled, message } = body
    
    const data = {
      enabled: Boolean(enabled),
      message: message || 'Le site est actuellement en maintenance. Nous serons bientôt de retour.',
      updatedAt: new Date().toISOString(),
      updatedBy: session.user.email
    }
    
    // Écrire dans le fichier
    await fs.writeFile(MAINTENANCE_FILE, JSON.stringify(data, null, 2))
    
    return NextResponse.json({
      success: true,
      data,
      message: enabled ? 'Mode maintenance activé' : 'Mode maintenance désactivé'
    })
  } catch (error) {
    console.error('Erreur POST /api/maintenance:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}