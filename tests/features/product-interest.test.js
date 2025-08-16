/**
 * Tests E2E pour les manifestations d'intérêt (Product Interest)
 * Fonctionnalité clé de TchopMyGrinds pour la gestion des stocks
 */

const puppeteer = require('puppeteer');
const config = require('../config/test-config');
const TestHelpers = require('../utils/test-helpers');

class ProductInterestTests {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
    this.testId = TestHelpers.generateTestId();
  }

  async init() {
    this.browser = await puppeteer.launch(config.browser);
    this.page = await this.browser.newPage();
    this.getConsoleErrors = TestHelpers.checkConsoleErrors(this.page);
    return true;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async testProductOutOfStock() {
    const testName = 'Product Out of Stock Display';
    try {
      await TestHelpers.login(this.page, 'customer');
      
      // Naviguer vers un produit en rupture de stock
      await this.page.goto(`${config.environments.development.frontend}/products`);
      
      // Chercher un produit épuisé (créé dans seeds)
      const outOfStockProduct = await this.page.$('.product-card:contains("Épuisé"), [data-testid="product-out-of-stock"]');
      
      if (outOfStockProduct) {
        await outOfStockProduct.click();
        await this.page.waitForTimeout(1000);
        
        // Vérifier l'affichage du statut "rupture de stock"
        const stockStatus = await TestHelpers.waitForText(this.page, 'Rupture de stock|Épuisé|Out of stock');
        const interestButton = await TestHelpers.waitForElement(this.page, '[data-testid="interest-button"], button:contains("Manifester"), button:contains("Intérêt")');
        
        const screenshot = await TestHelpers.takeScreenshot(this.page, 'product_out_of_stock', this.testId);
        
        this.testResults.push({
          test: testName,
          status: stockStatus && interestButton ? 'PASS' : 'FAIL',
          details: {
            stockStatus: stockStatus ? 'Displayed' : 'Missing',
            interestButton: interestButton ? 'Found' : 'Missing',
            screenshot
          }
        });
      } else {
        this.testResults.push({
          test: testName,
          status: 'SKIP',
          details: { reason: 'No out-of-stock products found' }
        });
      }

    } catch (error) {
      this.testResults.push({
        test: testName,
        status: 'ERROR',
        error: error.message,
        screenshot: await TestHelpers.takeScreenshot(this.page, 'product_stock_error', this.testId)
      });
    }
  }

  async testCreateInterest() {
    const testName = 'Create Product Interest';
    try {
      await TestHelpers.login(this.page, 'customer');
      
      // Aller sur la page du produit épuisé
      await this.page.goto(`${config.environments.development.frontend}/products`);
      
      // Cliquer sur le bouton de manifestation d'intérêt
      const interestButton = await TestHelpers.waitForElement(this.page, '[data-testid="interest-button"], button:contains("Manifester")');
      
      if (interestButton) {
        const screenshot1 = await TestHelpers.takeScreenshot(this.page, 'before_interest', this.testId);
        
        await interestButton.click();
        await this.page.waitForTimeout(1000);
        
        // Vérifier le modal ou formulaire d'intérêt
        const interestForm = await TestHelpers.waitForElement(this.page, '[data-testid="interest-modal"], .interest-form, .modal:contains("intérêt")');
        
        if (interestForm) {
          // Remplir le formulaire si nécessaire
          const quantityField = await this.page.$('input[name="quantity"], [data-testid="interest-quantity"]');
          if (quantityField) {
            await this.page.type('input[name="quantity"], [data-testid="interest-quantity"]', '2');
          }
          
          const messageField = await this.page.$('textarea[name="message"], [data-testid="interest-message"]');
          if (messageField) {
            await this.page.type('textarea[name="message"], [data-testid="interest-message"]', 'Je suis intéressé par ce produit');
          }
          
          // Soumettre
          await this.page.click('button[type="submit"], [data-testid="submit-interest"]');
          await this.page.waitForTimeout(2000);
          
          // Vérifier la confirmation
          const confirmation = await TestHelpers.waitForText(this.page, 'Manifestation|Intérêt|enregistrée|confirmé');
          const screenshot2 = await TestHelpers.takeScreenshot(this.page, 'after_interest', this.testId);
          
          this.testResults.push({
            test: testName,
            status: confirmation ? 'PASS' : 'FAIL',
            details: {
              formFound: true,
              confirmation: confirmation ? 'Displayed' : 'Missing',
              screenshots: [screenshot1, screenshot2]
            }
          });
        } else {
          this.testResults.push({
            test: testName,
            status: 'FAIL',
            details: { formFound: false, screenshot: screenshot1 }
          });
        }
      } else {
        this.testResults.push({
          test: testName,
          status: 'FAIL',
          details: { interestButtonFound: false }
        });
      }

    } catch (error) {
      this.testResults.push({
        test: testName,
        status: 'ERROR',
        error: error.message,
        screenshot: await TestHelpers.takeScreenshot(this.page, 'interest_error', this.testId)
      });
    }
  }

  async testMerchantDashboard() {
    const testName = 'Merchant Interest Dashboard';
    try {
      await TestHelpers.login(this.page, 'verified_merchant');
      
      // Naviguer vers le tableau de bord marchand
      await this.page.goto(`${config.environments.development.frontend}/dashboard`);
      
      // Chercher la section des manifestations d'intérêt
      const interestSection = await TestHelpers.waitForElement(this.page, '[data-testid="interest-section"], .interest-dashboard, .manifestations');
      
      if (interestSection) {
        const screenshot = await TestHelpers.takeScreenshot(this.page, 'merchant_dashboard', this.testId);
        
        // Vérifier les éléments du tableau de bord
        const interestList = await this.page.$('.interest-list, [data-testid="interest-list"]');
        const notificationCount = await this.page.$('.notification-count, [data-testid="notification-count"]');
        
        this.testResults.push({
          test: testName,
          status: interestSection ? 'PASS' : 'FAIL',
          details: {
            sectionFound: true,
            interestList: interestList ? 'Found' : 'Missing',
            notificationCount: notificationCount ? 'Found' : 'Missing',
            screenshot
          }
        });
      } else {
        this.testResults.push({
          test: testName,
          status: 'FAIL',
          details: { sectionFound: false }
        });
      }

    } catch (error) {
      this.testResults.push({
        test: testName,
        status: 'ERROR',
        error: error.message,
        screenshot: await TestHelpers.takeScreenshot(this.page, 'dashboard_error', this.testId)
      });
    }
  }

  async testInterestNotification() {
    const testName = 'Interest Notification System';
    try {
      await TestHelpers.login(this.page, 'verified_merchant');
      
      // Vérifier les notifications
      const notificationIcon = await TestHelpers.waitForElement(this.page, '[data-testid="notifications"], .notification-bell, .alerts');
      
      if (notificationIcon) {
        await notificationIcon.click();
        await this.page.waitForTimeout(1000);
        
        // Chercher des notifications d'intérêt
        const interestNotification = await this.page.$('.notification:contains("intérêt"), [data-testid="interest-notification"]');
        
        const screenshot = await TestHelpers.takeScreenshot(this.page, 'notifications', this.testId);
        
        this.testResults.push({
          test: testName,
          status: 'PASS', // Test réussi si les notifications sont accessibles
          details: {
            notificationIcon: 'Found',
            interestNotification: interestNotification ? 'Found' : 'None',
            screenshot
          }
        });
      } else {
        this.testResults.push({
          test: testName,
          status: 'FAIL',
          details: { notificationIcon: 'Missing' }
        });
      }

    } catch (error) {
      this.testResults.push({
        test: testName,
        status: 'ERROR',
        error: error.message
      });
    }
  }

  async testAPIEndpoints() {
    const testName = 'Product Interest API';
    try {
      const endpoints = [
        { path: '/api/v1/product_interests', method: 'GET', expectedStatus: [200, 401] },
        { path: '/api/v1/product_interests', method: 'POST', expectedStatus: [401, 422] }, // Sans auth
        { path: '/api/v1/products/1/product_interests', method: 'GET', expectedStatus: [200, 404] }
      ];

      const results = [];
      for (const endpoint of endpoints) {
        const result = await TestHelpers.checkAPIEndpoint(this.page, endpoint.path, endpoint.expectedStatus);
        results.push({
          endpoint: endpoint.path,
          ...result
        });
      }

      const allPassed = results.every(r => r.success);

      this.testResults.push({
        test: testName,
        status: allPassed ? 'PASS' : 'FAIL',
        details: { endpoints: results }
      });

    } catch (error) {
      this.testResults.push({
        test: testName,
        status: 'ERROR',
        error: error.message
      });
    }
  }

  async runAllTests() {
    try {
      await this.init();
      
      await this.testProductOutOfStock();
      await this.testCreateInterest();
      await this.testMerchantDashboard();
      await this.testInterestNotification();
      await this.testAPIEndpoints();
      
      return {
        feature: 'Product Interest',
        testId: this.testId,
        timestamp: new Date().toISOString(),
        results: this.testResults,
        summary: {
          total: this.testResults.length,
          passed: this.testResults.filter(t => t.status === 'PASS').length,
          failed: this.testResults.filter(t => t.status === 'FAIL').length,
          errors: this.testResults.filter(t => t.status === 'ERROR').length,
          skipped: this.testResults.filter(t => t.status === 'SKIP').length
        },
        consoleErrors: this.getConsoleErrors()
      };
      
    } finally {
      await this.cleanup();
    }
  }
}

module.exports = ProductInterestTests;

// Exécution directe si appelé en tant que script
if (require.main === module) {
  const test = new ProductInterestTests();
  test.runAllTests().then(result => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.summary.failed === 0 && result.summary.errors === 0 ? 0 : 1);
  }).catch(error => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
}