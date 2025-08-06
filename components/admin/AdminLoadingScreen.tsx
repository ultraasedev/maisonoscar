// Fichier : components/admin/AdminLoadingScreen.tsx
'use client'

export const AdminLoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Chargement de l'administration...</p>
      </div>
    </div>
  )
}