// Validation de sécurité pour l'authentification

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Validation robuste de l'email
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('L\'email est requis');
    return { isValid: false, errors };
  }

  // RFC 5322 compliant regex (simplifié mais robuste)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    errors.push('Format d\'email invalide');
  }

  if (email.length > 254) {
    errors.push('L\'email est trop long (maximum 254 caractères)');
  }

  return { isValid: errors.length === 0, errors };
};

// Validation forte du mot de passe selon OWASP
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Le mot de passe est requis');
    return { isValid: false, errors };
  }

  // Longueur minimum
  if (password.length < 12) {
    errors.push('Le mot de passe doit contenir au moins 12 caractères');
  }

  // Longueur maximum pour éviter les attaques DoS
  if (password.length > 128) {
    errors.push('Le mot de passe est trop long (maximum 128 caractères)');
  }

  // Au moins une majuscule
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
  }

  // Au moins une minuscule
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
  }

  // Au moins un chiffre
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }

  // Au moins un caractère spécial
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  }

  // Vérifier contre les mots de passe communs (liste simplifiée)
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];
  
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Le mot de passe contient des termes trop communs');
  }

  return { isValid: errors.length === 0, errors };
};

// Validation du nom (désinfection XSS)
export const validateName = (name: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!name?.trim()) {
    errors.push('Le nom est requis');
    return { isValid: false, errors };
  }

  // Longueur
  if (name.trim().length < 2) {
    errors.push('Le nom doit contenir au moins 2 caractères');
  }

  if (name.length > 50) {
    errors.push('Le nom est trop long (maximum 50 caractères)');
  }

  // Caractères autorisés (lettres, espaces, traits d'union, apostrophes)
  const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
  if (!nameRegex.test(name)) {
    errors.push('Le nom contient des caractères non autorisés');
  }

  // Prévention XSS basique
  const xssPatterns = [/<script/i, /javascript:/i, /on\w+=/i, /<iframe/i];
  if (xssPatterns.some(pattern => pattern.test(name))) {
    errors.push('Le nom contient des caractères dangereux');
  }

  return { isValid: errors.length === 0, errors };
};

// Fonction de désinfection générale
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Supprimer les brackets HTML
    .replace(/javascript:/gi, '') // Supprimer javascript:
    .replace(/on\w+=/gi, ''); // Supprimer les event handlers
};

// Calcul de la force du mot de passe
export const calculatePasswordStrength = (password: string): {
  score: number;
  label: 'Très faible' | 'Faible' | 'Moyen' | 'Fort' | 'Très fort';
  suggestions: string[];
} => {
  let score = 0;
  const suggestions: string[] = [];

  if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;
  else suggestions.push('Utilisez au moins 12 caractères');

  if (/[a-z]/.test(password)) score += 1;
  else suggestions.push('Ajoutez des lettres minuscules');

  if (/[A-Z]/.test(password)) score += 1;
  else suggestions.push('Ajoutez des lettres majuscules');

  if (/\d/.test(password)) score += 1;
  else suggestions.push('Ajoutez des chiffres');

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 2;
  else suggestions.push('Ajoutez des caractères spéciaux');

  // Bonus pour la diversité
  const uniqueChars = new Set(password).size;
  if (uniqueChars > password.length * 0.7) score += 1;

  let label: 'Très faible' | 'Faible' | 'Moyen' | 'Fort' | 'Très fort';
  if (score <= 2) label = 'Très faible';
  else if (score <= 4) label = 'Faible';
  else if (score <= 6) label = 'Moyen';
  else if (score <= 7) label = 'Fort';
  else label = 'Très fort';

  return { score, label, suggestions };
};