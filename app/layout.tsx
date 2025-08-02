import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from 'sonner';

// === CONFIGURATION DES FONTS === //
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

// === MÉTADONNÉES SEO === //
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' }
  ],
};

export const metadata: Metadata = {
  title: {
    default: 'Maison Oscar - Créateur de liens en Bretagne | Co-living moderne à Bruz',
    template: '%s | Maison Oscar'
  },
  
  description: 'Créateur de liens en Bretagne. Découvrez le co-living moderne à Bruz avec Maison Oscar. 5 chambres meublées, espaces partagés et communauté bienveillante.',
  
  keywords: [
    'co-living Bruz',
    'colocation moderne Bretagne',
    'logement étudiant Bruz',
    'chambre meublée Bruz',
    'location meublée Ille-et-Vilaine',
    'jeunes actifs Rennes',
    'logement flexible Bretagne',
    'maison partagée Bruz',
    'créateur de liens',
    'communauté Bretagne'
  ],
  
  authors: [{ name: 'Maison Oscar' }],
  creator: 'Maison Oscar',
  publisher: 'Maison Oscar',
  
  alternates: {
    canonical: 'https://maison-oscar.fr',
    languages: {
      'fr-FR': 'https://maison-oscar.fr',
    },
  },
  
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://maison-oscar.fr',
    siteName: 'Maison Oscar',
    title: 'Maison Oscar - Créateur de liens en Bretagne | Co-living moderne à Bruz',
    description: 'Créateur de liens en Bretagne. Le co-living nouvelle génération à Bruz avec des espaces modernes et une communauté bienveillante.',
    images: [
      {
        url: 'https://maison-oscar.fr/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Maison Oscar - Créateur de liens en Bretagne',
      },
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Maison Oscar - Créateur de liens en Bretagne',
    description: 'Le co-living moderne à Bruz avec communauté bienveillante et espaces partagés.',
    images: ['https://maison-oscar.fr/images/twitter-card.jpg'],
    creator: '@maisonoscar',
    site: '@maisonoscar',
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
  
  other: {
    'geo.region': 'FR-35',
    'geo.placename': 'Bruz, Bretagne',
    'geo.position': '48.0167;-1.6167',
    'ICBM': '48.0167, -1.6167',
  },
};

// === COMPOSANT PRINCIPAL === //
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="scroll-smooth" suppressHydrationWarning>
      <head />
      <body 
        className={`${inter.variable} ${poppins.variable} font-sans antialiased min-h-screen bg-gray-50`}
        suppressHydrationWarning
      >
        <div className="min-h-screen flex flex-col">
          {/* Navigation */}
          <Navigation />
          
          {/* Contenu principal */}
          <main className="flex-1">
            {children}
          </main>
          
          {/* Footer */}
          <Footer />
        </div>
        
        {/* Notifications toast */}
        <Toaster 
          position="top-right"
          richColors
          closeButton
          theme="light"
        />
      </body>
    </html>
  );
}