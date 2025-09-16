'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, Key, Bell, Shield, Database, Globe,
  Save, Loader2, ToggleLeft, Mail, Smartphone, Lock
} from 'lucide-react'
import { toast } from 'sonner'
import { config } from '@/lib/config'
import { Button } from '@/components/ui/button'

export default function SettingsContent() {
  const [loading, setLoading] = useState(false)
  const [activeSection, setActiveSection] = useState('general')
  const [maintenanceLoading, setMaintenanceLoading] = useState(false)
  
  // États pour les paramètres
  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    paymentReminders: true,
    bookingAlerts: true,
    maintenanceAlerts: true,
    
    // Contacts
    contactEmail: config.contacts.email,
    contactPhone: config.contacts.phone,
    whatsappNumber: config.contacts.whatsapp,
    contactAddress: config.contacts.address,
    
    // Configuration site
    siteUrl: config.siteUrl,
    googleAnalyticsId: '',
    matterportUrl: '',
    
    // Sécurité
    twoFactorAuth: false,
    sessionTimeout: 30, // minutes
    passwordExpiry: 90, // jours
    
    // Système
    maintenanceMode: false,
    maintenanceMessage: '',
    debugMode: config.isDev,
    backupFrequency: 'daily',
    
    // Email
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    
    // Mode
    environment: config.isDev ? 'development' : 'production',
    showMockData: config.showMockData
  })
  
  // Charger le statut de maintenance au montage
  useEffect(() => {
    fetch('/api/maintenance')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSettings(prev => ({
            ...prev,
            maintenanceMode: data.data.enabled,
            maintenanceMessage: data.data.message || ''
          }))
        }
      })
      .catch(console.error)
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      // Simuler la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Paramètres sauvegardés avec succès')
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const handleMaintenanceToggle = async () => {
    setMaintenanceLoading(true)
    try {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: !settings.maintenanceMode,
          message: settings.maintenanceMessage
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSettings(prev => ({
          ...prev,
          maintenanceMode: data.data.enabled,
          maintenanceMessage: data.data.message
        }))
        toast.success(data.message)
      } else {
        toast.error('Erreur lors de la mise à jour')
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setMaintenanceLoading(false)
    }
  }
  
  const sections = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'system', label: 'Système', icon: Database }
  ]
  
  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-6">
            {/* Configuration du site */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Configuration du site</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL du site
                  </label>
                  <input
                    type="url"
                    value={settings.siteUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="https://maisonoscar.fr"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Analytics ID
                  </label>
                  <input
                    type="text"
                    value={settings.googleAnalyticsId}
                    onChange={(e) => setSettings(prev => ({ ...prev, googleAnalyticsId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="G-XXXXXXXXXX"
                  />
                  <p className="text-xs text-gray-500 mt-1">Laissez vide pour désactiver Google Analytics</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matterport URL (Visite virtuelle)
                  </label>
                  <input
                    type="url"
                    value={settings.matterportUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, matterportUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="https://my.matterport.com/show/?m=..."
                  />
                  <p className="text-xs text-gray-500 mt-1">URL de la visite virtuelle Matterport</p>
                </div>
              </div>
            </div>

            {/* Mode de l'application */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Mode de l'application</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Environnement</p>
                    <p className="text-sm text-gray-600">
                      {settings.environment === 'development' ? 'Développement' : 'Production'}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    settings.environment === 'development' 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {settings.environment}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Données de test</p>
                    <p className="text-sm text-gray-600">
                      Afficher les données de démonstration
                    </p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, showMockData: !prev.showMockData }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.showMockData ? 'bg-black' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.showMockData ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ En mode production, seules les vraies données de la base de données seront affichées.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
        
      case 'notifications':
        return (
          <div className="space-y-6">
            {/* Configuration des contacts */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Coordonnées de contact</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de contact
                  </label>
                  <input
                    type="email"
                    value={settings.contactEmail || 'contact@maisonoscar.fr'}
                    onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="contact@maisonoscar.fr"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone de contact
                  </label>
                  <input
                    type="tel"
                    value={settings.contactPhone || '+33 6 12 34 56 78'}
                    onChange={(e) => setSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={settings.whatsappNumber || '+33612345678'}
                    onChange={(e) => setSettings(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="+33612345678 (sans espaces)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format sans espaces pour WhatsApp</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={settings.contactAddress || 'Bruz, Ille-et-Vilaine'}
                    onChange={(e) => setSettings(prev => ({ ...prev, contactAddress: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Bruz, Ille-et-Vilaine"
                  />
                </div>
              </div>
            </div>

            {/* Préférences de notification */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Préférences de notification</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div>
                    <p className="font-medium">Notifications par email</p>
                    <p className="text-sm text-gray-600">Recevoir les alertes par email</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.emailNotifications ? 'bg-black' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div>
                    <p className="font-medium">Notifications SMS</p>
                    <p className="text-sm text-gray-600">Recevoir les alertes par SMS</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, smsNotifications: !prev.smsNotifications }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.smsNotifications ? 'bg-black' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div>
                    <p className="font-medium">Rappels de paiement</p>
                    <p className="text-sm text-gray-600">Alertes pour les paiements en retard</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, paymentReminders: !prev.paymentReminders }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.paymentReminders ? 'bg-black' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.paymentReminders ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div>
                    <p className="font-medium">Alertes de réservation</p>
                    <p className="text-sm text-gray-600">Nouvelles demandes de réservation</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, bookingAlerts: !prev.bookingAlerts }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.bookingAlerts ? 'bg-black' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.bookingAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Mode maintenance */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Mode maintenance</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div>
                    <p className="font-medium">Activer le mode maintenance</p>
                    <p className="text-sm text-gray-600">Bloquer l'accès au site public</p>
                  </div>
                  <button
                    onClick={handleMaintenanceToggle}
                    disabled={maintenanceLoading}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-300'
                    } ${maintenanceLoading ? 'opacity-50' : ''}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                {settings.maintenanceMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message de maintenance
                    </label>
                    <textarea
                      value={settings.maintenanceMessage}
                      onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMessage: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Le site est actuellement en maintenance..."
                    />
                    <Button 
                      onClick={handleMaintenanceToggle}
                      className="mt-2"
                      disabled={maintenanceLoading}
                    >
                      Mettre à jour le message
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
        
      case 'security':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Paramètres de sécurité</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div>
                    <p className="font-medium text-yellow-900">Sécurité du compte</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Utilisez un mot de passe fort et changez-le régulièrement pour protéger votre compte.
                    </p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, twoFactorAuth: !prev.twoFactorAuth }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.twoFactorAuth ? 'bg-black' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiration de session (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiration du mot de passe (jours)
                  </label>
                  <input
                    type="number"
                    value={settings.passwordExpiry}
                    onChange={(e) => setSettings(prev => ({ ...prev, passwordExpiry: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )
        
      case 'email':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Configuration SMTP</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serveur SMTP
                  </label>
                  <input
                    type="text"
                    value={settings.smtpHost}
                    onChange={(e) => setSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Port SMTP
                  </label>
                  <input
                    type="number"
                    value={settings.smtpPort}
                    onChange={(e) => setSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Utilisateur SMTP
                  </label>
                  <input
                    type="text"
                    value={settings.smtpUser}
                    onChange={(e) => setSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe SMTP
                  </label>
                  <input
                    type="password"
                    value={settings.smtpPassword}
                    onChange={(e) => setSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  Tester la connexion
                </button>
              </div>
            </div>
          </div>
        )
        
      case 'system':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Paramètres système</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div>
                    <p className="font-medium">Mode maintenance</p>
                    <p className="text-sm text-gray-600">Désactiver l'accès public au site</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div>
                    <p className="font-medium">Mode debug</p>
                    <p className="text-sm text-gray-600">Afficher les logs détaillés</p>
                  </div>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, debugMode: !prev.debugMode }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.debugMode ? 'bg-black' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.debugMode ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fréquence de sauvegarde
                  </label>
                  <select
                    value={settings.backupFrequency}
                    onChange={(e) => setSettings(prev => ({ ...prev, backupFrequency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="hourly">Toutes les heures</option>
                    <option value="daily">Quotidienne</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuelle</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    Sauvegarder maintenant
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    Vider le cache
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
        
      default:
        return null
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Mobile First */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gérez les paramètres de l'application
          </p>
        </div>
        
        {/* Navigation */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-px">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                    activeSection === section.id
                      ? 'text-black border-black'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {section.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderSection()}
        </motion.div>
        
        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Sauvegarder les modifications
          </button>
        </div>
      </div>
    </div>
  )
}