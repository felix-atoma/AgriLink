// Frontend-only validations
export const validateEmail = (email = '') => {
  const re = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return email ? re.test(email.trim()) : false;
};

export const validatePassword = (password = '') => {
  const trimmed = password.trim();
  return trimmed.length >= 8 &&
         /[A-Z]/.test(trimmed) &&
         /[0-9]/.test(trimmed);
};

// Simplified ObjectId validation for frontend
export const isValidObjectId = (id) => {
  return id && /^[0-9a-fA-F]{24}$/.test(id);
};