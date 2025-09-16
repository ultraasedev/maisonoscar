// Page de maintenance
'use client'

import { useEffect, useState } from 'react'
import { Wrench, Clock, Mail, Phone } from 'lucide-react'
import { config } from '@/lib/config'

export default function MaintenancePage() {
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>('')
  const [contactEmail, setContactEmail] = useState(config.contacts.email)
  const [contactPhone, setContactPhone] = useState(config.contacts.phone)
  
  useEffect(() => {
    // Récupérer le message de maintenance et les contacts depuis les settings
    fetch('/api/cms/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          if (data.data.maintenanceMessage) {
            setMaintenanceMessage(data.data.maintenanceMessage)
          }
          if (data.data.contactEmail) {
            setContactEmail(data.data.contactEmail)
          }
          if (data.data.contactPhone) {
            setContactPhone(data.data.contactPhone)
          }
        }
      })
      .catch(console.error)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3F0] to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 text-center">
          {/* Icône animée */}
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-black/10 rounded-full blur-xl animate-pulse"></div>
            <div className="relative bg-black text-white rounded-full p-6">
              <Wrench className="w-12 h-12 animate-spin-slow" />
            </div>
          </div>

          {/* Titre */}
          <h1 className="mt-8 text-3xl sm:text-4xl font-bold text-gray-900">
            Site en maintenance
          </h1>

          {/* Message personnalisé ou par défaut */}
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            {maintenanceMessage || 
              "Nous effectuons actuellement des travaux de maintenance pour améliorer votre expérience. Le site sera bientôt de retour."}
          </p>

          {/* Estimation */}
          <div className="mt-8 inline-flex items-center gap-2 bg-[#F5F3F0] rounded-full px-6 py-3">
            <Clock className="w-5 h-5 text-gray-700" />
            <span className="text-gray-700 font-medium">
              Retour prévu dans quelques heures
            </span>
          </div>

          {/* Séparateur */}
          <div className="my-10 h-px bg-gray-200"></div>

          {/* Contact */}
          <div className="space-y-4">
            <p className="text-gray-600">
              Besoin d'une assistance immédiate ?
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href={`mailto:${contactEmail}`}
                className="inline-flex items-center gap-2 text-gray-700 hover:text-black transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>{contactEmail}</span>
              </a>
              
              <a 
                href={`tel:${contactPhone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2 text-gray-700 hover:text-black transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>{contactPhone}</span>
              </a>
            </div>
          </div>

          {/* Logo */}
          <div className="mt-12">
            <div className="inline-flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg"></div>
              <span className="text-xl font-bold">Maison Oscar</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  )
}