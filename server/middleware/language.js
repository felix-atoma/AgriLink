import i18n from '../config/i18n.js';

export const detectLanguage = (req, res, next) => {
  const lang = req.headers['accept-language'] || 'en';
  i18n.setLocale(lang);
  req.language = lang;
  next();
};