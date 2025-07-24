import { fileURLToPath } from 'url';
import path from 'path';
import i18n from '../config/i18n.js'; // Changed from '../config/i18n.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const detectLanguage = (req, res, next) => {
  const lang = req.headers['accept-language'] || 'en';
  i18n.setLocale(lang);
  req.language = lang;
  next();
};