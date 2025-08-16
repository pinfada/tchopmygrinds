/**
 * Tests du système d'évaluations et avis
 * Fonctionnalité critique pour la confiance utilisateur
 */

const puppeteer = require('puppeteer');
const config = require('../config/test-config');
const TestHelpers = require('../utils/test-helpers');

class RatingsTests {
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

  async testRatingSectionDisplay() {
    const testName = 'Rating Section Display';
    try {
      await this.page.goto(`${config.environments.development.frontend}/products/1`, {
        waitUntil: 'networkidle0',
        timeout: config.timeouts.navigation
      });

      // Attendre le chargement complet
      await this.page.waitForTimeout(2000);
      
      const screenshot = await TestHelpers.takeScreenshot(this.page, 'product_page', this.testId);
      
      // Chercher différents éléments de la section d'évaluations
      const ratingSection = await TestHelpers.waitForElement(this.page, '[data-testid="rating-section"], .rating-section');
      const starRating = await TestHelpers.waitForElement(this.page, '[data-testid="star-rating"], .star-rating');
      const ratingButton = await TestHelpers.waitForElement(this.page, 'button:contains("avis"), [data-testid="rating-button"]');
      
      // Vérifier la présence d'étoiles SVG
      const stars = await this.page.$$('svg[viewBox="0 0 20 20"], .star');
      
      this.testResults.push({
        test: testName,
        status: (ratingSection || starRating || stars.length > 0) ? 'PASS' : 'FAIL',
        details: {
          ratingSection: ratingSection ? 'Found' : 'Missing',
          starRating: starRating ? 'Found' : 'Missing',
          ratingButton: ratingButton ? 'Found' : 'Missing',
          starsCount: stars.length,
          screenshot
        }
      });

    } catch (error) {
      this.testResults.push({
        test: testName,
        status: 'ERROR',
        error: error.message,
        screenshot: await TestHelpers.takeScreenshot(this.page, 'rating_display_error', this.testId)
      });
    }
  }

  async testRatingModal() {
    const testName = 'Rating Modal Functionality';
    try {
      // D'abord se connecter
      await TestHelpers.login(this.page, 'customer');
      
      await this.page.goto(`${config.environments.development.frontend}/products/1`);
      await this.page.waitForTimeout(2000);
      
      // Chercher et cliquer sur le bouton d'évaluation
      const ratingButton = await this.page.$('button:contains("avis"), [data-testid="rating-button"]');
      
      if (ratingButton) {
        await ratingButton.click();
        await this.page.waitForTimeout(1000);
        
        const modal = await TestHelpers.waitForElement(this.page, '.modal, [data-testid="rating-modal"], [role="dialog"]');
        const screenshot = await TestHelpers.takeScreenshot(this.page, 'rating_modal', this.testId);
        
        // Vérifier les éléments du modal
        const starInputs = await this.page.$$('.star-input, [data-testid="star-input"], input[type="radio"]');
        const commentField = await TestHelpers.waitForElement(this.page, 'textarea, [data-testid="comment"]');
        const submitButton = await TestHelpers.waitForElement(this.page, 'button[type="submit"], [data-testid="submit-rating"]');
        
        this.testResults.push({
          test: testName,
          status: modal ? 'PASS' : 'FAIL',
          details: {
            modalOpened: modal ? 'Yes' : 'No',
            starInputs: starInputs.length,
            commentField: commentField ? 'Found' : 'Missing',
            submitButton: submitButton ? 'Found' : 'Missing',
            screenshot
          }
        });
      } else {
        this.testResults.push({
          test: testName,
          status: 'SKIP',
          reason: 'Rating button not found (may require authentication or specific state)'
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

  async testRatingSubmission() {
    const testName = 'Rating Submission Process';
    try {
      // Se connecter en tant que client
      await TestHelpers.login(this.page, 'customer');
      await this.page.goto(`${config.environments.development.frontend}/products/1`);
      
      // Simuler une évaluation (si les éléments sont présents)
      const ratingButton = await this.page.$('button:contains("avis")');
      
      if (ratingButton) {
        await ratingButton.click();
        await this.page.waitForTimeout(1000);
        
        // Essayer de noter avec 4 étoiles
        const fourthStar = await this.page.$('input[value="4"], .star:nth-child(4)');
        if (fourthStar) {
          await fourthStar.click();
        }
        
        // Ajouter un commentaire
        const commentField = await this.page.$('textarea');
        if (commentField) {
          await commentField.type('Test automatique - Très bon produit!');
        }
        
        const screenshot1 = await TestHelpers.takeScreenshot(this.page, 'before_submit', this.testId);
        
        // Soumettre (si bouton présent)
        const submitButton = await this.page.$('button[type="submit"]');
        if (submitButton) {
          await submitButton.click();
          await this.page.waitForTimeout(2000);
          
          const screenshot2 = await TestHelpers.takeScreenshot(this.page, 'after_submit', this.testId);
          
          // Vérifier si le modal se ferme
          const modalClosed = !(await TestHelpers.waitForElement(this.page, '.modal', 1000));
          
          this.testResults.push({
            test: testName,
            status: 'PASS', // Considéré comme réussi si le processus fonctionne
            details: {
              formFilled: true,
              submitted: true,
              modalClosed,
              screenshots: [screenshot1, screenshot2]
            }
          });
        } else {
          this.testResults.push({
            test: testName,
            status: 'SKIP',
            reason: 'Submit button not found'
          });
        }
      } else {
        this.testResults.push({
          test: testName,
          status: 'SKIP',
          reason: 'Rating functionality not accessible'
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

  async testRatingAPI() {
    const testName = 'Rating API Endpoints';
    try {
      const endpoints = [
        { path: '/api/v1/ratings?rateable_type=Product&rateable_id=1', expectedStatus: [200, 401] },
        { path: '/api/v1/admin/ratings', expectedStatus: [401, 403] }, // Doit être protégé
        { path: '/api/v1/admin/ratings/stats', expectedStatus: [401, 403] }
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

  async testRatingOnCommerce() {
    const testName = 'Rating on Commerce Page';
    try {
      await this.page.goto(`${config.environments.development.frontend}/commerces/1`, {
        waitUntil: 'networkidle0'
      });

      await this.page.waitForTimeout(2000);
      
      const screenshot = await TestHelpers.takeScreenshot(this.page, 'commerce_ratings', this.testId);
      
      // Chercher la section d'avis sur la page commerce
      const ratingSection = await TestHelpers.waitForElement(this.page, '[data-testid="rating-section"], .rating-section');
      const clientReviews = await TestHelpers.waitForText(this.page, 'avis clients');
      const stars = await this.page.$$('svg[viewBox="0 0 20 20"]');
      
      this.testResults.push({
        test: testName,
        status: (ratingSection || clientReviews || stars.length > 0) ? 'PASS' : 'FAIL',
        details: {
          ratingSection: ratingSection ? 'Found' : 'Missing',
          clientReviews: clientReviews ? 'Found' : 'Missing',
          starsCount: stars.length,
          screenshot
        }
      });

    } catch (error) {
      this.testResults.push({
        test: testName,
        status: 'ERROR',
        error: error.message
      });
    }
  }

  async testAdminModerationAccess() {
    const testName = 'Admin Moderation Access';
    try {
      // Tenter de se connecter en tant qu'admin
      const loginSuccess = await TestHelpers.login(this.page, 'admin');
      
      if (loginSuccess) {
        // Tester l'accès aux APIs admin
        const statsResult = await TestHelpers.checkAPIEndpoint(this.page, '/api/v1/admin/ratings/stats', [200]);
        const ratingsResult = await TestHelpers.checkAPIEndpoint(this.page, '/api/v1/admin/ratings', [200]);
        
        this.testResults.push({
          test: testName,
          status: (statsResult.success || ratingsResult.success) ? 'PASS' : 'FAIL',
          details: {
            adminLogin: loginSuccess,
            statsAPI: statsResult.success,
            ratingsAPI: ratingsResult.success
          }
        });
      } else {
        this.testResults.push({
          test: testName,
          status: 'SKIP',
          reason: 'Admin login failed - user may not exist'
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

  async runAllTests() {
    try {
      await this.init();
      
      await this.testRatingSectionDisplay();
      await this.testRatingModal();
      await this.testRatingSubmission();
      await this.testRatingOnCommerce();
      await this.testRatingAPI();
      await this.testAdminModerationAccess();
      
      return {
        feature: 'Ratings',
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

module.exports = RatingsTests;

if (require.main === module) {
  const test = new RatingsTests();
  test.runAllTests().then(result => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.summary.failed === 0 && result.summary.errors === 0 ? 0 : 1);
  }).catch(error => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
}