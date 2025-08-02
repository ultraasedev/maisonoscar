/**
 * Fichier : components/ui/input.tsx
 * Description : Composant Input réutilisable pour les formulaires
 * Inclut : Différentes variantes, états d'erreur, icônes
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// === DÉFINITION DES VARIANTES === //

/**
 * Variantes de style pour l'input
 */
const inputVariants = cva(
  // Classes de base communes à tous les inputs
  "flex w-full rounded-md border bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      // === VARIANTES DE STYLE === //
      variant: {
        // Style par défaut
        default: "border-input",
        
        // Style avec bordure plus marquée
        outlined: "border-2 border-gray-300 focus:border-primary",
        
        // Style sans bordure (fond coloré)
        filled: "border-transparent bg-gray-100 focus:bg-white focus:ring-2 focus:ring-primary",
        
        // Style fantôme (bordure uniquement en bas)
        ghost: "border-0 border-b-2 border-gray-300 rounded-none focus:border-primary bg-transparent",
        
        // Style avec ombre
        shadow: "border-input shadow-sm focus:shadow-md transition-shadow",
      },
      
      // === VARIANTES DE TAILLE === //
      inputSize: {
        // Taille par défaut
        default: "h-10 px-3 py-2",
        
        // Petite taille
        sm: "h-8 px-2 py-1 text-xs",
        
        // Grande taille
        lg: "h-12 px-4 py-3 text-base",
        
        // Très grande taille
        xl: "h-14 px-5 py-4 text-lg",
      },
      
      // === ÉTAT DE L'INPUT === //
      state: {
        // État normal
        default: "",
        
        // État d'erreur
        error: "border-red-500 focus:ring-red-500 focus:border-red-500",
        
        // État de succès
        success: "border-green-500 focus:ring-green-500 focus:border-green-500",
        
        // État d'avertissement
        warning: "border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500",
      }
    },
    
    // === VARIANTES PAR DÉFAUT === //
    defaultVariants: {
      variant: "default",
      inputSize: "default",
      state: "default",
    },
  }
);

// === INTERFACE DU COMPOSANT === //

/**
 * Props du composant Input
 * Exclut la propriété 'size' de InputHTMLAttributes pour éviter le conflit avec VariantProps
 */
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /**
   * Icône à afficher à gauche de l'input
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Icône à afficher à droite de l'input
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Texte d'aide affiché sous l'input
   */
  helperText?: string;
  
  /**
   * Message d'erreur
   */
  error?: string;
  
  /**
   * Label de l'input
   */
  label?: string;
  
  /**
   * Si le label est obligatoire (affiche *)
   */
  required?: boolean;
  
  /**
   * Si l'input est en mode loading
   */
  loading?: boolean;
  
  /**
   * Action personnalisée à droite (ex: bouton clear)
   */
  rightAction?: React.ReactNode;
  
  /**
   * Taille HTML native de l'input (différente de inputSize qui est pour le style)
   */
  htmlSize?: number;
}

// === COMPOSANT PRINCIPAL === //

/**
 * Composant Input réutilisable
 * 
 * @example
 * // Input basique
 * <Input placeholder="Tapez votre texte..." />
 * 
 * @example
 * // Input avec label et erreur
 * <Input
 *   label="Email"
 *   type="email"
 *   error="Email invalide"
 *   required
 * />
 * 
 * @example
 * // Input avec icônes
 * <Input
 *   leftIcon={<Mail className="w-4 h-4" />}
 *   rightIcon={<Eye className="w-4 h-4" />}
 *   placeholder="Email"
 * />
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant,
    inputSize,
    state,
    type = "text",
    leftIcon,
    rightIcon,
    helperText,
    error,
    label,
    required,
    loading,
    rightAction,
    htmlSize,
    id,
    ...props 
  }, ref) => {
    
    // Génère un ID unique si pas fourni
    const inputId = id || React.useId();
    
    // Détermine l'état en fonction de l'erreur
    const inputState = error ? "error" : state;
    
    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {/* Container de l'input */}
        <div className="relative">
          {/* Icône de gauche */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          {/* Input principal */}
          <input
            id={inputId}
            type={type}
            size={htmlSize} // Utilise htmlSize pour la propriété HTML native
            className={cn(
              inputVariants({ variant, inputSize, state: inputState }),
              // Ajustement du padding si icônes présentes
              leftIcon && "pl-10",
              (rightIcon || rightAction || loading) && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          
          {/* Contenu à droite (icône, action ou loading) */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {/* Indicateur de loading */}
            {loading && (
              <div className="text-gray-400">
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
              </div>
            )}
            
            {/* Action personnalisée */}
            {!loading && rightAction && rightAction}
            
            {/* Icône de droite */}
            {!loading && !rightAction && rightIcon && (
              <div className="text-gray-400 pointer-events-none">
                {rightIcon}
              </div>
            )}
          </div>
        </div>
        
        {/* Texte d'aide ou message d'erreur */}
        {(helperText || error) && (
          <p className={cn(
            "mt-1 text-sm",
            error 
              ? "text-red-600" 
              : "text-gray-500"
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

// Nom d'affichage pour le debug
Input.displayName = "Input";

// === COMPOSANTS SPÉCIALISÉS === //

/**
 * Input pour mot de passe avec bouton show/hide
 */
export const PasswordInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'rightAction'>>(
  (props, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    
    const togglePassword = () => {
      setShowPassword(!showPassword);
    };
    
    return (
      <Input
        {...props}
        ref={ref}
        type={showPassword ? "text" : "password"}
        rightAction={
          <button
            type="button"
            onClick={togglePassword}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        }
      />
    );
  }
);

PasswordInput.displayName = "PasswordInput";

/**
 * Input de recherche avec icône et bouton clear
 */
export const SearchInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'leftIcon' | 'rightAction'>>(
  ({ value, onChange, ...props }, ref) => {
    const [searchValue, setSearchValue] = React.useState(value || '');
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(e.target.value);
      onChange?.(e);
    };
    
    const clearSearch = () => {
      setSearchValue('');
      onChange?.({
        target: { value: '' }
      } as React.ChangeEvent<HTMLInputElement>);
    };
    
    return (
      <Input
        {...props}
        ref={ref}
        value={searchValue}
        onChange={handleChange}
        leftIcon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
        rightAction={
          searchValue ? (
            <button
              type="button"
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : undefined
        }
      />
    );
  }
);

SearchInput.displayName = "SearchInput";

// === EXPORTS === //

export { Input, inputVariants };