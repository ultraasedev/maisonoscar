'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Shield, X, Settings, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Vérifier si le consentement a déjà été donné
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Délai avant d'afficher le banner
      setTimeout(() => {
        setIsVisible(true);
      }, 1500);
    } else {
      // Charger les préférences sauvegardées
      const savedPrefs = JSON.parse(consent);
      setPreferences(savedPrefs);
      // Appliquer les préférences (Google Analytics, etc.)
      applyPreferences(savedPrefs);
    }
  }, []);

  const applyPreferences = (prefs: CookiePreferences) => {
    // Ici vous pouvez activer/désactiver les scripts selon les préférences
    if (prefs.analytics) {
      // Activer Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          'analytics_storage': 'granted'
        });
      }
    } else {
      // Désactiver Google Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          'analytics_storage': 'denied'
        });
      }
    }

    if (prefs.marketing) {
      // Activer les cookies marketing
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          'ad_storage': 'granted',
          'ad_user_data': 'granted',
          'ad_personalization': 'granted'
        });
      }
    } else {
      // Désactiver les cookies marketing
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          'ad_storage': 'denied',
          'ad_user_data': 'denied',
          'ad_personalization': 'denied'
        });
      }
    }
  };

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    applyPreferences(allAccepted);
    setIsVisible(false);
  };

  const acceptSelected = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    applyPreferences(preferences);
    setIsVisible(false);
  };

  const rejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false
    };
    setPreferences(onlyNecessary);
    localStorage.setItem('cookieConsent', JSON.stringify(onlyNecessary));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    applyPreferences(onlyNecessary);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
        >
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-[#F5F3F0] rounded-full flex items-center justify-center">
                      <Cookie className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-black">Préférences de cookies</h3>
                      <p className="text-sm text-gray-600">Nous respectons votre vie privée</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsVisible(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Description */}
                <p className="text-gray-700 mb-6 text-sm sm:text-base">
                  Nous utilisons des cookies pour améliorer votre expérience sur notre site. 
                  Certains cookies sont essentiels au fonctionnement du site, tandis que d'autres 
                  nous aident à comprendre comment vous l'utilisez pour l'améliorer.
                </p>

                {/* Cookie Types */}
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-6 space-y-4 overflow-hidden"
                  >
                    {/* Necessary Cookies */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Shield className="w-4 h-4 text-green-600" />
                            <h4 className="font-semibold text-black">Cookies nécessaires</h4>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              Toujours actifs
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Indispensables au bon fonctionnement du site. Ils permettent la navigation 
                            et l'accès aux zones sécurisées.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.necessary}
                          disabled
                          className="w-5 h-5 text-black rounded cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Analytics Cookies */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-4 h-4 bg-blue-600 rounded-full" />
                            <h4 className="font-semibold text-black">Cookies analytiques</h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            Nous aident à comprendre comment les visiteurs utilisent notre site 
                            en collectant des informations de manière anonyme.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.analytics}
                          onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                          className="w-5 h-5 text-black rounded accent-black"
                        />
                      </div>
                    </div>

                    {/* Marketing Cookies */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-4 h-4 bg-purple-600 rounded-full" />
                            <h4 className="font-semibold text-black">Cookies marketing</h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            Utilisés pour afficher des publicités pertinentes et mesurer 
                            l'efficacité de nos campagnes publicitaires.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.marketing}
                          onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                          className="w-5 h-5 text-black rounded accent-black"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center justify-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    {showDetails ? 'Masquer les détails' : 'Personnaliser'}
                  </Button>
                  
                  {showDetails ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={rejectAll}
                        className="flex items-center justify-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Refuser tout
                      </Button>
                      <Button
                        onClick={acceptSelected}
                        className="flex-1 bg-black text-white hover:bg-gray-800 flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Accepter la sélection
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={rejectAll}
                        className="flex-1"
                      >
                        Refuser
                      </Button>
                      <Button
                        onClick={acceptAll}
                        className="flex-1 bg-black text-white hover:bg-gray-800"
                      >
                        Accepter tout
                      </Button>
                    </>
                  )}
                </div>

                {/* Legal Links */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    En utilisant notre site, vous acceptez notre{' '}
                    <a href="/politique-confidentialite" className="underline hover:text-gray-700">
                      politique de confidentialité
                    </a>{' '}
                    et notre{' '}
                    <a href="/mentions-legales" className="underline hover:text-gray-700">
                      utilisation des cookies
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};