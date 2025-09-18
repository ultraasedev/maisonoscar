// Test direct de l'API contracts
async function testAPI() {
  try {
    console.log('🔍 Test de l\'API /api/contracts...')

    const response = await fetch('http://localhost:3001/api/contracts')
    const data = await response.json()

    console.log('📊 Statut:', response.status)
    console.log('📄 Réponse:', JSON.stringify(data, null, 2))

    if (data.success && data.data) {
      console.log(`✅ ${data.data.length} contrat(s) trouvé(s)`)
      data.data.forEach((contract, index) => {
        console.log(`${index + 1}. ${contract.contractNumber} - ${contract.booking?.user?.firstName} ${contract.booking?.user?.lastName}`)
      })
    } else {
      console.log('❌ Aucun contrat ou erreur')
    }

  } catch (error) {
    console.error('❌ Erreur API:', error.message)
  }
}

testAPI()