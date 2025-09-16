export const SchemaOrg = () => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://maisonoscar.fr';
  
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Maison Oscar',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+33-6-12-34-56-78',
      contactType: 'customer service',
      areaServed: 'FR',
      availableLanguage: 'French'
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Bruz',
      addressLocality: 'Bruz',
      postalCode: '35170',
      addressCountry: 'FR'
    },
    sameAs: [
      'https://www.facebook.com/maisonoscar',
      'https://www.instagram.com/maisonoscar',
      'https://www.linkedin.com/company/maisonoscar'
    ]
  };
  
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Maison Oscar - Colocation Étudiante',
    description: 'Solution de co-living moderne à Bruz. Chambres meublées dans une grande maison avec espaces communs partagés.',
    url: baseUrl,
    telephone: '+33-6-12-34-56-78',
    priceRange: '€€',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Bruz',
      addressLocality: 'Bruz',
      addressRegion: 'Bretagne',
      postalCode: '35170',
      addressCountry: 'FR'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 48.0241,
      longitude: -1.7457
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00'
      }
    ],
    image: [
      `${baseUrl}/images/maison-oscar-1.jpg`,
      `${baseUrl}/images/maison-oscar-2.jpg`,
      `${baseUrl}/images/maison-oscar-3.jpg`
    ]
  };
  
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: baseUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Chambres',
        item: `${baseUrl}/#chambres`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Contact',
        item: `${baseUrl}/#contact`
      }
    ]
  };
  
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Maison Oscar',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
  
  const housingComplexSchema = {
    '@context': 'https://schema.org',
    '@type': 'ApartmentComplex',
    name: 'Maison Oscar',
    description: 'Maison de co-living avec 9 chambres meublées et espaces communs partagés',
    numberOfRooms: 9,
    petsAllowed: false,
    amenityFeature: [
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Cuisine équipée',
        value: true
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Wifi haut débit',
        value: true
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Jardin',
        value: true
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Parking',
        value: true
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Ménage des parties communes inclus',
        value: true
      }
    ],
    tourBookingPage: `${baseUrl}/#chambres`,
    url: baseUrl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Bruz',
      addressLocality: 'Bruz',
      addressRegion: 'Bretagne',
      postalCode: '35170',
      addressCountry: 'FR'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(housingComplexSchema) }}
      />
    </>
  );
};