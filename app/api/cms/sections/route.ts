import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const SECTIONS_FILE = path.join(process.cwd(), '.sections.json')

// Structure par défaut des sections
const defaultSections = {
  hero: {
    title: "Votre nouvelle maison",
    subtitle: "en colocation à Bruz",
    description: "Découvrez une nouvelle façon de vivre en communauté dans notre maison de charme, où chaque espace a été pensé pour favoriser le partage et le bien-être.",
    cta1: "Découvrir nos chambres",
    cta2: "Réserver une visite"
  },
  problemSolution: {
    title: "Le co-living réinventé",
    subtitle: "pour créer des liens",
    problems: [
      {
        title: "Solitude en location",
        description: "Vivre seul peut être isolant et coûteux"
      },
      {
        title: "Espaces impersonnels",
        description: "Les logements classiques manquent d'âme"
      },
      {
        title: "Charges élevées",
        description: "Les frais s'accumulent rapidement"
      }
    ],
    solutions: [
      {
        title: "Communauté bienveillante",
        description: "Partagez des moments authentiques"
      },
      {
        title: "Maison de caractère",
        description: "Un lieu chaleureux et accueillant"
      },
      {
        title: "Tout inclus",
        description: "Une formule simple et transparente"
      }
    ]
  },
  house: {
    title: "Notre maison",
    subtitle: "votre nouveau chez-vous",
    description: "Une maison de caractère avec jardin, située à Bruz, à seulement 15 minutes de Rennes.",
    features: [
      {
        icon: "home",
        value: "180m²",
        label: "Surface habitable"
      },
      {
        icon: "users",
        value: "9",
        label: "Chambres"
      },
      {
        icon: "tree",
        value: "500m²",
        label: "Jardin"
      },
      {
        icon: "car",
        value: "15min",
        label: "De Rennes"
      }
    ],
    amenities: [
      "Cuisine équipée moderne",
      "Grand salon lumineux",
      "Jardin aménagé",
      "Parking sécurisé",
      "Buanderie",
      "Espace coworking",
      "Salle de sport",
      "Local vélos"
    ]
  },
  commonSpaces: {
    title: "Espaces communs inclus",
    items: [
      {
        title: "Cuisine moderne",
        description: "Équipée et spacieuse"
      },
      {
        title: "Salon connecté",
        description: "Fibre et Netflix inclus"
      },
      {
        title: "Parking sécurisé",
        description: "Places garanties"
      },
      {
        title: "Ménage inclus",
        description: "Parties communes"
      }
    ]
  }
}

// GET - Récupérer les sections
export async function GET() {
  try {
    const fileExists = await fs.access(SECTIONS_FILE).then(() => true).catch(() => false)
    
    if (!fileExists) {
      return NextResponse.json({
        success: true,
        data: defaultSections
      })
    }
    
    const content = await fs.readFile(SECTIONS_FILE, 'utf-8')
    const sections = JSON.parse(content)
    
    return NextResponse.json({
      success: true,
      data: sections
    })
  } catch (error) {
    console.error('Erreur GET /api/cms/sections:', error)
    return NextResponse.json({
      success: true,
      data: defaultSections
    })
  }
}

// POST - Mettre à jour les sections
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Fusionner avec les sections par défaut pour éviter les données manquantes
    const sections = {
      ...defaultSections,
      ...body
    }
    
    // Écrire dans le fichier
    await fs.writeFile(SECTIONS_FILE, JSON.stringify(sections, null, 2))
    
    return NextResponse.json({
      success: true,
      data: sections,
      message: 'Sections mises à jour avec succès'
    })
  } catch (error) {
    console.error('Erreur POST /api/cms/sections:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}