'use client'

import { useRef, useState, useEffect, MouseEvent, TouchEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, RefreshCw, Check, X, Edit3 } from 'lucide-react'

interface SignaturePadProps {
  isOpen: boolean
  onClose: () => void
  onSign: (signatureDataUrl: string) => void
  signerName: string
  documentTitle?: string
}

export const SignaturePad = ({
  isOpen,
  onClose,
  onSign,
  signerName,
  documentTitle = 'Contrat de location'
}: SignaturePadProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)

  useEffect(() => {
    if (canvasRef.current && isOpen) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      if (ctx) {
        // Configuration du canvas avec DPI scaling
        const rect = canvas.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1

        // Set canvas size with proper DPI scaling
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr

        // Scale the context to ensure correct drawing
        ctx.scale(dpr, dpr)

        // Set canvas CSS size back to original
        canvas.style.width = rect.width + 'px'
        canvas.style.height = rect.height + 'px'

        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 3

        setContext(ctx)
        clearCanvas()
      }
    }
  }, [isOpen])

  const clearCanvas = () => {
    if (canvasRef.current && context) {
      const canvas = canvasRef.current
      context.clearRect(0, 0, canvas.width, canvas.height)

      // Fond blanc
      context.fillStyle = 'white'
      context.fillRect(0, 0, canvas.width, canvas.height)

      // Ligne de signature
      context.strokeStyle = '#e5e7eb'
      context.lineWidth = 1
      context.beginPath()
      const rect = canvas.getBoundingClientRect()
      context.moveTo(20, rect.height - 40)
      context.lineTo(rect.width - 20, rect.height - 40)
      context.stroke()

      // Texte indicatif
      context.font = '12px system-ui'
      context.fillStyle = '#9ca3af'
      context.fillText('Signez ci-dessus', rect.width / 2 - 40, rect.height - 20)

      // Reset style pour signature
      context.strokeStyle = '#000000'
      context.lineWidth = 3

      setHasSignature(false)
    }
  }

  const getCoordinates = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()

    let clientX, clientY
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = clientX - rect.left
    const y = clientY - rect.top

    return { x, y }
  }

  const startDrawing = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    if (!context) return

    const { x, y } = getCoordinates(e)
    context.beginPath()
    context.moveTo(x, y)
    setIsDrawing(true)
    setHasSignature(true)

    // Empêcher le scroll sur mobile
    if ('touches' in e) {
      e.preventDefault()
    }
  }

  const draw = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return

    const { x, y } = getCoordinates(e)
    context.lineTo(x, y)
    context.stroke()

    // Empêcher le scroll sur mobile
    if ('touches' in e) {
      e.preventDefault()
    }
  }

  const stopDrawing = () => {
    if (!context) return
    context.closePath()
    setIsDrawing(false)
  }

  const handleSign = () => {
    if (!canvasRef.current || !hasSignature) {
      alert('Veuillez d\'abord signer avant de valider.')
      return
    }

    const dataUrl = canvasRef.current.toDataURL('image/png')
    onSign(dataUrl)
  }

  const downloadSignature = () => {
    if (!canvasRef.current || !hasSignature) return

    const dataUrl = canvasRef.current.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `signature_${signerName.replace(/\s+/g, '_')}_${Date.now()}.png`
    link.href = dataUrl
    link.click()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Signature électronique</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {documentTitle} - Signataire : {signerName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Canvas de signature */}
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={300}
                  className="w-full h-64 cursor-crosshair touch-none block"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  style={{ touchAction: 'none' }}
                />
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Edit3 className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Instructions :</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>Utilisez votre souris ou votre doigt pour signer</li>
                      <li>La signature doit être claire et lisible</li>
                      <li>Vous pouvez effacer et recommencer si nécessaire</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={clearCanvas}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Effacer
                </button>

                <button
                  onClick={downloadSignature}
                  disabled={!hasSignature}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>

                <button
                  onClick={handleSign}
                  disabled={!hasSignature}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  Valider la signature
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}