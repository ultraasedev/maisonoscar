import Link from 'next/link';

export const Footer = () => {
  const navigationLinks = [
    { label: 'Accueil', href: '#accueil' },
    { label: 'Le co-living', href: '#coliving' },
    { label: 'Notre maison', href: '#maison' },
    { label: 'Chambres', href: '#chambres' },
  ];

  const services = [
    'Chambres meublées',
    'Espaces partagés',
    'Communauté active',
    'Support 7j/7'
  ];

  const contactInfo = [
    'Bruz, Ille-et-Vilaine',
    '06 12 34 56 78',
    'contact@maisonoscar.fr'
  ];

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-gray-900 rounded-sm"></div>
              </div>
              <span className="text-xl font-bold">MAISON OSCAR</span>
            </div>
            <p className="text-gray-400 mb-4">
              Créateur de liens en Bretagne. Le co-living nouvelle génération 
              avec une communauté bienveillante.
            </p>
          </div>
          
          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-gray-400">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-400">
              {services.map((service, index) => (
                <li key={index}>{service}</li>
              ))}
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              {contactInfo.map((info, index) => (
                <li key={index}>{info}</li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Maison Oscar. Tous droits réservés. Créateur de liens en Bretagne.</p>
        </div>
      </div>
    </footer>
  );
};