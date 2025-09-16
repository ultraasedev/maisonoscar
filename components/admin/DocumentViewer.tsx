'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, Download, Eye, X, Loader2, AlertCircle,
  Image as ImageIcon, FileIcon, ChevronLeft, ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'

interface DocumentViewerProps {
  documents: any
  isOpen: boolean
  onClose: () => void
}

export default function DocumentViewer({ documents, isOpen, onClose }: DocumentViewerProps) {
  const [currentDoc, setCurrentDoc] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)

  if (!documents || Object.keys(documents).length === 0) {
    return null
  }

  const docList = Object.entries(documents).filter(([key, value]) => value).map(([key, value]) => ({
    key,
    url: value as string,
    name: key.replace(/([A-Z])/g, ' $1').trim(),
    type: (value as string).includes('.pdf') ? 'pdf' : 'image'
  }))

  const handleDownload = async (url: string, name: string) => {
    try {
      setLoading(true)
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
      toast.success('Document téléchargé')
    } catch (error) {
      console.error('Erreur téléchargement:', error)
      toast.error('Erreur lors du téléchargement')
    } finally {
      setLoading(false)
    }
  }

  const handleView = (doc: any, index: number) => {
    setCurrentDoc(doc.url)
    setCurrentIndex(index)
  }

  const nextDoc = () => {
    const newIndex = (currentIndex + 1) % docList.length
    setCurrentIndex(newIndex)
    setCurrentDoc(docList[newIndex].url)
  }

  const prevDoc = () => {
    const newIndex = (currentIndex - 1 + docList.length) % docList.length
    setCurrentIndex(newIndex)
    setCurrentDoc(docList[newIndex].url)
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
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Documents du dossier
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              {!currentDoc ? (
                // Liste des documents
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {docList.map((doc, index) => (
                    <div
                      key={doc.key}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {doc.type === 'pdf' ? (
                          <FileText className="w-8 h-8 text-red-500" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-blue-500" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{doc.name}</p>
                          <p className="text-sm text-gray-500">
                            {doc.type === 'pdf' ? 'Document PDF' : 'Image'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(doc, index)}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                          title="Visualiser"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(doc.url, doc.name)}
                          disabled={loading}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                          title="Télécharger"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Visualisation du document
                <div className="relative">
                  <div className="mb-4 flex items-center justify-between">
                    <button
                      onClick={() => setCurrentDoc(null)}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Retour à la liste
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {currentIndex + 1} / {docList.length}
                      </span>
                      {docList.length > 1 && (
                        <>
                          <button
                            onClick={prevDoc}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={nextDoc}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Document viewer */}
                  <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ height: '60vh' }}>
                    {currentDoc.includes('.pdf') ? (
                      <iframe
                        src={currentDoc}
                        className="w-full h-full"
                        title="Document PDF"
                      />
                    ) : (
                      <img
                        src={currentDoc}
                        alt="Document"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleDownload(currentDoc, docList[currentIndex].name)}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Téléchargement...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Télécharger
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}