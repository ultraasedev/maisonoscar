/**
 * Fichier : lib/toast.ts
 * Description : Configuration et utilitaires pour Sonner (remplace l'ancien système toast)
 * Inclut : Configuration, helpers, types personnalisés
 */

import { toast } from 'sonner';
import React from 'react';

// === TYPES PERSONNALISÉS === //

/**
 * Options étendues pour les toasts
 */
export interface ToastOptions {
  /**
   * Durée d'affichage en millisecondes
   */
  duration?: number;
  
  /**
   * Position du toast
   */
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  
  /**
   * Si le toast doit être dismissible
   */
  dismissible?: boolean;
  
  /**
   * Action personnalisée
   */
  action?: {
    label: string;
    onClick: () => void;
  };
  
  /**
   * Callback quand le toast est fermé
   */
  onDismiss?: () => void;
  
  /**
   * Callback quand l'action est cliquée
   */
  onAutoClose?: () => void;
  
  /**
   * ID personnalisé pour le toast
   */
  id?: string;
  
  /**
   * Classes CSS personnalisées
   */
  className?: string;
  
  /**
   * Style inline personnalisé
   */
  style?: React.CSSProperties;
  
  /**
   * Description supplémentaire
   */
  description?: string;
  
  /**
   * Icône personnalisée
   */
  icon?: React.ReactNode;
}

// === CONFIGURATION GLOBALE === //

/**
 * Configuration par défaut pour Sonner
 */
export const defaultToastConfig = {
  position: 'top-right' as const,
  duration: 4000,
  dismissible: true,
  richColors: true,
  closeButton: true,
  expand: true,
  gap: 8,
  visibleToasts: 5,
  pauseWhenPageIsHidden: true,
  theme: 'light' as const,
};

// === HELPERS PERSONNALISÉS === //

/**
 * Toast de succès avec style personnalisé
 */
export const showSuccess = (message: string, options?: ToastOptions) => {
  return toast.success(message, {
    duration: options?.duration || 4000,
    description: options?.description,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
    onDismiss: options?.onDismiss,
    onAutoClose: options?.onAutoClose,
    id: options?.id,
    className: options?.className,
    style: options?.style,
    icon: options?.icon,
  });
};

/**
 * Toast d'erreur avec style personnalisé
 */
export const showError = (message: string, options?: ToastOptions) => {
  return toast.error(message, {
    duration: options?.duration || 6000, // Plus long pour les erreurs
    description: options?.description,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
    onDismiss: options?.onDismiss,
    onAutoClose: options?.onAutoClose,
    id: options?.id,
    className: options?.className,
    style: options?.style,
    icon: options?.icon,
  });
};

/**
 * Toast d'avertissement
 */
export const showWarning = (message: string, options?: ToastOptions) => {
  return toast.warning(message, {
    duration: options?.duration || 5000,
    description: options?.description,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
    onDismiss: options?.onDismiss,
    onAutoClose: options?.onAutoClose,
    id: options?.id,
    className: options?.className,
    style: options?.style,
    icon: options?.icon,
  });
};

/**
 * Toast d'information
 */
export const showInfo = (message: string, options?: ToastOptions) => {
  return toast.info(message, {
    duration: options?.duration || 4000,
    description: options?.description,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
    onDismiss: options?.onDismiss,
    onAutoClose: options?.onAutoClose,
    id: options?.id,
    className: options?.className,
    style: options?.style,
    icon: options?.icon,
  });
};

/**
 * Toast de chargement avec gestion automatique
 */
export const showLoading = (message: string, options?: ToastOptions) => {
  return toast.loading(message, {
    id: options?.id,
    description: options?.description,
    className: options?.className,
    style: options?.style,
  });
};

/**
 * Met à jour un toast de chargement existant
 */
export const updateLoadingToast = (
  toastId: string | number,
  type: 'success' | 'error' | 'warning' | 'info',
  message: string,
  options?: ToastOptions
) => {
  const updateOptions = {
    id: toastId,
    duration: options?.duration,
    description: options?.description,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
    onDismiss: options?.onDismiss,
    onAutoClose: options?.onAutoClose,
    className: options?.className,
    style: options?.style,
    icon: options?.icon,
  };

  switch (type) {
    case 'success':
      return toast.success(message, updateOptions);
    case 'error':
      return toast.error(message, updateOptions);
    case 'warning':
      return toast.warning(message, updateOptions);
    case 'info':
      return toast.info(message, updateOptions);
    default:
      return toast(message, updateOptions);
  }
};

/**
 * Toast personnalisé avec contenu React
 * Note: toast.custom() attend une fonction qui retourne un ReactElement
 */
export const showCustom = (
  content: React.ReactNode | ((id: string | number) => React.ReactElement),
  options?: ToastOptions
) => {
  // Si content est déjà une fonction, on l'utilise directement
  const renderFunction = typeof content === 'function' 
    ? content 
    : () => React.createElement('div', {}, content);

  return toast.custom(renderFunction, {
    duration: options?.duration || 4000,
    id: options?.id,
    onDismiss: options?.onDismiss,
    onAutoClose: options?.onAutoClose,
    className: options?.className,
    style: options?.style,
  });
};

/**
 * Toast de promesse (pour les actions async)
 */
export const showPromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  },
  options?: ToastOptions
) => {
  return toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
    duration: options?.duration,
    description: options?.description,
    action: options?.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
    id: options?.id,
    className: options?.className,
    style: options?.style,
  });
};

// === UTILITAIRES SPÉCIFIQUES AU CO-LIVING === //

/**
 * Toast pour les réservations
 */
export const showReservationToast = {
  /**
   * Confirmation de demande envoyée
   */
  requestSent: (housingName: string) => {
    showSuccess("Demande envoyée avec succès !", {
      description: `Votre demande pour ${housingName} a été transmise. Réponse sous 24-48h.`,
      action: {
        label: "Voir mes demandes",
        onClick: () => window.location.href = "/mon-compte/demandes"
      },
      duration: 6000,
    });
  },

  /**
   * Demande approuvée
   */
  approved: (housingName: string) => {
    showSuccess("Félicitations !", {
      description: `Votre demande pour ${housingName} a été acceptée ! Prochaine étape : signature du contrat.`,
      action: {
        label: "Voir les détails",
        onClick: () => window.location.href = "/mon-compte/contrats"
      },
      duration: 8000,
    });
  },

  /**
   * Demande refusée
   */
  rejected: (housingName: string, reason?: string) => {
    showError("Demande non retenue", {
      description: reason 
        ? `Votre demande pour ${housingName} n'a pas été retenue. Raison : ${reason}`
        : `Votre demande pour ${housingName} n'a pas été retenue. D'autres opportunités vous attendent !`,
      action: {
        label: "Voir d'autres logements",
        onClick: () => window.location.href = "/logements"
      },
      duration: 8000,
    });
  },

  /**
   * Rappel de documents manquants
   */
  documentsReminder: (missingDocs: string[]) => {
    showWarning("Documents manquants", {
      description: `Il vous manque : ${missingDocs.join(', ')}. Complétez votre dossier pour augmenter vos chances.`,
      action: {
        label: "Compléter mon dossier",
        onClick: () => window.location.href = "/mon-compte/documents"
      },
      duration: 6000,
    });
  },
};

/**
 * Toast pour les paiements
 */
export const showPaymentToast = {
  /**
   * Paiement réussi
   */
  success: (amount: number, method: string) => {
    showSuccess("Paiement confirmé !", {
      description: `${amount}€ ont été débités avec succès via ${method}.`,
      action: {
        label: "Voir le reçu",
        onClick: () => window.location.href = "/mon-compte/paiements"
      },
      duration: 6000,
    });
  },

  /**
   * Paiement échoué
   */
  failed: (reason?: string) => {
    showError("Paiement échoué", {
      description: reason || "Une erreur est survenue lors du paiement. Veuillez réessayer.",
      action: {
        label: "Réessayer",
        onClick: () => window.location.reload()
      },
      duration: 6000,
    });
  },

  /**
   * Rappel d'échéance
   */
  reminder: (amount: number, dueDate: string) => {
    showWarning("Échéance à venir", {
      description: `Un paiement de ${amount}€ est dû le ${dueDate}.`,
      action: {
        label: "Payer maintenant",
        onClick: () => window.location.href = "/mon-compte/paiements"
      },
      duration: 8000,
    });
  },

  /**
   * Retard de paiement
   */
  overdue: (amount: number, daysPast: number) => {
    showError("Paiement en retard", {
      description: `Un paiement de ${amount}€ est en retard de ${daysPast} jour(s). Régularisez rapidement.`,
      action: {
        label: "Payer maintenant",
        onClick: () => window.location.href = "/mon-compte/paiements"
      },
      duration: 10000,
    });
  },
};

/**
 * Toast système et administratif
 */
export const showSystemToast = {
  /**
   * Maintenance programmée
   */
  maintenanceScheduled: (date: string) => {
    showInfo("Maintenance programmée", {
      description: `Une maintenance est prévue le ${date}. Certaines fonctionnalités seront temporairement indisponibles.`,
      duration: 8000,
    });
  },

  /**
   * Nouvelle fonctionnalité
   */
  newFeature: (featureName: string) => {
    showInfo("Nouvelle fonctionnalité !", {
      description: `Découvrez ${featureName} dans votre espace personnel.`,
      action: {
        label: "Explorer",
        onClick: () => window.location.href = "/mon-compte"
      },
      duration: 6000,
    });
  },

  /**
   * Erreur de connexion
   */
  connectionError: () => {
    showError("Problème de connexion", {
      description: "Vérifiez votre connexion internet et réessayez.",
      action: {
        label: "Réessayer",
        onClick: () => window.location.reload()
      },
    });
  },

  /**
   * Erreur serveur
   */
  serverError: () => {
    showError("Erreur technique", {
      description: "Nos équipes ont été prévenues. Veuillez réessayer plus tard.",
      action: {
        label: "Contacter le support",
        onClick: () => window.location.href = "/contact"
      },
    });
  },

  /**
   * Maintenance
   */
  maintenance: () => {
    showInfo("Maintenance en cours", {
      description: "Certaines fonctionnalités peuvent être temporairement indisponibles.",
      duration: 6000,
    });
  },
};

// === EXPORT PAR DÉFAUT === //

// Export par défaut pour faciliter l'import
const toastUtils = {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  loading: showLoading,
  custom: showCustom,
  promise: showPromise,
  reservation: showReservationToast,
  payment: showPaymentToast,
  system: showSystemToast,
  updateLoading: updateLoadingToast,
  config: defaultToastConfig,
};

export default toastUtils;

// Re-export du toast de base pour compatibilité
export { toast };