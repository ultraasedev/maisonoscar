'use client';

import { useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface ReCaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
}

export const ReCaptcha = ({ onVerify, onExpire, onError }: ReCaptchaProps) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    // Reset le captcha quand le composant est monté
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  }, []);

  const handleChange = (token: string | null) => {
    if (token) {
      onVerify(token);
    }
  };

  const handleExpired = () => {
    if (onExpire) {
      onExpire();
    }
    // Réinitialiser le captcha
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  const handleError = () => {
    if (onError) {
      onError();
    }
  };

  // Si pas de clé de site, ne pas afficher le captcha (dev mode)
  if (!siteKey) {
    console.warn('NEXT_PUBLIC_RECAPTCHA_SITE_KEY non défini');
    return (
      <div className="text-xs text-gray-500 italic">
        reCAPTCHA désactivé en mode développement
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={siteKey}
        onChange={handleChange}
        onExpired={handleExpired}
        onErrored={handleError}
        theme="light"
        size="normal"
      />
    </div>
  );
};