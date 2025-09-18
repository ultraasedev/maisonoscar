'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import jwt from 'jsonwebtoken'
import { toast } from 'sonner'
// Composant simple pour la signature
const SimpleSignaturePad = ({ onSignatureChange, disabled }: { onSignatureChange: (sig: string) => void, disabled: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const startDrawing = (e: any) => {
    if (disabled) return
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e: any) => {
    if (!isDrawing || disabled) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!isDrawing || disabled) return
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (!canvas) return
    onSignatureChange(canvas.toDataURL())
  }

  const clearSignature = () => {
    if (disabled) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    onSignatureChange('')
  }

  return (
    <div className="border border-gray-300 rounded-lg p-4">
      <div className="mb-2 flex justify-between items-center">
        <span className="text-sm text-gray-600">Signez dans le cadre ci-dessous</span>
        <button
          type="button"
          onClick={clearSignature}
          disabled={disabled}
          className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          Effacer
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={400}
        height={150}
        className="border border-gray-200 rounded cursor-crosshair w-full"
        style={{ touchAction: 'none' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  )
}
import { FileText, Download, User, Calendar, Euro, Shield } from 'lucide-react'

interface ContractData {
  id: string
  contractNumber: string
  startDate: string
  endDate: string
  monthlyRent: number
  deposit: number
  charges: number
  pdfUrl?: string
  booking: {
    room: {
      name: string
      number: number
    }
    bookingRequest: {
      firstName: string
      lastName: string
      email: string
    }
  }
}

interface TokenData {
  contractId: string
  signerEmail: string
  signerName: string
  signerRole: string
}

export default function SignContractPage() {
  const params = useParams()
  const router = useRouter()
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [contractData, setContractData] = useState<ContractData | null>(null)
  const [signature, setSignature] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSigning, setIsSigning] = useState(false)
  const [step, setStep] = useState<'review' | 'sign' | 'complete'>('review')
  const [acceptTerms, setAcceptTerms] = useState(false)

  useEffect(() => {
    verifyTokenAndLoadContract()
  }, [])

  const verifyTokenAndLoadContract = async () => {
    try {
      const token = params.token as string

      // Décoder le token
      const decoded = jwt.decode(token) as TokenData
      if (!decoded) {
        throw new Error('Token invalide')
      }

      // Vérifier si le contrat existe et récupérer les données
      const response = await fetch(`/api/contracts/${decoded.contractId}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Contrat non trouvé')
      }

      // Vérifier si ce signataire a déjà signé
      const signatureResponse = await fetch(`/api/contracts/${decoded.contractId}/signatures`)
      const signatureData = await signatureResponse.json()

      if (signatureData.success) {
        const existingSignature = signatureData.signatures.find(
          (sig: any) => sig.signerEmail === decoded.signerEmail
        )

        if (existingSignature) {
          setStep('complete')
        }
      }

      setTokenData(decoded)
      setContractData(data.contract)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Lien de signature invalide ou expiré')
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignContract = async () => {
    if (!signature || !acceptTerms) {
      toast.error('Veuillez signer le contrat et accepter les conditions')
      return
    }

    setIsSigning(true)

    try {
      const response = await fetch(`/api/contracts/${tokenData?.contractId}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: params.token,
          signatureData: signature,
          signerName: tokenData?.signerName,
          signerEmail: tokenData?.signerEmail,
          signerRole: tokenData?.signerRole
        })
      })

      const data = await response.json()

      if (data.success) {
        setStep('complete')
        toast.success('Contrat signé avec succès !')
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Erreur signature:', error)
      toast.error('Erreur lors de la signature')
    } finally {
      setIsSigning(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p>Chargement du contrat...</p>
        </div>
      </div>
    )
  }

  if (!tokenData || !contractData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
          <p>Impossible de charger le contrat</p>
        </div>
      </div>
    )
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Contrat signé !
          </h1>
          <p className="text-gray-600 mb-6">
            Votre signature a été enregistrée avec succès. Vous recevrez une copie du contrat finalisé par email.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Signature de contrat
          </h1>
          <p className="text-gray-600">
            {tokenData.signerName} • {tokenData.signerRole === 'TENANT' ? 'Locataire principal' : 'Colocataire'}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Informations du contrat */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Détails du contrat
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">{contractData.booking.room.name}</p>
                  <p className="text-sm text-gray-600">Chambre #{contractData.booking.room.number}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">
                    {new Date(contractData.startDate).toLocaleDateString('fr-FR')} - {new Date(contractData.endDate).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-sm text-gray-600">Période de location</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Euro className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">{contractData.monthlyRent}€ + {contractData.charges}€ de charges</p>
                  <p className="text-sm text-gray-600">Loyer mensuel</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Shield className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium">{contractData.deposit}€</p>
                  <p className="text-sm text-gray-600">Dépôt de garantie</p>
                </div>
              </div>
            </div>

            {contractData.pdfUrl && (
              <div className="mt-6">
                <a
                  href={contractData.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors w-fit"
                >
                  <Download className="w-4 h-4" />
                  Télécharger le contrat
                </a>
              </div>
            )}
          </div>

          {/* Zone de signature */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Signature électronique
            </h2>

            <div className="space-y-6">
              <SimpleSignaturePad
                onSignatureChange={setSignature}
                disabled={isSigning}
              />

              <div className="space-y-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm text-gray-700">
                    J'accepte les termes et conditions de ce contrat de location et confirme que ma signature électronique a la même valeur légale qu'une signature manuscrite.
                  </span>
                </label>

                <button
                  onClick={handleSignContract}
                  disabled={!signature || !acceptTerms || isSigning}
                  className="w-full px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSigning ? 'Signature en cours...' : 'Signer le contrat'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}