export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  // Si pas de clé secrète, on est en dev, on accepte
  if (!secretKey) {
    console.warn('RECAPTCHA_SECRET_KEY non défini - mode dev');
    return true;
  }
  
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });
    
    const data = await response.json();
    
    return data.success === true;
  } catch (error) {
    console.error('Erreur lors de la vérification reCAPTCHA:', error);
    return false;
  }
}