// config/resources.js
import enCommon from '../locales/en/common.json'
import enAuth from '../locales/en/auth.json'
import enProducts from '../locales/en/products.json'
import enOrders from '../locales/en/orders.json'

import esCommon from '../locales/es/common.json'
import esAuth from '../locales/es/auth.json'
import esProducts from '../locales/es/products.json'
import esOrders from '../locales/es/orders.json'

import frCommon from '../locales/fr/common.json'
import frAuth from '../locales/fr/auth.json'
import frProducts from '../locales/fr/products.json'
import frOrders from '../locales/fr/orders.json'

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    products: enProducts,
    orders: enOrders,
  },
  es: {
    common: esCommon,
    auth: esAuth,
    products: esProducts,
    orders: esOrders,
  },
  fr: {
    common: frCommon,
    auth: frAuth,
    products: frProducts,
    orders: frOrders,
  },
}

export default resources
