'use client'

import { useState, useEffect } from 'react'
import { Plus, Upload, FileText, Trash2, Star, StarOff, Download, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface ContractTemplate {
  id: string
  name: string
  description?: string
  isDefault: boolean
  pdfData: string
  createdAt: string
  updatedAt: string
  createdBy?: {
    firstName: string
    lastName: string
    email: string
  }
}

interface ContractTemplateManagerProps {
  onTemplateSelect?: (template: ContractTemplate) => void
  compact?: boolean
}

export const ContractTemplateManager = ({ onTemplateSelect, compact = false }: ContractTemplateManagerProps) => {
  const [templates, setTemplates] = useState<ContractTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [isDefaultTemplate, setIsDefaultTemplate] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/contract-templates')
      const data = await response.json()

      if (data.success) {
        setTemplates(data.data)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error)
      toast.error('Erreur lors du chargement des templates')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Veuillez sélectionner un fichier PDF')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !templateName.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setIsUploading(true)

    try {
      // Convertir le fichier en base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          resolve(result.split(',')[1]) // Enlever le préfixe data:application/pdf;base64,
        }
        reader.onerror = reject
        reader.readAsDataURL(selectedFile)
      })

      const response = await fetch('/api/contract-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: templateName.trim(),
          description: templateDescription.trim() || undefined,
          isDefault: isDefaultTemplate,
          pdfData: `data:application/pdf;base64,${base64Data}`
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Template uploadé avec succès')
        setShowUploadModal(false)
        resetForm()
        fetchTemplates()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      toast.error('Erreur lors de l\'upload du template')
    } finally {
      setIsUploading(false)
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setTemplateName('')
    setTemplateDescription('')
    setIsDefaultTemplate(false)
  }

  const handleSetDefault = async (templateId: string) => {
    try {
      const response = await fetch(`/api/contract-templates/${templateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isDefault: true
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Template défini par défaut')
        fetchTemplates()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (templateId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      return
    }

    try {
      const response = await fetch(`/api/contract-templates/${templateId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Template supprimé')
        fetchTemplates()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleDownload = (template: ContractTemplate) => {
    const link = document.createElement('a')
    link.href = template.pdfData
    link.download = `${template.name}.pdf`
    link.click()
  }

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Templates de contrat</h3>
          <Button
            onClick={() => setShowUploadModal(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-4">Chargement...</div>
        ) : (
          <div className="grid gap-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                onClick={() => onTemplateSelect?.(template)}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {template.name}
                      {template.isDefault && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                    </div>
                    {template.description && (
                      <div className="text-sm text-gray-600">{template.description}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownload(template)
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal d'upload */}
        <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nouveau template de contrat</DialogTitle>
              <DialogDescription>
                Uploadez un fichier PDF qui servira de modèle de contrat
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du template *</Label>
                <Input
                  id="name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Ex: Contrat Standard 2024"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Description optionnelle..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="pdf-file">Fichier PDF *</Label>
                <Input
                  id="pdf-file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                />
                {selectedFile && (
                  <div className="text-sm text-gray-600 mt-1">
                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="default"
                  checked={isDefaultTemplate}
                  onCheckedChange={setIsDefaultTemplate}
                />
                <Label htmlFor="default">Définir comme template par défaut</Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || !selectedFile || !templateName.trim()}
                  className="flex-1"
                >
                  {isUploading ? 'Upload...' : 'Créer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Templates de contrat</h2>
          <p className="text-gray-600">Gérez vos modèles de contrats PDF</p>
        </div>
        <Button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouveau template
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Chargement des templates...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun template</h3>
              <p className="text-gray-600 mb-4">Commencez par uploader votre premier modèle de contrat</p>
              <Button onClick={() => setShowUploadModal(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Uploader un template
              </Button>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className="border rounded-lg p-6 bg-white hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-medium">{template.name}</h3>
                        {template.isDefault && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                            <Star className="w-3 h-3 fill-current" />
                            Défaut
                          </div>
                        )}
                      </div>
                      {template.description && (
                        <p className="text-gray-600 mb-2">{template.description}</p>
                      )}
                      <div className="text-sm text-gray-500">
                        Créé le {new Date(template.createdAt).toLocaleDateString('fr-FR')}
                        {template.createdBy && (
                          <span> par {template.createdBy.firstName} {template.createdBy.lastName}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(template)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    {!template.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(template.id)}
                      >
                        <StarOff className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal d'upload */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau template de contrat</DialogTitle>
            <DialogDescription>
              Uploadez un fichier PDF qui servira de modèle de contrat
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nom du template *</Label>
              <Input
                id="name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Ex: Contrat Standard 2024"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Description optionnelle..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="pdf-file">Fichier PDF *</Label>
              <Input
                id="pdf-file"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
              />
              {selectedFile && (
                <div className="text-sm text-gray-600 mt-1">
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="default"
                checked={isDefaultTemplate}
                onCheckedChange={setIsDefaultTemplate}
              />
              <Label htmlFor="default">Définir comme template par défaut</Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowUploadModal(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isUploading || !selectedFile || !templateName.trim()}
                className="flex-1"
              >
                {isUploading ? 'Upload...' : 'Créer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}