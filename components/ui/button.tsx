/**
 * Fichier : components/ui/button.tsx
 * Description : Composant Button réutilisable avec différentes variantes
 * Basé sur : shadcn/ui button component
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// === DÉFINITION DES VARIANTES === //

/**
 * Variantes de style pour le bouton
 * Utilise cva (class-variance-authority) pour une gestion propre des variantes
 */
const buttonVariants = cva(
  // Classes de base communes à tous les boutons
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      // === VARIANTES DE STYLE === //
      variant: {
        // Bouton principal (bleu)
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        
        // Bouton destructeur (rouge) pour actions dangereuses
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        
        // Bouton outline avec bordure
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        
        // Bouton secondaire (gris clair)
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        
        // Bouton fantôme (transparent)
        ghost: "hover:bg-accent hover:text-accent-foreground",
        
        // Bouton lien (style de lien)
        link: "text-primary underline-offset-4 hover:underline",
        
        // Bouton avec dégradé (pour les CTA importants)
        gradient: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200",
        
        // Bouton success (vert)
        success: "bg-green-600 text-white hover:bg-green-700",
        
        // Bouton warning (orange)
        warning: "bg-orange-600 text-white hover:bg-orange-700",
      },
      
      // === VARIANTES DE TAILLE === //
      size: {
        // Taille par défaut
        default: "h-10 px-4 py-2",
        
        // Petite taille
        sm: "h-9 rounded-md px-3",
        
        // Grande taille (pour les CTA)
        lg: "h-11 rounded-md px-8",
        
        // Très grande taille (pour les hero sections)
        xl: "h-14 rounded-lg px-12 text-lg",
        
        // Bouton icône uniquement
        icon: "h-10 w-10",
        
        // Bouton icône petit
        "icon-sm": "h-8 w-8",
        
        // Bouton icône grand
        "icon-lg": "h-12 w-12",
      },
    },
    
    // === VARIANTES PAR DÉFAUT === //
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// === INTERFACE DU COMPOSANT === //

/**
 * Props du composant Button
 * Étend les props HTML button avec nos variantes personnalisées
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Si true, utilise Slot pour rendre l'enfant comme élément racine
   * Utile pour les liens avec asChild
   */
  asChild?: boolean;
  
  /**
   * État de chargement du bouton
   */
  loading?: boolean;
  
  /**
   * Icône à afficher à gauche du texte
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Icône à afficher à droite du texte
   */
  rightIcon?: React.ReactNode;
}

// === COMPOSANT PRINCIPAL === //

/**
 * Composant Button réutilisable
 * 
 * @example
 * // Bouton basique
 * <Button>Cliquez-moi</Button>
 * 
 * @example
 * // Bouton avec variante et taille
 * <Button variant="gradient" size="lg">
 *   Réserver maintenant
 * </Button>
 * 
 * @example
 * // Bouton comme lien
 * <Button asChild>
 *   <Link href="/contact">Contact</Link>
 * </Button>
 * 
 * @example
 * // Bouton avec état de chargement
 * <Button loading disabled>
 *   Chargement...
 * </Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { 
      className, 
      variant, 
      size, 
      asChild = false, 
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props 
    }, 
    ref
  ) => {
    // Utilise Slot si asChild est true, sinon utilise button
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          // Classes additionnelles pour le loading
          loading && "opacity-70 cursor-not-allowed",
          // Classes pour les animations hover
          "transition-all duration-200 ease-in-out"
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {/* Contenu du bouton avec icônes */}
        <span className="flex items-center justify-center gap-2">
          {/* Icône de gauche */}
          {leftIcon && !loading && (
            <span className="flex-shrink-0">
              {leftIcon}
            </span>
          )}
          
          {/* Indicateur de chargement */}
          {loading && (
            <span className="flex-shrink-0">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </span>
          )}
          
          {/* Contenu principal */}
          {children}
          
          {/* Icône de droite */}
          {rightIcon && !loading && (
            <span className="flex-shrink-0">
              {rightIcon}
            </span>
          )}
        </span>
      </Comp>
    );
  }
);

// Nom d'affichage pour le debug
Button.displayName = "Button";

// Export du composant et des variantes
export { Button, buttonVariants };