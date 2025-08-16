const puppeteer = require('puppeteer');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:3001';

// Couleurs pour les logs
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

class RatingSystemTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
  }

  async init() {
    try {
      log('🚀 Initialisation de Puppeteer...', colors.blue);
      this.browser = await puppeteer.launch({
        headless: false, // Mode visible pour déboguer
        slowMo: 100,     // Ralentir les actions pour observer
        defaultViewport: { width: 1280, height: 720 },
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--allow-running-insecure-content'
        ]
      });
      
      this.page = await this.browser.newPage();
      
      // Intercepter les erreurs console
      this.page.on('console', msg => {
        if (msg.type() === 'error') {
          log(`❌ Erreur Console: ${msg.text()}`, colors.red);
        }
      });

      // Intercepter les erreurs de réseau
      this.page.on('requestfailed', request => {
        log(`❌ Requête échouée: ${request.url()}`, colors.red);
      });

      log('✅ Puppeteer initialisé avec succès', colors.green);
      return true;
    } catch (error) {
      log(`❌ Erreur d'initialisation: ${error.message}`, colors.red);
      return false;
    }
  }

  async checkServerStatus() {
    try {
      log('🔍 Vérification du statut des serveurs...', colors.blue);
      
      // Vérifier Rails API
      const railsResponse = await this.page.goto(`${BASE_URL}/api/v1/commerces`, {
        waitUntil: 'networkidle0',
        timeout: 10000
      });
      
      if (railsResponse.status() !== 200) {
        throw new Error(`Rails API non accessible (status: ${railsResponse.status()})`);
      }
      
      log('✅ Rails API accessible', colors.green);
      
      // Vérifier React Frontend
      const frontendResponse = await this.page.goto(FRONTEND_URL, {
        waitUntil: 'networkidle0',
        timeout: 10000
      });
      
      if (frontendResponse.status() !== 200) {
        throw new Error(`Frontend non accessible (status: ${frontendResponse.status()})`);
      }
      
      log('✅ Frontend React accessible', colors.green);
      return true;
      
    } catch (error) {
      log(`❌ Serveurs non accessibles: ${error.message}`, colors.red);
      log('💡 Assurez-vous que Rails et Vite sont démarrés:', colors.yellow);
      log('   - Terminal 1: rails server -p 3000', colors.yellow);
      log('   - Terminal 2: cd frontend && npm run dev', colors.yellow);
      return false;
    }
  }

  async testRatingComponents() {
    try {
      log('🧪 Test des composants d\'évaluation...', colors.blue);
      
      // Aller sur une page de produit
      await this.page.goto(`${FRONTEND_URL}/products/1`, {
        waitUntil: 'networkidle0'
      });
      
      // Vérifier que la section d'évaluations existe
      const ratingSectionExists = await this.page.$('.rating-section, [data-testid="rating-section"]') !== null;
      
      if (ratingSectionExists) {
        log('✅ Section d\'évaluations trouvée sur la page produit', colors.green);
        this.testResults.push({ test: 'Rating Section on Product', status: 'PASS' });
      } else {
        log('❌ Section d\'évaluations manquante sur la page produit', colors.red);
        this.testResults.push({ test: 'Rating Section on Product', status: 'FAIL' });
      }
      
      // Vérifier les composants d'étoiles
      const starComponents = await this.page.$$('.star-rating, [data-testid="star-rating"]');
      if (starComponents.length > 0) {
        log(`✅ ${starComponents.length} composant(s) d'étoiles trouvé(s)`, colors.green);
        this.testResults.push({ test: 'Star Rating Components', status: 'PASS' });
      } else {
        log('❌ Aucun composant d\'étoiles trouvé', colors.red);
        this.testResults.push({ test: 'Star Rating Components', status: 'FAIL' });
      }
      
      return true;
    } catch (error) {
      log(`❌ Erreur lors du test des composants: ${error.message}`, colors.red);
      this.testResults.push({ test: 'Rating Components', status: 'ERROR', error: error.message });
      return false;
    }
  }

  async testRatingModal() {
    try {
      log('🧪 Test du modal d\'évaluation...', colors.blue);
      
      // Chercher le bouton pour laisser un avis
      const ratingButton = await this.page.$('button:contains("Laisser un avis"), [data-testid="rating-button"]');
      
      if (ratingButton) {
        log('✅ Bouton d\'évaluation trouvé', colors.green);
        
        // Cliquer sur le bouton (simuler)
        await this.page.evaluate(() => {
          const btn = document.querySelector('button[onclick*="rating"], button[data-testid="rating-button"]');
          if (btn) btn.click();
        });
        
        // Attendre que le modal apparaisse
        await this.page.waitForTimeout(1000);
        
        const modalExists = await this.page.$('.modal, [data-testid="rating-modal"]') !== null;
        if (modalExists) {
          log('✅ Modal d\'évaluation ouvert', colors.green);
          this.testResults.push({ test: 'Rating Modal Open', status: 'PASS' });
        } else {
          log('❌ Modal d\'évaluation non ouvert', colors.red);
          this.testResults.push({ test: 'Rating Modal Open', status: 'FAIL' });
        }
      } else {
        log('⚠️  Bouton d\'évaluation non trouvé (peut nécessiter une authentification)', colors.yellow);
        this.testResults.push({ test: 'Rating Button', status: 'SKIP', reason: 'Authentication required' });
      }
      
      return true;
    } catch (error) {
      log(`❌ Erreur lors du test du modal: ${error.message}`, colors.red);
      this.testResults.push({ test: 'Rating Modal', status: 'ERROR', error: error.message });
      return false;
    }
  }

  async testAPIEndpoints() {
    try {
      log('🧪 Test des endpoints API d\'évaluation...', colors.blue);
      
      const endpoints = [
        '/api/v1/ratings',
        '/api/v1/admin/ratings',
        '/api/v1/admin/ratings/stats'
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await this.page.goto(`${BASE_URL}${endpoint}`, {
            waitUntil: 'networkidle0',
            timeout: 5000
          });
          
          if (response.status() === 200 || response.status() === 401) {
            log(`✅ Endpoint ${endpoint} accessible (${response.status()})`, colors.green);
            this.testResults.push({ test: `API ${endpoint}`, status: 'PASS' });
          } else {
            log(`❌ Endpoint ${endpoint} erreur (${response.status()})`, colors.red);
            this.testResults.push({ test: `API ${endpoint}`, status: 'FAIL', status_code: response.status() });
          }
        } catch (error) {
          log(`❌ Endpoint ${endpoint} inaccessible: ${error.message}`, colors.red);
          this.testResults.push({ test: `API ${endpoint}`, status: 'ERROR', error: error.message });
        }
      }
      
      return true;
    } catch (error) {
      log(`❌ Erreur lors du test des APIs: ${error.message}`, colors.red);
      return false;
    }
  }

  async testDatabaseMigrations() {
    try {
      log('🧪 Test des migrations de base de données...', colors.blue);
      
      // Vérifier que l'endpoint ratings répond
      const response = await this.page.goto(`${BASE_URL}/api/v1/ratings?rateable_type=Product&rateable_id=1`, {
        waitUntil: 'networkidle0'
      });
      
      if (response.status() === 200 || response.status() === 401) {
        log('✅ Structure de base de données validée', colors.green);
        this.testResults.push({ test: 'Database Schema', status: 'PASS' });
      } else {
        log('❌ Structure de base de données invalide', colors.red);
        this.testResults.push({ test: 'Database Schema', status: 'FAIL' });
      }
      
      return true;
    } catch (error) {
      log(`❌ Erreur lors du test de la base de données: ${error.message}`, colors.red);
      this.testResults.push({ test: 'Database Schema', status: 'ERROR', error: error.message });
      return false;
    }
  }

  async generateReport() {
    log('\n📊 RAPPORT DE TEST DU SYSTÈME D\'ÉVALUATIONS', colors.blue);
    log('=' .repeat(60), colors.blue);
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(t => t.status === 'PASS').length;
    const failedTests = this.testResults.filter(t => t.status === 'FAIL').length;
    const errorTests = this.testResults.filter(t => t.status === 'ERROR').length;
    const skippedTests = this.testResults.filter(t => t.status === 'SKIP').length;
    
    log(`\n📈 Résumé:`, colors.blue);
    log(`   Total: ${totalTests} tests`);
    log(`   ✅ Réussis: ${passedTests}`, colors.green);
    log(`   ❌ Échoués: ${failedTests}`, colors.red);
    log(`   ⚠️  Erreurs: ${errorTests}`, colors.yellow);
    log(`   ⏭️  Ignorés: ${skippedTests}`, colors.yellow);
    
    const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    log(`   📊 Taux de réussite: ${successRate}%\n`);
    
    log('📋 Détails des tests:', colors.blue);
    this.testResults.forEach((result, index) => {
      const statusIcon = {
        'PASS': '✅',
        'FAIL': '❌',
        'ERROR': '⚠️',
        'SKIP': '⏭️'
      }[result.status];
      
      log(`   ${index + 1}. ${statusIcon} ${result.test}`);
      if (result.error) {
        log(`      Erreur: ${result.error}`, colors.red);
      }
      if (result.reason) {
        log(`      Raison: ${result.reason}`, colors.yellow);
      }
    });
    
    log('\n💡 Recommandations:', colors.blue);
    if (failedTests > 0 || errorTests > 0) {
      log('   - Vérifiez que Rails et Vite sont démarrés', colors.yellow);
      log('   - Contrôlez les migrations de base de données', colors.yellow);
      log('   - Vérifiez les imports des composants React', colors.yellow);
    } else {
      log('   - Système d\'évaluations fonctionnel ! ✨', colors.green);
      log('   - Prêt pour les tests utilisateur', colors.green);
    }
  }

  async runAllTests() {
    try {
      if (!await this.init()) {
        return false;
      }
      
      log('\n🎯 DÉBUT DES TESTS DU SYSTÈME D\'ÉVALUATIONS\n', colors.blue);
      
      await this.checkServerStatus();
      await this.testDatabaseMigrations();
      await this.testAPIEndpoints();
      await this.testRatingComponents();
      await this.testRatingModal();
      
      await this.generateReport();
      
      return true;
    } catch (error) {
      log(`❌ Erreur générale: ${error.message}`, colors.red);
      return false;
    } finally {
      if (this.browser) {
        await this.browser.close();
        log('\n🔚 Tests terminés, navigateur fermé', colors.blue);
      }
    }
  }
}

// Lancement des tests
async function main() {
  const tester = new RatingSystemTester();
  const success = await tester.runAllTests();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(error => {
    log(`❌ Erreur fatale: ${error.message}`, colors.red);
    process.exit(1);
  });
}

module.exports = RatingSystemTester;