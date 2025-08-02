/**
 * Fichier : components/ui/progress.tsx
 * Description : Composant Progress pour afficher des barres de progression
 * Basé sur : Radix UI Progress avec styles personnalisés
 */

"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

// === INTERFACE DU COMPOSANT === //

/**
 * Props du composant Progress
 */
export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /**
   * Valeur de progression (0-100)
   */
  value?: number;
  
  /**
   * Taille de la barre de progression
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Variante de couleur
   */
  variant?: 'default' | 'success' | 'warning' | 'danger';
  
  /**
   * Si l'animation doit être affichée
   */
  animated?: boolean;
  
  /**
   * Texte à afficher (pourcentage ou personnalisé)
   */
  showText?: boolean;
  
  /**
   * Texte personnalisé à afficher
   */
  customText?: string;
}

// === COMPOSANT PRINCIPAL === //

/**
 * Composant Progress réutilisable
 * 
 * @example
 * // Barre de progression basique
 * <Progress value={75} />
 * 
 * @example
 * // Avec texte et variante
 * <Progress 
 *   value={60} 
 *   variant="success" 
 *   size="lg"
 *   showText 
 * />
 * 
 * @example
 * // Avec animation
 * <Progress 
 *   value={45} 
 *   animated 
 *   customText="Chargement..."
 * />
 */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ 
  className, 
  value = 0, 
  size = 'md',
  variant = 'default',
  animated = false,
  showText = false,
  customText,
  ...props 
}, ref) => {
  
  // Classes de taille
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3', 
    lg: 'h-4'
  };
  
  // Classes de variante
  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-orange-500', 
    danger: 'bg-red-500'
  };
  
  // Calcule le pourcentage
  const percentage = Math.min(Math.max(value, 0), 100);
  
  return (
    <div className="relative w-full">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-full bg-secondary",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1 transition-all duration-500 ease-out",
            variantClasses[variant],
            animated && "animate-pulse"
          )}
          style={{ 
            transform: `translateX(-${100 - percentage}%)`,
          }}
        />
      </ProgressPrimitive.Root>
      
      {/* Texte de progression */}
      {(showText || customText) && (
        <div className="flex justify-center mt-1">
          <span className="text-xs text-muted-foreground font-medium">
            {customText || `${Math.round(percentage)}%`}
          </span>
        </div>
      )}
    </div>
  );
});

Progress.displayName = ProgressPrimitive.Root.displayName;

// === COMPOSANTS SPÉCIALISÉS === //

/**
 * Barre de progression circulaire
 */
export interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showText?: boolean;
  customText?: string;
  className?: string;
}

/**
 * Composant CircularProgress
 */
export const CircularProgress: React.FC<CircularProgressProps> = ({
  value = 0,
  size = 120,
  strokeWidth = 8,
  variant = 'default',
  showText = false,
  customText,
  className
}) => {
  // Calculs pour le cercle
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;
  
  // Couleurs selon la variante
  const colors = {
    default: '#3b82f6', // blue-500
    success: '#10b981', // green-500
    warning: '#f59e0b', // orange-500
    danger: '#ef4444'   // red-500
  };
  
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Cercle de fond */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        
        {/* Cercle de progression */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors[variant]}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      
      {/* Texte central */}
      {(showText || customText) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-gray-700">
            {customText || `${Math.round(normalizedValue)}%`}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Barre de progression avec étapes
 */
export interface SteppedProgressProps {
  currentStep: number;
  totalSteps: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabels?: boolean;
  labels?: string[];
  className?: string;
}

/**
 * Composant SteppedProgress
 */
export const SteppedProgress: React.FC<SteppedProgressProps> = ({
  currentStep,
  totalSteps,
  variant = 'default',
  showLabels = false,
  labels = [],
  className
}) => {
  const percentage = (currentStep / totalSteps) * 100;
  
  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-orange-500',
    danger: 'bg-red-500'
  };
  
  return (
    <div className={cn("w-full", className)}>
      {/* Barre de progression */}
      <div className="relative">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out rounded-full",
              variantClasses[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Points d'étapes */}
        <div className="absolute top-0 left-0 w-full h-2 flex justify-between">
          {Array.from({ length: totalSteps }, (_, index) => (
            <div
              key={index}
              className={cn(
                "w-3 h-3 rounded-full border-2 bg-white -mt-0.5",
                index < currentStep
                  ? `border-${variant === 'default' ? 'primary' : variant === 'success' ? 'green-500' : variant === 'warning' ? 'orange-500' : 'red-500'} bg-${variant === 'default' ? 'primary' : variant === 'success' ? 'green-500' : variant === 'warning' ? 'orange-500' : 'red-500'}`
                  : "border-gray-300"
              )}
            />
          ))}
        </div>
      </div>
      
      {/* Labels des étapes */}
      {showLabels && labels.length >= totalSteps && (
        <div className="flex justify-between mt-2">
          {labels.slice(0, totalSteps).map((label, index) => (
            <span
              key={index}
              className={cn(
                "text-xs font-medium",
                index < currentStep ? "text-gray-900" : "text-gray-500"
              )}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// === EXPORTS === //

export { Progress };