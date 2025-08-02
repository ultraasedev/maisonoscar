/**
 * Fichier : components/ui/textarea.tsx
 * Description : Composant Textarea réutilisable pour les formulaires
 * Inclut : Différentes tailles, états d'erreur, auto-resize
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// === DÉFINITION DES VARIANTES === //

/**
 * Variantes de style pour le textarea
 */
const textareaVariants = cva(
  // Classes de base communes à tous les textareas
  "flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
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
        
        // Style avec ombre
        shadow: "border-input shadow-sm focus:shadow-md transition-shadow",
      },
      
      // === VARIANTES DE TAILLE === //
      size: {
        // Taille par défaut
        default: "min-h-[80px]",
        
        // Petite taille
        sm: "min-h-[60px] text-xs",
        
        // Grande taille
        lg: "min-h-[120px] text-base",
        
        // Très grande taille
        xl: "min-h-[200px] text-lg",
      },
      
      // === ÉTAT DU TEXTAREA === //
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
      size: "default",
      state: "default",
    },
  }
);

// === INTERFACE DU COMPOSANT === //

/**
 * Props du composant Textarea
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  /**
   * Texte d'aide affiché sous le textarea
   */
  helperText?: string;
  
  /**
   * Message d'erreur
   */
  error?: string;
  
  /**
   * Label du textarea
   */
  label?: string;
  
  /**
   * Si le label est obligatoire (affiche *)
   */
  required?: boolean;
  
  /**
   * Nombre maximum de caractères
   */
  maxLength?: number;
  
  /**
   * Si le compteur de caractères doit être affiché
   */
  showCharacterCount?: boolean;
  
  /**
   * Si le textarea doit se redimensionner automatiquement
   */
  autoResize?: boolean;
  
  /**
   * Hauteur minimum en cas d'auto-resize
   */
  minRows?: number;
  
  /**
   * Hauteur maximum en cas d'auto-resize
   */
  maxRows?: number;
}

// === COMPOSANT PRINCIPAL === //

/**
 * Composant Textarea réutilisable
 * 
 * @example
 * // Textarea basique
 * <Textarea placeholder="Votre message..." />
 * 
 * @example
 * // Textarea avec label et erreur
 * <Textarea
 *   label="Description"
 *   error="Ce champ est requis"
 *   required
 * />
 * 
 * @example
 * // Textarea avec auto-resize
 * <Textarea
 *   autoResize
 *   minRows={3}
 *   maxRows={10}
 *   placeholder="Tapez votre message..."
 * />
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    variant,
    size,
    state,
    helperText,
    error,
    label,
    required,
    maxLength,
    showCharacterCount = false,
    autoResize = false,
    minRows = 3,
    maxRows = 10,
    id,
    value,
    onChange,
    ...props 
  }, ref) => {
    
    // === ÉTAT LOCAL === //
    const [textValue, setTextValue] = React.useState(value || '');
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    
    // Génère un ID unique si pas fourni
    const textareaId = id || React.useId();
    
    // Détermine l'état en fonction de l'erreur
    const textareaState = error ? "error" : state;
    
    // === AUTO-RESIZE === //
    
    /**
     * Ajuste automatiquement la hauteur du textarea
     */
    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea || !autoResize) return;
      
      // Reset height pour calculer la nouvelle hauteur
      textarea.style.height = 'auto';
      
      // Calcule la hauteur nécessaire
      const scrollHeight = textarea.scrollHeight;
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
      const minHeight = lineHeight * minRows;
      const maxHeight = lineHeight * maxRows;
      
      // Applique la nouvelle hauteur
      const newHeight = Math.max(minHeight, Math.min(maxHeight, scrollHeight));
      textarea.style.height = `${newHeight}px`;
    }, [autoResize, minRows, maxRows]);
    
    // Ajuste la hauteur lors du changement de contenu
    React.useEffect(() => {
      adjustHeight();
    }, [textValue, adjustHeight]);
    
    // === GESTION DES CHANGEMENTS === //
    
    /**
     * Gère le changement de valeur
     */
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      
      // Vérifie la limite de caractères
      if (maxLength && newValue.length > maxLength) {
        return;
      }
      
      setTextValue(newValue);
      onChange?.(e);
      
      // Ajuste la hauteur si auto-resize est activé
      if (autoResize) {
        adjustHeight();
      }
    };
    
    // === COMBINAISON DES REFS === //
    
    /**
     * Combine les refs externe et interne
     */
    const combinedRef = React.useCallback(
      (node: HTMLTextAreaElement) => {
        // Assigne à la ref interne
        if (textareaRef.current !== node) {
          textareaRef.current = node;
        }
        
        // Assigne à la ref externe si fournie
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );
    
    // === CALCUL DU NOMBRE DE CARACTÈRES === //
    
    const characterCount = String(textValue).length;
    const isNearLimit = maxLength && characterCount >= maxLength * 0.8;
    const isAtLimit = maxLength && characterCount >= maxLength;
    
    // === RENDU DU COMPOSANT === //
    
    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label 
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {/* Container du textarea */}
        <div className="relative">
          <textarea
            id={textareaId}
            className={cn(
              textareaVariants({ variant, size, state: textareaState }),
              // Style spécifique pour auto-resize
              autoResize && "resize-none overflow-hidden",
              className
            )}
            ref={combinedRef}
            value={textValue}
            onChange={handleChange}
            style={autoResize ? { minHeight: `${minRows * 1.5}rem` } : undefined}
            {...props}
          />
          
          {/* Compteur de caractères */}
          {(showCharacterCount || maxLength) && (
            <div className="absolute bottom-2 right-2 text-xs pointer-events-none">
              <span className={cn(
                "bg-white/90 px-1 py-0.5 rounded",
                isAtLimit && "text-red-600",
                isNearLimit && !isAtLimit && "text-orange-600",
                !isNearLimit && "text-gray-500"
              )}>
                {characterCount}
                {maxLength && `/${maxLength}`}
              </span>
            </div>
          )}
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
        
        {/* Message d'avertissement pour la limite de caractères */}
        {maxLength && isNearLimit && !error && (
          <p className={cn(
            "mt-1 text-xs",
            isAtLimit ? "text-red-600" : "text-orange-600"
          )}>
            {isAtLimit 
              ? "Limite de caractères atteinte" 
              : `Plus que ${maxLength - characterCount} caractères`
            }
          </p>
        )}
      </div>
    );
  }
);

// Nom d'affichage pour le debug
Textarea.displayName = "Textarea";

// === COMPOSANTS SPÉCIALISÉS === //

/**
 * Textarea pour les commentaires avec compteur
 */
export const CommentTextarea = React.forwardRef<HTMLTextAreaElement, Omit<TextareaProps, 'maxLength' | 'showCharacterCount'>>(
  (props, ref) => {
    return (
      <Textarea
        {...props}
        ref={ref}
        maxLength={500}
        showCharacterCount
        placeholder="Partagez vos commentaires..."
        helperText="Décrivez vos attentes ou posez vos questions"
      />
    );
  }
);

CommentTextarea.displayName = "CommentTextarea";

/**
 * Textarea pour les descriptions longues
 */
export const DescriptionTextarea = React.forwardRef<HTMLTextAreaElement, Omit<TextareaProps, 'autoResize' | 'minRows' | 'maxRows'>>(
  (props, ref) => {
    return (
      <Textarea
        {...props}
        ref={ref}
        autoResize
        minRows={4}
        maxRows={12}
        size="lg"
        placeholder="Décrivez en détail..."
      />
    );
  }
);

DescriptionTextarea.displayName = "DescriptionTextarea";

// Export du composant et des variantes
export { Textarea, textareaVariants };