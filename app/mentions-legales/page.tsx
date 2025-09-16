'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { config } from '@/lib/config'

export default function MentionsLegalesPage() {
  const [content, setContent] = useState<string>('')
  const [title, setTitle] = useState<string>('Mentions légales')
  const [loading, setLoading] = useState(true)
  const [contacts, setContacts] = useState(config.contacts)

  useEffect(() => {
    // Récupérer le contenu et les contacts
    Promise.all([
      fetch('/api/cms/legal-pages?slug=mentions-legales'),
      fetch('/api/cms/settings')
    ])
      .then(async ([legalRes, settingsRes]) => {
        const legalData = await legalRes.json()
        const settingsData = await settingsRes.json()
        
        if (legalData.success && legalData.data?.length > 0) {
          setTitle(legalData.data[0].title || 'Mentions légales')
          setContent(legalData.data[0].content || getDefaultContent())
        } else {
          setContent(getDefaultContent())
        }
        
        if (settingsData.success && settingsData.data) {
          const newContacts = {
            email: settingsData.data.contactEmail || config.contacts.email,
            phone: settingsData.data.contactPhone || config.contacts.phone,
            whatsapp: settingsData.data.whatsappNumber || config.contacts.whatsapp,
            address: settingsData.data.contactAddress || config.contacts.address
          }
          setContacts(newContacts)
          // Si pas de contenu personnalisé, utiliser le contenu par défaut avec les nouveaux contacts
          if (!legalData.data?.length) {
            setContent(getDefaultContent(newContacts))
          }
        }
      })
      .catch(error => {
        console.error('Erreur:', error)
        setContent(getDefaultContent())
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const getDefaultContent = (customContacts = contacts) => `
    <h2>1. Informations légales</h2>
    <p>
      <strong>Dénomination sociale :</strong> Maison Oscar<br />
      <strong>Forme juridique :</strong> SAS<br />
      <strong>Siège social :</strong> ${customContacts.address}<br />
      <strong>SIRET :</strong> En cours d'immatriculation<br />
      <strong>RCS :</strong> Rennes<br />
    </p>

    <h2>2. Contact</h2>
    <p>
      <strong>Téléphone :</strong> ${customContacts.phone}<br />
      <strong>Email :</strong> ${customContacts.email}<br />
      <strong>Adresse :</strong> ${customContacts.address}
    </p>

    <h2>3. Directeur de publication</h2>
    <p>
      <strong>Responsable :</strong> Direction Maison Oscar<br />
      <strong>Contact :</strong> ${customContacts.email}
    </p>

    <h2>4. Hébergement du site</h2>
    <p>
      <strong>Hébergeur :</strong> Vercel Inc.<br />
      <strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA<br />
      <strong>Site web :</strong> https://vercel.com
    </p>

    <h2>5. Propriété intellectuelle</h2>
    <p>
      L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. 
      Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
    </p>
    <p>
      La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.
    </p>

    <h2>6. Protection des données personnelles (RGPD)</h2>
    <p>
      Conformément au Règlement Général sur la Protection des Données (RGPD - Règlement UE 2016/679) et à la loi Informatique et Libertés du 6 janvier 1978 modifiée, 
      vous disposez des droits suivants sur vos données personnelles :
    </p>
    <ul>
      <li>Droit d'accès aux données</li>
      <li>Droit de rectification</li>
      <li>Droit à l'effacement (droit à l'oubli)</li>
      <li>Droit à la limitation du traitement</li>
      <li>Droit à la portabilité des données</li>
      <li>Droit d'opposition</li>
    </ul>
    <p>
      Pour exercer ces droits, vous pouvez nous contacter :
      <br />Par email : ${customContacts.email}
      <br />Par courrier : Maison Oscar - ${customContacts.address}
    </p>

    <h2>7. Cookies</h2>
    <p>
      Ce site utilise des cookies pour améliorer votre expérience de navigation. Les cookies sont de petits fichiers texte stockés sur votre appareil.
    </p>
    <p>
      <strong>Types de cookies utilisés :</strong>
    </p>
    <ul>
      <li><strong>Cookies essentiels :</strong> Nécessaires au fonctionnement du site</li>
      <li><strong>Cookies analytiques :</strong> Pour comprendre comment les visiteurs utilisent le site (Google Analytics)</li>
      <li><strong>Cookies de session :</strong> Pour maintenir votre connexion</li>
    </ul>
    <p>
      Vous pouvez paramétrer votre navigateur pour refuser les cookies ou être alerté lorsqu'un cookie est envoyé.
    </p>

    <h2>8. Responsabilité</h2>
    <p>
      Maison Oscar s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. 
      Cependant, Maison Oscar ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition sur ce site.
    </p>
    <p>
      En conséquence, Maison Oscar décline toute responsabilité pour toute imprécision, inexactitude ou omission portant sur des informations disponibles sur le site.
    </p>

    <h2>9. Liens hypertextes</h2>
    <p>
      Les liens hypertextes mis en place dans le cadre du présent site internet en direction d'autres ressources présentes sur le réseau Internet 
      ne sauraient engager la responsabilité de Maison Oscar.
    </p>

    <h2>10. Droit applicable et juridiction compétente</h2>
    <p>
      Les présentes mentions légales sont régies par le droit français. 
      En cas de litige et à défaut d'accord amiable, le litige sera porté devant les tribunaux français conformément aux règles de compétence en vigueur.
    </p>

    <div class="mt-8 p-4 bg-gray-50 rounded-lg">
      <p class="text-sm text-gray-600">
        <em>Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</em>
      </p>
    </div>
  `

  return (
    <div className="min-h-screen bg-[#F5F3F0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Bouton retour */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à l'accueil</span>
        </Link>

        {/* Contenu */}
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
            {title}
          </h1>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          ) : (
            <div 
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-strong:text-gray-900 prose-a:text-black prose-a:underline"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>
      </div>
    </div>
  )
}