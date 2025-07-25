// config/constants.js

export const PASSWORD_REQUIREMENTS = {
  minLength: 6,
  maxLength: 100,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  allowedSpecialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  blockedChars: '"\'`\\',
};
