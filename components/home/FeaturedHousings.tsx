/**
 * Fichier : components/home/FeaturedHousings.tsx
 * Description : Section des logements mis en avant sur la page d'accueil
 * Inclut : Grille de logements, informations principales, liens vers détails
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MapPin,
  Users,
  Bed,
  Wifi,
  Car,
  Euro,
  ArrowRight,
  Eye,
  Heart,
  Star,
  Check,
  Home,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// === TYPES === //

interface FeaturedHousing {
  id: string;
  name: string;
  description: string;
  address: {
    street: string;
    city: string;
    zipCode: string;
  };
  photos: string[];
  availableRooms: number;
  totalRooms: number;
  priceFrom: number;
  amenities: string[];
  features: string[];
  rating: number;
  reviews: number;
  availableFrom: string;
  highlighted?: boolean;
}

// === DONNÉES MOCKÉES === //

const featuredHousings: FeaturedHousing[] = [
  {
    id: '1',
    name: 'Villa des Cerisiers',
    description: 'Magnifique villa moderne avec jardin privé, parfaite pour une vie communautaire harmonieuse.',
    address: {
      street: '12 Rue des Cerisiers',
      city: 'Bruz',
      zipCode: '35170'
    },
    photos: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop'
    ],
    availableRooms: 2,
    totalRooms: 3,
    priceFrom: 450,
    amenities: ['Jardin', 'Parking', 'WiFi'],
    features: ['Meublé', 'Charges incluses', 'APL éligible'],
    rating: 4.9,
    reviews: 24,
    availableFrom: 'Immédiatement',
    highlighted: true
  },
  {
    id: '2',
    name: 'Résidence du Parc',
    description: 'Appartement moderne en centre-ville avec tous les commerces à proximité.',
    address: {
      street: '45 Avenue du Général de Gaulle',
      city: 'Bruz',
      zipCode: '35170'
    },
    photos: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1562182384-d4d6362157d1?w=800&h=600&fit=crop'
    ],
    availableRooms: 1,
    totalRooms: 2,
    priceFrom: 520,
    amenities: ['Ascenseur', 'Interphone', 'WiFi'],
    features: ['Studio disponible', 'Centre-ville', 'Transport'],
    rating: 4.8,
    reviews: 18,
    availableFrom: 'Mars 2024'
  },
  {
    id: '3',
    name: 'Maison Belleville',
    description: 'Charmante maison traditionnelle rénovée dans un quartier calme et verdoyant.',
    address: {
      street: '8 Rue de Belleville',
      city: 'Bruz',
      zipCode: '35170'
    },
    photos: [
      'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&h=600&fit=crop'
    ],
    availableRooms: 1,
    totalRooms: 2,
    priceFrom: 390,
    amenities: ['Jardin', 'Terrasse', 'Parking'],
    features: ['Quartier calme', 'Proche nature', 'Barbecue'],
    rating: 4.7,
    reviews: 15,
    availableFrom: 'Avril 2024'
  }
];

// === ANIMATIONS === //

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

// === COMPOSANT HOUSING CARD === //

const HousingCard: React.FC<{ 
  housing: FeaturedHousing; 
  index: number;
}> = ({ housing, index }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <motion.div variants={scaleIn} className="group">
      <Card className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-2xl border-2",
        housing.highlighted 
          ? "border-blue-500 shadow-lg ring-2 ring-blue-100" 
          : "border-gray-200 hover:border-blue-300",
        index === 0 ? "md:col-span-2 md:row-span-1" : ""
      )}>
        
        {/* Image section */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {housing.highlighted && (
            <div className="absolute top-4 left-4 z-10">
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                ⭐ Coup de cœur
              </Badge>
            </div>
          )}
          
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white"
              onClick={() => setIsFavorited(!isFavorited)}
            >
              <Heart className={cn(
                "w-4 h-4",
                isFavorited ? "text-red-500 fill-current" : "text-gray-600"
              )} />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white"
              asChild
            >
              <Link href={`/logement/${housing.id}`}>
                <Eye className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <Image
            src={housing.photos[currentImageIndex]}
            alt={housing.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Image navigation dots */}
          {housing.photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {housing.photos.map((_, idx) => (
                <button
                  key={idx}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    idx === currentImageIndex ? "bg-white" : "bg-white/50"
                  )}
                  onClick={() => setCurrentImageIndex(idx)}
                />
              ))}
            </div>
          )}

          {/* Price badge */}
          <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg backdrop-blur-sm">
            <div className="text-lg font-bold">À partir de {housing.priceFrom}€</div>
            <div className="text-xs opacity-80">par mois</div>
          </div>
        </div>

        {/* Content */}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                {housing.name}
              </CardTitle>
              <div className="flex items-center text-gray-600 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{housing.address.city}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="font-semibold">{housing.rating}</span>
              <span className="text-gray-500">({housing.reviews})</span>
            </div>
          </div>
          
          <CardDescription className="line-clamp-2 leading-relaxed">
            {housing.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Availability info */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center text-gray-600">
                <Bed className="w-4 h-4 mr-1" />
                {housing.availableRooms}/{housing.totalRooms} dispo
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-1" />
                {housing.availableFrom}
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-1">
            {housing.amenities.map((amenity, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {amenity}
              </Badge>
            ))}
          </div>

          {/* Features */}
          <div className="space-y-1">
            {housing.features.slice(0, 3).map((feature, idx) => (
              <div key={idx} className="flex items-center text-sm text-gray-600">
                <Check className="w-3 h-3 text-green-500 mr-2" />
                {feature}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" asChild>
              <Link href={`/logement/${housing.id}`}>
                Voir les détails
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/reservation?housing=${housing.id}`}>
                Réserver
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// === COMPOSANT PRINCIPAL === //

/**
 * Section des logements mis en avant
 */
export function FeaturedHousings() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp}>
            <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200">
              <Home className="w-4 h-4 mr-2" />
              Nos logements à Bruz
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Découvrez nos{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                logements
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Des espaces pensés pour le bien-être et la convivialité. 
              Chaque logement offre le parfait équilibre entre intimité et vie communautaire.
            </p>
          </motion.div>
        </motion.div>

        {/* Housing grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
        >
          {featuredHousings.map((housing, index) => (
            <HousingCard key={housing.id} housing={housing} index={index} />
          ))}
        </motion.div>

        {/* Stats row */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12"
        >
          {[
            { number: '5', label: 'Logements disponibles', icon: Home },
            { number: '12', label: 'Chambres au total', icon: Bed },
            { number: '4.8', label: 'Note moyenne', icon: Star },
            { number: '95%', label: 'Taux d\'occupation', icon: Users }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Envie de voir plus de logements ?
            </h3>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Découvrez tous nos espaces de co-living avec photos, plans et informations détaillées.
            </p>
            <Button size="lg" asChild>
              <Link href="/logements">
                Voir tous nos logements
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}