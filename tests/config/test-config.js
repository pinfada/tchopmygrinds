/**
 * Configuration globale pour les tests E2E
 * Contient les paramètres partagés par tous les tests
 */

const config = {
  // URLs des environnements
  environments: {
    development: {
      api: 'http://localhost:3000',
      frontend: 'http://localhost:3001'
    },
    production: {
      api: process.env.PROD_API_URL || 'https://your-prod-api.com',
      frontend: process.env.PROD_FRONTEND_URL || 'https://your-prod-app.com'
    }
  },

  // Configuration Puppeteer
  browser: {
    headless: process.env.CI ? true : false, // Headless en CI, visible en local
    defaultViewport: { width: 1280, height: 720 },
    slowMo: process.env.CI ? 0 : 100, // Ralentir en local pour observer
    timeout: 30000,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--allow-running-insecure-content'
    ]
  },

  // Timeouts
  timeouts: {
    navigation: 15000,
    element: 5000,
    api: 10000,
    screenshot: 3000
  },

  // Utilisateurs de test
  testUsers: {
    admin: {
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    },
    merchant: {
      email: 'merchant@test.com',
      password: 'password123',
      role: 'merchant'
    },
    customer: {
      email: 'customer@test.com',
      password: 'password123',
      role: 'customer'
    }
  },

  // Configuration des rapports
  reports: {
    outputDir: './tests/reports',
    screenshotDir: './tests/screenshots',
    format: 'json',
    includeScreenshots: true,
    includeTimings: true,
    retentionDays: 30
  },

  // Seuils de performance
  performance: {
    maxPageLoadTime: 5000,
    maxApiResponseTime: 2000,
    maxRenderTime: 1000
  },

  // Fonctionnalités à tester
  features: {
    authentication: {
      enabled: true,
      priority: 'high',
      endpoints: ['/api/v1/auth/login', '/api/v1/auth/register']
    },
    ratings: {
      enabled: true,
      priority: 'high',
      endpoints: ['/api/v1/ratings', '/api/v1/admin/ratings']
    },
    commerces: {
      enabled: true,
      priority: 'high',
      endpoints: ['/api/v1/commerces', '/api/v1/commerces/nearby']
    },
    products: {
      enabled: true,
      priority: 'high',
      endpoints: ['/api/v1/products', '/api/v1/products/search']
    },
    orders: {
      enabled: true,
      priority: 'medium',
      endpoints: ['/api/v1/orders']
    },
    geolocation: {
      enabled: true,
      priority: 'medium',
      mockLocation: { lat: 3.848, lng: 11.502 } // Yaoundé
    }
  }
};

module.exports = config;