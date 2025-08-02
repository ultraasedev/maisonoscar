/**
 * Fichier : components/ui/select.tsx
 * Description : Composant Select amélioré avec meilleure lisibilité et UX
 * Mobile-first avec animations et micro-interactions
 */

'use client';

import * as React from "react";
import { ChevronDown, Check, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";

// === TYPES ET INTERFACES === //

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: React.ReactNode;
  group?: string;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

export interface SelectProps {
  options: SelectOption[] | SelectGroup[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  label?: string;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  maxSelections?: number;
  closeOnSelect?: boolean;
  className?: string;
  id?: string;
  customFilter?: (option: SelectOption, searchTerm: string) => boolean;
  noOptionsMessage?: string;
  onOpenChange?: (open: boolean) => void;
}

// === UTILITAIRES === //

const hasGroups = (options: SelectOption[] | SelectGroup[]): options is SelectGroup[] => {
  return options.length > 0 && 'options' in options[0];
};

const flattenOptions = (options: SelectOption[] | SelectGroup[]): SelectOption[] => {
  if (!hasGroups(options)) {
    return options;
  }
  
  return options.reduce<SelectOption[]>((acc, group) => {
    return [...acc, ...group.options];
  }, []);
};

const defaultFilter = (option: SelectOption, searchTerm: string): boolean => {
  const search = searchTerm.toLowerCase();
  return (
    option.label.toLowerCase().includes(search) ||
    option.value.toLowerCase().includes(search) ||
    (option.description ? option.description.toLowerCase().includes(search) : false)
  );
};

// === COMPOSANT PRINCIPAL === //

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Sélectionner...",
  multiple = false,
  searchable = false,
  searchPlaceholder = "Rechercher...",
  disabled = false,
  error = false,
  errorMessage,
  label,
  required = false,
  size = 'md',
  maxSelections,
  closeOnSelect = !multiple,
  className,
  id,
  customFilter = defaultFilter,
  noOptionsMessage = "Aucune option trouvée",
  onOpenChange,
}) => {
  // === ÉTAT LOCAL === //
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  
  // Refs
  const selectRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const optionsRef = React.useRef<HTMLDivElement>(null);
  
  // ID unique pour le composant
  const selectId = id || React.useId();
  
  // === GESTION DES OPTIONS === //
  
  const flatOptions = React.useMemo(() => flattenOptions(options), [options]);
  
  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return flatOptions;
    return flatOptions.filter(option => customFilter(option, searchTerm));
  }, [flatOptions, searchTerm, customFilter]);
  
  // === GESTION DES VALEURS === //
  
  const isSelected = (optionValue: string): boolean => {
    if (multiple && Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  };
  
  const selectedOptions = React.useMemo(() => {
    if (multiple && Array.isArray(value)) {
      return flatOptions.filter(option => value.includes(option.value));
    }
    if (!multiple && typeof value === 'string') {
      const option = flatOptions.find(option => option.value === value);
      return option ? [option] : [];
    }
    return [];
  }, [flatOptions, value, multiple]);
  
  // === GESTION DES ÉVÉNEMENTS === //
  
  const handleSelect = (optionValue: string) => {
    if (disabled) return;
    
    if (multiple && Array.isArray(value)) {
      let newValue: string[];
      
      if (value.includes(optionValue)) {
        newValue = value.filter(v => v !== optionValue);
      } else {
        if (maxSelections && value.length >= maxSelections) {
          return;
        }
        newValue = [...value, optionValue];
      }
      
      onChange?.(newValue);
    } else {
      onChange?.(optionValue);
    }
    
    if (closeOnSelect) {
      setIsOpen(false);
      setSearchTerm('');
    }
  };
  
  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple && Array.isArray(value)) {
      const newValue = value.filter(v => v !== optionValue);
      onChange?.(newValue);
    }
  };
  
  const toggleOpen = () => {
    if (disabled) return;
    
    const newOpenState = !isOpen;
    setIsOpen(newOpenState);
    onOpenChange?.(newOpenState);
    
    if (newOpenState && searchable) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  };

  // === GESTION DU CLAVIER === //
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
        }
        break;
        
      case 'Enter':
        e.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          handleSelect(filteredOptions[focusedIndex].value);
        } else {
          toggleOpen();
        }
        break;
        
      case 'Escape':
        if (isOpen) {
          setIsOpen(false);
          setSearchTerm('');
        }
        break;
    }
  };

  // === FERMETURE AU CLIC EXTÉRIEUR === //
  
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // === SCROLL VERS L'OPTION FOCUSÉE === //
  
  React.useEffect(() => {
    if (isOpen && focusedIndex >= 0 && optionsRef.current) {
      const focusedElement = optionsRef.current.children[focusedIndex] as HTMLElement;
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex, isOpen]);

  // === STYLES === //
  
  const sizeClasses = {
    sm: 'h-9 text-sm px-3',
    md: 'h-12 text-base px-4',
    lg: 'h-14 text-lg px-5'
  };

  const containerClasses = cn('relative', className);
  
  const triggerClasses = cn(
    'relative w-full rounded-xl border bg-white transition-all duration-200 flex items-center justify-between cursor-pointer',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    'hover:border-blue-300 hover:shadow-md',
    sizeClasses[size],
    error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300',
    disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
    isOpen && 'ring-2 ring-blue-500 ring-offset-2 border-blue-500 shadow-lg'
  );
  
  const optionsClasses = cn(
    'absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-auto',
    'animate-in fade-in-0 zoom-in-95 duration-200'
  );

  // === RENDU === //
  
  return (
    <div className={containerClasses}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Select principal */}
      <div ref={selectRef} className="relative">
        {/* Trigger */}
        <div
          id={selectId}
          onClick={toggleOpen}
          onKeyDown={handleKeyDown}
          className={triggerClasses}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          tabIndex={disabled ? -1 : 0}
        >
          {/* Contenu sélectionné */}
          <div className="flex-1 flex items-center gap-2 overflow-hidden">
            {selectedOptions.length === 0 ? (
              <span className="text-gray-500 font-medium">{placeholder}</span>
            ) : multiple ? (
              /* Multi-select : Tags */
              <div className="flex flex-wrap gap-1 max-w-full">
                {selectedOptions.slice(0, 3).map((option) => (
                  <span
                    key={option.value}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-lg"
                  >
                    {option.icon && <span className="w-3 h-3">{option.icon}</span>}
                    <span className="truncate max-w-20">{option.label}</span>
                    <button
                      onClick={(e) => handleRemove(option.value, e)}
                      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors duration-150"
                      type="button"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedOptions.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg">
                    +{selectedOptions.length - 3}
                  </span>
                )}
              </div>
            ) : (
              /* Single select */
              <div className="flex items-center gap-2">
                {selectedOptions[0]?.icon && (
                  <span className="w-4 h-4 flex-shrink-0">
                    {selectedOptions[0].icon}
                  </span>
                )}
                <span className="truncate font-medium text-gray-900">
                  {selectedOptions[0]?.label}
                </span>
              </div>
            )}
          </div>
          
          {/* Icône chevron */}
          <ChevronDown 
            className={cn(
              'w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0',
              isOpen && 'rotate-180'
            )} 
          />
        </div>
        
        {/* Liste des options */}
        {isOpen && (
          <div ref={optionsRef} className={optionsClasses}>
            {/* Barre de recherche */}
            {searchable && (
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            )}
            
            {/* Options */}
            <div className="py-2">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-500 text-sm">
                  {noOptionsMessage}
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const selected = isSelected(option.value);
                  const focused = index === focusedIndex;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      disabled={option.disabled}
                      className={cn(
                        'w-full text-left px-4 py-3 transition-all duration-150 flex items-center justify-between group',
                        'hover:bg-blue-50 focus:bg-blue-50 focus:outline-none',
                        selected && 'bg-blue-100 text-blue-900',
                        focused && 'bg-blue-50',
                        option.disabled && 'opacity-50 cursor-not-allowed'
                      )}
                      role="option"
                      aria-selected={selected}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {option.icon && (
                          <span className="w-4 h-4 flex-shrink-0">
                            {option.icon}
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            'font-medium truncate',
                            selected ? 'text-blue-900' : 'text-gray-900'
                          )}>
                            {option.label}
                          </div>
                          {option.description && (
                            <div className="text-sm text-gray-500 truncate mt-0.5">
                              {option.description}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {selected && (
                        <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Message d'erreur */}
      {error && errorMessage && (
        <p className="mt-2 text-sm text-red-600 font-medium">
          {errorMessage}
        </p>
      )}
    </div>
  );
};