/**
 * Fichier : components/ui/card.tsx
 * Description : Composants Card réutilisables pour afficher du contenu structuré
 * Inclut : Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
 */

import * as React from "react";
import { cn } from "@/lib/utils";

// === COMPOSANT CARD PRINCIPAL === //

/**
 * Props du composant Card principal
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Variante de style de la carte
   */
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
  
  /**
   * Si la carte est interactive (hover effects)
   */
  interactive?: boolean;
}

/**
 * Composant Card principal - conteneur de base
 * 
 * @example
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Titre</CardTitle>
 *     <CardDescription>Description</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     Contenu de la carte
 *   </CardContent>
 * </Card>
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', interactive = false, ...props }, ref) => {
    // Classes de base pour la carte
    const baseClasses = "rounded-lg border text-card-foreground";
    
    // Classes selon la variante
    const variantClasses = {
      default: "bg-card shadow-sm",
      elevated: "bg-card shadow-lg hover:shadow-xl transition-shadow duration-300",
      outlined: "bg-card border-2 border-border",
      ghost: "bg-transparent border-transparent shadow-none"
    };
    
    // Classes pour l'interactivité
    const interactiveClasses = interactive 
      ? "transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer" 
      : "";
    
    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          interactiveClasses,
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

// === COMPOSANT CARD HEADER === //

/**
 * Props du composant CardHeader
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Alignement du contenu
   */
  align?: 'left' | 'center' | 'right';
}

/**
 * Composant CardHeader - en-tête de la carte
 * Contient généralement le titre et la description
 */
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, align = 'left', ...props }, ref) => {
    const alignClasses = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col space-y-1.5 p-6",
          alignClasses[align],
          className
        )}
        {...props}
      />
    );
  }
);
CardHeader.displayName = "CardHeader";

// === COMPOSANT CARD TITLE === //

/**
 * Props du composant CardTitle
 */
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * Niveau de titre (h1, h2, h3, etc.)
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  
  /**
   * Taille du titre
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Composant CardTitle - titre principal de la carte
 */
const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, as: Component = 'h3', size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'text-lg font-semibold',
      md: 'text-xl font-semibold', 
      lg: 'text-2xl font-bold',
      xl: 'text-3xl font-bold'
    };
    
    return (
      <Component
        ref={ref as any}
        className={cn(
          "leading-none tracking-tight",
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
CardTitle.displayName = "CardTitle";

// === COMPOSANT CARD DESCRIPTION === //

/**
 * Props du composant CardDescription
 */
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  /**
   * Taille du texte de description
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Composant CardDescription - description/sous-titre de la carte
 */
const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base'
    };
    
    return (
      <p
        ref={ref}
        className={cn(
          "text-muted-foreground leading-relaxed",
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
CardDescription.displayName = "CardDescription";

// === COMPOSANT CARD CONTENT === //

/**
 * Props du composant CardContent
 */
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Espacement interne
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Composant CardContent - contenu principal de la carte
 */
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, padding = 'md', ...props }, ref) => {
    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-6',
      lg: 'p-8'
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          paddingClasses[padding],
          // Supprime le padding top si il y a un header
          "pt-0",
          className
        )}
        {...props}
      />
    );
  }
);
CardContent.displayName = "CardContent";

// === COMPOSANT CARD FOOTER === //

/**
 * Props du composant CardFooter
 */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Justification du contenu
   */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  
  /**
   * Espacement interne
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Composant CardFooter - pied de la carte
 * Contient généralement des boutons d'action
 */
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, justify = 'start', padding = 'md', ...props }, ref) => {
    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around'
    };
    
    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-6',
      lg: 'p-8'
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center pt-0",
          justifyClasses[justify],
          paddingClasses[padding],
          className
        )}
        {...props}
      />
    );
  }
);
CardFooter.displayName = "CardFooter";

// === EXPORTS === //

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent 
};