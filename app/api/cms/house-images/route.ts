import { NextRequest, NextResponse } from 'next/server'
import { readdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// GET - Récupérer les images existantes de la maison
export async function GET(request: NextRequest) {
  try {
    const houseImagesDir = path.join(process.cwd(), 'public', 'images', 'house')

    // Vérifier si le dossier existe
    if (!existsSync(houseImagesDir)) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    // Lire les fichiers du dossier
    const files = await readdir(houseImagesDir)

    // Filtrer pour ne garder que les images
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    const imageFiles = files.filter(file =>
      imageExtensions.some(ext => file.toLowerCase().endsWith(ext))
    )

    // Construire les objets d'images avec métadonnées par défaut
    const images = imageFiles.map(file => ({
      url: `/images/house/${file}`,
      title: file.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '), // Enlever l'extension et remplacer - et _ par des espaces
      description: `Image de la maison ${file.replace(/\.[^/.]+$/, "")}`
    }))

    return NextResponse.json({
      success: true,
      data: images
    })

  } catch (error) {
    console.error('Erreur GET /api/cms/house-images:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des images' },
      { status: 500 }
    )
  }
}

// POST - Mettre à jour les métadonnées des images
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { images } = body

    if (!Array.isArray(images)) {
      return NextResponse.json(
        { success: false, error: 'Format de données invalide' },
        { status: 400 }
      )
    }

    // Ici on pourrait sauvegarder les métadonnées en base de données
    // Pour l'instant, on se contente de retourner les données

    return NextResponse.json({
      success: true,
      data: images,
      message: 'Métadonnées des images mises à jour'
    })

  } catch (error) {
    console.error('Erreur POST /api/cms/house-images:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}