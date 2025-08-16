/**
 * Tests d'authentification - Connexion, déconnexion, enregistrement
 * Fonctionnalité critique pour la sécurité
 */

const puppeteer = require('puppeteer');
const config = require('../config/test-config');
const TestHelpers = require('../utils/test-helpers');

class AuthenticationTests {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
    this.testId = TestHelpers.generateTestId();
  }

  async init() {
    this.browser = await puppeteer.launch(config.browser);
    this.page = await this.browser.newPage();
    
    // Écouter les erreurs console
    this.getConsoleErrors = TestHelpers.checkConsoleErrors(this.page);
    
    return true;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async testLoginPage() {
    const testName = 'Login Page Access';
    try {
      const performance = await TestHelpers.measurePerformance(this.page, async () => {
        await this.page.goto(`${config.environments.development.frontend}/auth`, {
          waitUntil: 'networkidle0',
          timeout: config.timeouts.navigation
        });
      });

      const screenshot = await TestHelpers.takeScreenshot(this.page, 'login_page', this.testId);
      
      // Vérifier les éléments de la page
      const emailField = await TestHelpers.waitForElement(this.page, 'input[type="email"], [data-testid="email"]');
      const passwordField = await TestHelpers.waitForElement(this.page, 'input[type="password"], [data-testid="password"]');
      const submitButton = await TestHelpers.waitForElement(this.page, 'button[type="submit"], [data-testid="login-button"]');

      this.testResults.push({
        test: testName,
        status: emailField && passwordField && submitButton ? 'PASS' : 'FAIL',
        duration: performance.duration,
        details: {
          emailField: emailField ? 'Found' : 'Missing',
          passwordField: passwordField ? 'Found' : 'Missing',
          submitButton: submitButton ? 'Found' : 'Missing',
          performance: performance.performanceOk ? 'Good' : 'Slow',
          screenshot
        }
      });

    } catch (error) {
      this.testResults.push({
        test: testName,
        status: 'ERROR',
        error: error.message,
        screenshot: await TestHelpers.takeScreenshot(this.page, 'login_error', this.testId)
      });
    }
  }

  async testValidLogin() {
    const testName = 'Valid User Login';
    try {
      await this.page.goto(`${config.environments.development.frontend}/auth`);
      
      // Remplir le formulaire
      await this.page.type('input[type="email"], [data-testid="email"]', config.testUsers.customer.email);
      await this.page.type('input[type="password"], [data-testid="password"]', config.testUsers.customer.password);
      
      const screenshot1 = await TestHelpers.takeScreenshot(this.page, 'before_login', this.testId);
      
      // Soumettre
      const performance = await TestHelpers.measurePerformance(this.page, async () => {
        await Promise.all([
          this.page.waitForNavigation({ waitUntil: 'networkidle0' }),
          this.page.click('button[type="submit"], [data-testid="login-button"]')
        ]);
      });

      const screenshot2 = await TestHelpers.takeScreenshot(this.page, 'after_login', this.testId);
      
      // Vérifier la redirection réussie
      const currentUrl = this.page.url();
      const isRedirected = !currentUrl.includes('/auth');
      
      // Vérifier la présence d'éléments d'utilisateur connecté
      const userElement = await TestHelpers.waitForElement(this.page, '[data-testid="user-menu"], .user-dropdown, .profile-menu');

      this.testResults.push({
        test: testName,
        status: isRedirected && userElement ? 'PASS' : 'FAIL',
        duration: performance.duration,
        details: {
          redirected: isRedirected,
          userElement: userElement ? 'Found' : 'Missing',
          finalUrl: currentUrl,
          performance: performance.performanceOk ? 'Good' : 'Slow',
          screenshots: [screenshot1, screenshot2]
        }
      });

    } catch (error) {
      this.testResults.push({
        test: testName,
        status: 'ERROR',
        error: error.message,
        screenshot: await TestHelpers.takeScreenshot(this.page, 'login_error', this.testId)
      });
    }
  }

  async testInvalidLogin() {
    const testName = 'Invalid Credentials';
    try {
      await this.page.goto(`${config.environments.development.frontend}/auth`);
      
      // Utiliser des identifiants incorrects
      await this.page.type('input[type="email"]', 'wrong@email.com');
      await this.page.type('input[type="password"]', 'wrongpassword');
      
      await this.page.click('button[type="submit"]');
      
      // Attendre un message d'erreur
      await this.page.waitForTimeout(2000);
      
      const errorMessage = await TestHelpers.waitForText(this.page, 'Invalid');
      const stayOnPage = this.page.url().includes('/auth');
      
      const screenshot = await TestHelpers.takeScreenshot(this.page, 'invalid_login', this.testId);

      this.testResults.push({
        test: testName,
        status: errorMessage && stayOnPage ? 'PASS' : 'FAIL',
        details: {
          errorMessage: errorMessage ? 'Displayed' : 'Missing',
          stayOnPage: stayOnPage ? 'Yes' : 'No',
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

  async testLogout() {
    const testName = 'User Logout';
    try {
      // D'abord se connecter
      await TestHelpers.login(this.page, 'customer');
      
      // Chercher le bouton de déconnexion
      const logoutButton = await this.page.$('[data-testid="logout"], button:contains("Déconnexion"), a:contains("Logout")');
      
      if (logoutButton) {
        await logoutButton.click();
        await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
        
        // Vérifier que l'utilisateur est déconnecté
        const isLoggedOut = this.page.url().includes('/auth') || 
                           !(await TestHelpers.waitForElement(this.page, '[data-testid="user-menu"]'));
        
        this.testResults.push({
          test: testName,
          status: isLoggedOut ? 'PASS' : 'FAIL',
          details: {
            logoutButtonFound: true,
            isLoggedOut,
            finalUrl: this.page.url()
          }
        });
      } else {
        this.testResults.push({
          test: testName,
          status: 'FAIL',
          details: { logoutButtonFound: false }
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

  async testAuthAPI() {
    const testName = 'Authentication API';
    try {
      const endpoints = [
        { path: '/api/v1/auth/login', method: 'POST', expectedStatus: [405, 422] }, // Method not allowed or unprocessable sans params
        { path: '/api/v1/auth/register', method: 'POST', expectedStatus: [405, 422] },
        { path: '/api/v1/auth/me', method: 'GET', expectedStatus: [401] } // Unauthorized sans token
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
      
      await this.testLoginPage();
      await this.testValidLogin();
      await this.testInvalidLogin();
      await this.testLogout();
      await this.testAuthAPI();
      
      return {
        feature: 'Authentication',
        testId: this.testId,
        timestamp: new Date().toISOString(),
        results: this.testResults,
        summary: {
          total: this.testResults.length,
          passed: this.testResults.filter(t => t.status === 'PASS').length,
          failed: this.testResults.filter(t => t.status === 'FAIL').length,
          errors: this.testResults.filter(t => t.status === 'ERROR').length
        },
        consoleErrors: this.getConsoleErrors()
      };
      
    } finally {
      await this.cleanup();
    }
  }
}

module.exports = AuthenticationTests;

// Exécution directe si appelé en tant que script
if (require.main === module) {
  const test = new AuthenticationTests();
  test.runAllTests().then(result => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.summary.failed === 0 && result.summary.errors === 0 ? 0 : 1);
  }).catch(error => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
}