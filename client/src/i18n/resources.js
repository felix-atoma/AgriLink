// config/resources.js
import enCommon from '../locales/en/common.json'
import enAuth from '../locales/en/auth.json'
import enProducts from '../locales/en/products.json'

import esCommon from '../locales/es/common.json'
import esAuth from '../locales/es/auth.json'
import esProducts from '../locales/es/products.json'

import frCommon from '../locales/fr/common.json'
import frAuth from '../locales/fr/auth.json'
import frProducts from '../locales/fr/products.json'

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    products: enProducts,
  },
  es: {
    common: esCommon,
    auth: esAuth,
    products: esProducts,
  },
  fr: {
    common: frCommon,
    auth: frAuth,
    products: frProducts,
  },
}

export default resources
