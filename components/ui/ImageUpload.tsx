'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ImageData {
  url: string
  title?: string
  description?: string
}

interface ImageUploadProps {
  images: (string | ImageData)[]
  onImagesChange: (images: (string | ImageData)[]) => void
  type?: string
  maxImages?: number
  label?: string
  showMetadata?: boolean
}

export default function ImageUpload({
  images,
  onImagesChange,
  type = 'cms',
  maxImages = 10,
  label = 'Images',
  showMetadata = false
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fonctions utilitaires
  const getImageUrl = (image: string | ImageData): string => {
    return typeof image === 'string' ? image : image.url
  }

  const updateImageMetadata = (index: number, field: 'title' | 'description', value: string) => {
    const newImages = [...images]
    const currentImage = newImages[index]

    if (typeof currentImage === 'string') {
      newImages[index] = { url: currentImage, [field]: value }
    } else {
      newImages[index] = { ...currentImage, [field]: value }
    }

    onImagesChange(newImages)
  }

  const handleFileUpload = async (files: FileList) => {
    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images autorisées`)
      return
    }

    setUploading(true)
    const uploadedUrls: (string | ImageData)[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} n'est pas une image`)
          continue
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} est trop volumineux (max 5MB)`)
          continue
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', type)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        const result = await response.json()

        if (result.success) {
          if (showMetadata) {
            uploadedUrls.push({ url: result.data.url, title: '', description: '' })
          } else {
            uploadedUrls.push(result.data.url)
          }
        } else {
          toast.error(`Erreur pour ${file.name}: ${result.error}`)
        }
      }

      if (uploadedUrls.length > 0) {
        onImagesChange([...images, ...uploadedUrls])
        toast.success(`${uploadedUrls.length} image(s) uploadée(s)`)
      }
    } catch (error) {
      toast.error('Erreur lors de l\'upload')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = async (index: number) => {
    try {
      const imageToRemove = images[index]
      const imageUrl = getImageUrl(imageToRemove)

      // Supprimer du serveur si c'est une image locale
      if (imageUrl.startsWith('/images/')) {
        await fetch(`/api/upload?url=${encodeURIComponent(imageUrl)}`, {
          method: 'DELETE'
        })
      }

      // Retirer de la liste
      const newImages = images.filter((_, i) => i !== index)
      onImagesChange(newImages)
      toast.success('Image supprimée')
    } catch (error) {
      toast.error('Erreur lors de la suppression')
      console.error('Delete error:', error)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Zone d'upload */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Upload en cours...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              Cliquez ou glissez-déposez vos images ici
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, GIF jusqu'à 5MB (max {maxImages} images)
            </p>
          </div>
        )}
      </div>

      {/* Galerie des images */}
      {images.length > 0 && (
        <div className={showMetadata ? "space-y-4" : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"}>
          {images.map((image, index) => {
            const imageUrl = getImageUrl(image)
            const imageData = typeof image === 'string' ? { url: image } : image

            if (showMetadata) {
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={imageUrl}
                        alt={imageData.title || `Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="12" fill="%236b7280">Image non trouvée</text></svg>'
                        }}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        placeholder="Titre de l'image"
                        value={imageData.title || ''}
                        onChange={(e) => updateImageMetadata(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <textarea
                        placeholder="Description de l'image"
                        value={imageData.description || ''}
                        onChange={(e) => updateImageMetadata(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            } else {
              return (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="12" fill="%236b7280">Image non trouvée</text></svg>'
                      }}
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )
            }
          })}
        </div>
      )}

      {/* Info sur les images */}
      <div className="text-sm text-gray-500">
        {images.length} / {maxImages} images
      </div>
    </div>
  )
}