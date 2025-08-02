/**
 * Fichier : components/ui/badge.tsx
 * Description : Composant Badge pour afficher des étiquettes et statuts
 * Inclut : Différentes variantes de couleur et taille
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// === DÉFINITION DES VARIANTES === //

/**
 * Variantes de style pour le badge
 */
const badgeVariants = cva(
  // Classes de base communes à tous les badges
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      // === VARIANTES DE COULEUR === //
      variant: {
        // Badge par défaut (primaire)
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
          
        // Badge secondaire (gris)
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
          
        // Badge destructeur (rouge)
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
          
        // Badge outline
        outline: 
          "text-foreground",
          
        // Badge success (vert)
        success:
          "border-transparent bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100",
          
        // Badge warning (orange/jaune)
        warning:
          "border-transparent bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-100",
          
        // Badge info (bleu)
        info:
          "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100",
          
        // Badge avec dégradé
        gradient:
          "border-transparent bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700",
          
        // Badge fantôme
        ghost:
          "border-transparent bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          
        // Badges de statut spécifiques au co-living
        available:
          "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
          
        occupied:
          "border-transparent bg-red-100 text-red-800 hover:bg-red-200",
          
        pending:
          "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
          
        reserved:
          "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200",
      },
      
      // === VARIANTES DE TAILLE === //
      size: {
        // Taille par défaut
        default: "px-2.5 py-0.5 text-xs",
        
        // Petite taille
        sm: "px-2 py-0.5 text-xs",
        
        // Grande taille
        lg: "px-3 py-1 text-sm",
        
        // Très grande taille
        xl: "px-4 py-1.5 text-base",
      },
      
      // === FORME DU BADGE === //
      shape: {
        // Forme par défaut (arrondie)
        default: "rounded-full",
        
        // Forme carrée avec coins arrondis
        rounded: "rounded-md",
        
        // Forme carrée
        square: "rounded-none",
      }
    },
    
    // === VARIANTES PAR DÉFAUT === //
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
    },
  }
);

// === INTERFACE DU COMPOSANT === //

/**
 * Props du composant Badge
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Icône à afficher à gauche du texte
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Icône à afficher à droite du texte
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Si le badge est cliquable
   */
  clickable?: boolean;
  
  /**
   * Fonction appelée au clic (si clickable)
   */
  onClick?: () => void;
  
  /**
   * Si le badge peut être supprimé
   */
  dismissible?: boolean;
  
  /**
   * Fonction appelée lors de la suppression
   */
  onDismiss?: () => void;
}

// === COMPOSANT PRINCIPAL === //

/**
 * Composant Badge réutilisable
 * 
 * @example
 * // Badge basique
 * <Badge>Nouveau</Badge>
 * 
 * @example
 * // Badge avec variante et taille
 * <Badge variant="success" size="lg">
 *   Disponible
 * </Badge>
 * 
 * @example
 * // Badge avec icône
 * <Badge leftIcon={<Star className="w-3 h-3" />}>
 *   Premium
 * </Badge>
 * 
 * @example
 * // Badge cliquable
 * <Badge clickable onClick={() => console.log('clicked')}>
 *   Cliquez-moi
 * </Badge>
 */
const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ 
    className, 
    variant, 
    size, 
    shape,
    leftIcon,
    rightIcon,
    clickable = false,
    onClick,
    dismissible = false,
    onDismiss,
    children,
    ...props 
  }, ref) => {
    
    // Gestion du clic
    const handleClick = () => {
      if (clickable && onClick) {
        onClick();
      }
    };
    
    // Gestion de la suppression
    const handleDismiss = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onDismiss) {
        onDismiss();
      }
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          badgeVariants({ variant, size, shape }),
          // Classes pour l'interactivité
          clickable && "cursor-pointer hover:scale-105 transition-transform duration-200",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {/* Contenu du badge avec icônes */}
        <span className="flex items-center gap-1">
          {/* Icône de gauche */}
          {leftIcon && (
            <span className="flex-shrink-0">
              {leftIcon}
            </span>
          )}
          
          {/* Contenu principal */}
          {children}
          
          {/* Icône de droite */}
          {rightIcon && !dismissible && (
            <span className="flex-shrink-0">
              {rightIcon}
            </span>
          )}
          
          {/* Bouton de suppression */}
          {dismissible && (
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
              aria-label="Supprimer"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </span>
      </div>
    );
  }
);

// Nom d'affichage pour le debug
Badge.displayName = "Badge";

// === COMPOSANTS DE STATUT PRÉDÉFINIS === //

/**
 * Badge pour statut "Disponible"
 */
export const AvailableBadge: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Badge variant="available" leftIcon={
    <div className="w-2 h-2 bg-green-600 rounded-full" />
  }>
    {children || "Disponible"}
  </Badge>
);

/**
 * Badge pour statut "Occupé"
 */
export const OccupiedBadge: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Badge variant="occupied" leftIcon={
    <div className="w-2 h-2 bg-red-600 rounded-full" />
  }>
    {children || "Occupé"}
  </Badge>
);

/**
 * Badge pour statut "En attente"
 */
export const PendingBadge: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Badge variant="pending" leftIcon={
    <div className="w-2 h-2 bg-yellow-600 rounded-full" />
  }>
    {children || "En attente"}
  </Badge>
);

/**
 * Badge pour statut "Réservé"
 */
export const ReservedBadge: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Badge variant="reserved" leftIcon={
    <div className="w-2 h-2 bg-blue-600 rounded-full" />
  }>
    {children || "Réservé"}
  </Badge>
);

// Export du composant et des variantes
export { Badge, badgeVariants };