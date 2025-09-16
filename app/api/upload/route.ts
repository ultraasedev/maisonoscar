// API pour l'upload d'images localement

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string || 'rooms'
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Le fichier doit être une image' },
        { status: 400 }
      )
    }

    // Limiter la taille à 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Le fichier est trop volumineux (max 5MB)' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Créer un nom de fichier unique
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const filename = `${timestamp}-${randomString}.${extension}`
    
    // Définir le chemin de destination
    const uploadDir = path.join(process.cwd(), 'public', 'images', type)
    
    // Créer le dossier s'il n'existe pas
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    
    const filepath = path.join(uploadDir, filename)
    
    // Écrire le fichier
    await writeFile(filepath, buffer)
    
    // Retourner l'URL publique
    const publicUrl = `/images/${type}/${filename}`
    
    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        filename: filename,
        size: file.size,
        type: file.type
      }
    })
    
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'upload du fichier' },
      { status: 500 }
    )
  }
}

// Endpoint pour supprimer une image
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    
    if (!imageUrl || !imageUrl.startsWith('/images/')) {
      return NextResponse.json(
        { success: false, error: 'URL invalide' },
        { status: 400 }
      )
    }
    
    const filepath = path.join(process.cwd(), 'public', imageUrl)
    
    // Vérifier que le fichier existe
    if (!existsSync(filepath)) {
      return NextResponse.json(
        { success: false, error: 'Fichier introuvable' },
        { status: 404 }
      )
    }
    
    // Supprimer le fichier
    const { unlink } = await import('fs/promises')
    await unlink(filepath)
    
    return NextResponse.json({
      success: true,
      message: 'Image supprimée avec succès'
    })
    
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du fichier' },
      { status: 500 }
    )
  }
}