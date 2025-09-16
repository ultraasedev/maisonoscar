// Helpers pour récupérer le contenu CMS

export async function getSiteSettings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/cms/settings`, {
      next: { revalidate: 3600 } // Cache pour 1 heure
    })
    
    if (res.ok) {
      const data = await res.json()
      return data.data
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error)
  }
  
  return {
    siteName: 'Maison Oscar',
    metaTitle: 'Maison Oscar - Colocation étudiante à Bruz',
    metaDescription: 'Découvrez nos chambres en colocation à Bruz, proche de Rennes.',
    contactEmail: 'contact@maisonoscar.fr',
    adminEmail: 'admin@maisonoscar.fr'
  }
}

export async function getContentSection(key: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/cms/content?key=${key}`, {
      next: { revalidate: 3600 } // Cache pour 1 heure
    })
    
    if (res.ok) {
      const data = await res.json()
      return data.data?.content ? JSON.parse(data.data.content) : null
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération de la section ${key}:`, error)
  }
  
  return null
}

export async function getLegalConfig() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/cms/legal-config`, {
      next: { revalidate: 3600 } // Cache pour 1 heure
    })
    
    if (res.ok) {
      const data = await res.json()
      return data.data
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de la configuration juridique:', error)
  }
  
  return {
    legalType: 'INDIVIDUAL',
    owners: []
  }
}

export async function getTestimonials() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/cms/testimonials`, {
      next: { revalidate: 3600 } // Cache pour 1 heure
    })
    
    if (res.ok) {
      const data = await res.json()
      return data.data
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des témoignages:', error)
  }
  
  return []
}