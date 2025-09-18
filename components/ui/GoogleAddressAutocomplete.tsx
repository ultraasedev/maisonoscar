'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Loader2 } from 'lucide-react'

declare global {
  interface Window {
    google: any;
    initGooglePlaces?: () => void;
  }
}

interface AddressComponents {
  street_number?: string;
  route?: string;
  locality?: string;
  administrative_area_level_1?: string;
  country?: string;
  postal_code?: string;
}

interface GoogleAddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onAddressSelect?: (address: {
    fullAddress: string
    street: string
    postalCode: string
    city: string
    country: string
  }) => void
  placeholder?: string
  className?: string
}

export default function GoogleAddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Tapez votre adresse...",
  className = ""
}: GoogleAddressAutocompleteProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)

  // Charger l'API Google Places (une seule fois globalement)
  useEffect(() => {
    const loadGooglePlaces = () => {
      // Vérifier si l'API est déjà chargée
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsLoaded(true)
        return
      }

      // Vérifier si un script est déjà en cours de chargement
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      if (existingScript) {
        // Attendre que le script existant se charge
        const checkLoaded = setInterval(() => {
          if (window.google && window.google.maps && window.google.maps.places) {
            setIsLoaded(true)
            clearInterval(checkLoaded)
          }
        }, 100)

        setTimeout(() => {
          clearInterval(checkLoaded)
          if (!isLoaded) {
            setHasError(true)
          }
        }, 5000)
        return
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
      if (!apiKey) {
        console.warn('Google Places API key not configured. Address autocomplete will use fallback input.')
        setHasError(true)
        return
      }

      // Créer un callback unique global
      const callbackName = 'initGooglePlacesGlobal'
      if (!(window as any)[callbackName]) {
        (window as any)[callbackName] = () => {
          setIsLoaded(true)
          // Notifier tous les autres composants
          window.dispatchEvent(new CustomEvent('googlePlacesLoaded'))
        }
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`
      script.async = true
      script.defer = true
      script.id = 'google-maps-script'

      script.onerror = () => {
        console.warn('Failed to load Google Places API. Using fallback input.')
        setHasError(true)
        setLoading(false)
      }

      document.head.appendChild(script)
    }

    // Écouter l'événement de chargement global
    const handleGooglePlacesLoaded = () => {
      setIsLoaded(true)
    }

    window.addEventListener('googlePlacesLoaded', handleGooglePlacesLoaded)

    loadGooglePlaces()

    return () => {
      window.removeEventListener('googlePlacesLoaded', handleGooglePlacesLoaded)
    }
  }, [])

  // Initialiser l'autocomplete quand l'API est chargée
  useEffect(() => {
    if (isLoaded && inputRef.current && !autocompleteRef.current && !hasError) {
      try {
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          fields: ['address_components', 'formatted_address', 'geometry']
        })

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace()

          if (!place.address_components) {
            return
          }

          setLoading(true)

          try {
            // Parser les composants d'adresse
            const components: AddressComponents = {}
            place.address_components.forEach((component: any) => {
              const type = component.types[0]
              components[type as keyof AddressComponents] = component.long_name
            })

            // Construire l'adresse
            const street = [components.street_number, components.route].filter(Boolean).join(' ')
            const city = components.locality || components.administrative_area_level_1 || ''
            const postalCode = components.postal_code || ''
            const country = components.country || ''
            const fullAddress = place.formatted_address || value

            onChange(fullAddress)

            if (onAddressSelect) {
              onAddressSelect({
                fullAddress,
                street,
                postalCode,
                city,
                country
              })
            }
          } catch (error) {
            console.warn('Error parsing address components:', error)
          }

          setLoading(false)
        })

        autocompleteRef.current = autocomplete
      } catch (error) {
        console.warn('Error initializing Google Places Autocomplete:', error)
        setHasError(true)
      }
    }
  }, [isLoaded, onChange, onAddressSelect, value, hasError])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black ${className}`}
          autoComplete="off"
          disabled={false}
        />
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        {(loading || (!isLoaded && !hasError)) && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>

      {!isLoaded && !hasError && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="text-center text-gray-500">
            <Loader2 className="w-6 h-6 text-gray-300 mx-auto mb-2 animate-spin" />
            <p className="text-sm">Chargement de Google Places...</p>
          </div>
        </div>
      )}

      {hasError && (
        <div className="absolute z-50 w-full mt-1 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-3">
          <div className="text-center text-yellow-700">
            <MapPin className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
            <p className="text-xs">Autocomplétion indisponible - Saisie manuelle activée</p>
          </div>
        </div>
      )}
    </div>
  )
}