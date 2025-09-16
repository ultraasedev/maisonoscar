import { jsPDF } from 'jspdf'

interface ContractData {
  [key: string]: string
}

export const generateContractPDF = (
  template: string,
  data: ContractData,
  filename: string = 'contrat.pdf'
): string => {
  const doc = new jsPDF()
  
  let processedContent = template
  
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    processedContent = processedContent.replace(regex, value)
  })
  
  const lines = doc.splitTextToSize(processedContent, 170)
  
  const pageHeight = doc.internal.pageSize.height
  let y = 20
  
  lines.forEach((line: string) => {
    if (y > pageHeight - 20) {
      doc.addPage()
      y = 20
    }
    
    if (line.includes('**')) {
      const boldText = line.replace(/\*\*/g, '')
      doc.setFont('helvetica', 'bold')
      doc.text(boldText, 20, y)
      doc.setFont('helvetica', 'normal')
    } else if (line.startsWith('##')) {
      const headerText = line.replace('## ', '')
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(headerText, 20, y)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
    } else {
      doc.text(line, 20, y)
    }
    
    y += 7
  })
  
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