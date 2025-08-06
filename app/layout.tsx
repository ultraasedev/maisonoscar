// Fichier : app/layout.tsx
// Layout principal de l'application Maison Oscar

import type { Metadata } from 'next'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { Toaster } from 'sonner'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Maison Oscar | Créateur de liens en Ille-et-Vilaine',
    template: '%s | Maison Oscar'
  },
  description: 'Découvrez Maison Oscar, votre solution de co-living moderne à Bruz. Chambres meublées, espaces partagés et communauté bienveillante.',
  keywords: [
    'co-living',
    'colocation',
    'Bruz',
    'Bretagne',
    'logement étudiant',
    'chambre meublée',
    'Rennes',
    'habitat partagé'
  ],
  authors: [{ name: 'Maison Oscar' }],
  creator: 'Maison Oscar',
  publisher: 'Maison Oscar',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.SITE_URL || 'https://maisonoscar.fr'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: process.env.SITE_URL || 'https://maisonoscar.fr',
    title: 'Maison Oscar - Co-living à Bruz, Bretagne',
    description: 'Découvrez Maison Oscar, votre solution de co-living moderne à Bruz. Chambres meublées, espaces partagés et communauté bienveillante.',
    siteName: 'Maison Oscar',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Maison Oscar - Co-living à Bruz',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maison Oscar - Co-living à Bruz, Bretagne',
    description: 'Découvrez Maison Oscar, votre solution de co-living moderne à Bruz. Chambres meublées, espaces partagés et communauté bienveillante.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Fonts via Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        
        {/* Favicon et icônes */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Couleur de thème pour Safari/mobile */}
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        
        {/* Preload de ressources critiques */}
        <link rel="preload" href="/images/hero-bg.jpg" as="image" />
      </head>
      <body 
        className="min-h-screen bg-white font-sans antialiased"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <SessionProvider>
          <Navigation />
          {children}
          <Footer />
          
          {/* Toast notifications globales */}
          <Toaster 
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                color: '#000000',
              },
            }}
          />
        </SessionProvider>

        {/* Scripts d'analytics */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics */}
            {process.env.NEXT_PUBLIC_GA_ID && (
              <>
                <script
                  async
                  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
                />
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());
                      gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                    `,
                  }}
                />
              </>
            )}
          </>
        )}
      </body>
    </html>
  )
}