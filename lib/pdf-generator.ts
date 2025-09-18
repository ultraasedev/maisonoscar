import { jsPDF } from 'jspdf'

interface ContractData {
  [key: string]: string
}

// Fonction pour traiter les signatures dans le contenu
const processSignatures = (doc: any, content: string, data: ContractData): string => {
  let processedContent = content

  // Chercher tous les placeholders de signature
  const signatureRegex = /\[SIGNATURE:([^\]]+)\]/g
  let match

  while ((match = signatureRegex.exec(content)) !== null) {
    const [placeholder, signatureKey] = match

    // Vérifier si on a des données de signature pour cette clé
    const signatureData = data[signatureKey]

    if (signatureData && signatureData.startsWith('data:image/')) {
      // Remplacer par un placeholder spécial que nous traiterons lors du rendu
      processedContent = processedContent.replace(placeholder, `\n\n[IMAGE_SIGNATURE:${signatureKey}]\n\n`)
    } else {
      // Pas de signature, remplacer par un espace pour signature manuscrite
      processedContent = processedContent.replace(placeholder, '\n\n_______________________\n(Signature manuscrite)\n\n')
    }
  }

  return processedContent
}

export const generateContractPDF = (
  template: string,
  data: ContractData,
  filename: string = 'contrat.pdf'
): string => {
  const doc = new jsPDF()

  // Configuration des polices et styles
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)

  let processedContent = template

  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')

    // Gérer les signatures spécialement (images base64)
    if (key.includes('SIGNATURE') && value && typeof value === 'string' && value.startsWith('data:image/')) {
      // Remplacer par un placeholder spécial que nous traiterons plus tard
      processedContent = processedContent.replace(regex, `[SIGNATURE:${key}]`)
    } else {
      processedContent = processedContent.replace(regex, value || '')
    }
  })

  // Traiter les signatures avant de diviser en lignes
  const signatureProcessedContent = processSignatures(doc, processedContent, data)

  // Améliorer la mise en forme avec des marges professionnelles
  const pageWidth = doc.internal.pageSize.width
  const margin = 20
  const textWidth = pageWidth - (margin * 2)

  const lines = doc.splitTextToSize(signatureProcessedContent, textWidth)

  const pageHeight = doc.internal.pageSize.height
  let y = 30 // Plus d'espace en haut
  let currentPage = 1

  // Ajouter un en-tête professionnel
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  const title = 'CONTRAT DE LOCATION EN COLOCATION'
  const titleWidth = doc.getTextWidth(title)
  const titleX = (pageWidth - titleWidth) / 2
  doc.text(title, titleX, 20)

  // Ligne de séparation
  doc.setLineWidth(0.5)
  doc.line(margin, 25, pageWidth - margin, 25)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  y = 35

  // Function to add initials on page
  const addInitialsToPage = (pageNumber: number) => {
    // Don't add initials on the last page (signature page)
    const totalPages = Math.ceil(lines.length / Math.floor((pageHeight - 40) / 7))
    if (pageNumber === totalPages) return

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')

    // Get tenant initials from data
    const tenantName = data.TENANT_NAME || ''
    const tenantInitials = tenantName.split(' ').map(n => n.charAt(0)).join('').toUpperCase()

    // Get roommate initials if available
    const roommateInitials: string[] = []
    for (let i = 1; i <= 5; i++) {
      const roommateName = data[`ROOMMATE_${i}_NAME`]
      if (roommateName) {
        const initials = roommateName.split(' ').map(n => n.charAt(0)).join('').toUpperCase()
        roommateInitials.push(initials)
      }
    }

    // Landlord initials (default Maison Oscar owners)
    const landlordInitials = ['AL', 'JL'] // Aurélien L. and Julien L.

    // Position for initials (bottom right of page)
    const initialsY = pageHeight - 15
    let initialsX = 140

    // Add tenant initials
    doc.text(`Locataire: ${tenantInitials}`, initialsX, initialsY)
    initialsX += 25

    // Add roommate initials
    roommateInitials.forEach((initials, index) => {
      doc.text(`Coloc.${index + 1}: ${initials}`, initialsX, initialsY)
      initialsX += 25
    })

    // Add landlord initials
    landlordInitials.forEach((initials, index) => {
      doc.text(`Prop.${index + 1}: ${initials}`, initialsX, initialsY)
      initialsX += 20
    })

    // Add page number
    doc.text(`Page ${pageNumber}`, 20, initialsY)
  }

  lines.forEach((line: string) => {
    if (y > pageHeight - 60) {
      // Add initials to current page before adding new page
      addInitialsToPage(currentPage)
      doc.addPage()
      currentPage++
      y = 35

      // Répéter l'en-tête sur chaque page
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('CONTRAT DE LOCATION - Page ' + currentPage, margin, 20)
      doc.setLineWidth(0.3)
      doc.line(margin, 25, pageWidth - margin, 25)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
    }

    // Traiter les signatures d'image
    if (line.includes('[IMAGE_SIGNATURE:')) {
      const signatureMatch = line.match(/\[IMAGE_SIGNATURE:([^\]]+)\]/)
      if (signatureMatch) {
        const signatureKey = signatureMatch[1]
        const signatureData = data[signatureKey]

        if (signatureData && signatureData.startsWith('data:image/')) {
          try {
            // Ajouter l'image de signature avec bordure
            y += 5
            doc.setLineWidth(0.2)
            doc.rect(margin, y - 2, 60, 25)
            doc.addImage(signatureData, 'PNG', margin + 2, y, 56, 20)
            y += 28
          } catch (error) {
            console.warn('Erreur lors de l\'ajout de la signature:', error)
            doc.setFont('helvetica', 'italic')
            doc.text('(Signature électronique)', margin, y)
            doc.setFont('helvetica', 'normal')
            y += 8
          }
        } else {
          doc.text('_______________________', margin, y)
          y += 8
          doc.setFont('helvetica', 'italic')
          doc.text('(Signature manuscrite)', margin, y)
          doc.setFont('helvetica', 'normal')
          y += 8
        }
      }
    } else if (line.includes('**')) {
      const boldText = line.replace(/\*\*/g, '')
      doc.setFont('helvetica', 'bold')
      doc.text(boldText, margin, y)
      doc.setFont('helvetica', 'normal')
      y += 8
    } else if (line.startsWith('##')) {
      const headerText = line.replace('## ', '')
      y += 5 // Espacement avant les titres
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text(headerText, margin, y)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      y += 10
    } else if (line.startsWith('===')) {
      // Ignorer les lignes de séparation markdown
      return
    } else if (line.trim() !== '') {
      doc.text(line, margin, y)
      y += 6
    } else {
      // Ligne vide - espacement réduit
      y += 4
    }
  })

  // Add initials to the last page only if it's not the signature page
  const totalPages = doc.getNumberOfPages()
  if (totalPages > 1) {
    addInitialsToPage(currentPage)
  }

  // Télécharger le PDF
  doc.save(filename)

  // Retourner aussi le PDF en base64 si besoin
  const pdfOutput = doc.output('datauristring')
  return pdfOutput
}

export const downloadContractPDF = async (
  contractId: string,
  tenantData: ContractData
): Promise<void> => {
  try {
    const response = await fetch(`/api/contracts/${contractId}`)
    const contract = await response.json()
    
    if (!contract.success) {
      throw new Error('Erreur lors de la récupération du contrat')
    }
    
    const filename = `contrat_${tenantData.TENANT_NAME?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    
    generateContractPDF(contract.data.content, tenantData, filename)
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error)
    throw error
  }
}