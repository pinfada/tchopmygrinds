/**
 * Utilitaires partagés pour tous les tests
 */

const fs = require('fs').promises;
const path = require('path');
const config = require('../config/test-config');

class TestHelpers {
  static async takeScreenshot(page, name, testName) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${testName}_${name}_${timestamp}.png`;
      const filepath = path.join(config.reports.screenshotDir, filename);
      
      await fs.mkdir(config.reports.screenshotDir, { recursive: true });
      await page.screenshot({ 
        path: filepath, 
        fullPage: true,
        type: 'png'
      });
      
      return filepath;
    } catch (error) {
      console.error('Erreur lors de la capture d\'écran:', error);
      return null;
    }
  }

  static async waitForElement(page, selector, timeout = config.timeouts.element) {
    try {
      await page.waitForSelector(selector, { timeout, visible: true });
      return true;
    } catch (error) {
      return false;
    }
  }

  static async waitForText(page, text, timeout = config.timeouts.element) {
    try {
      await page.waitForFunction(
        (text) => document.body.textContent.includes(text),
        { timeout },
        text
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  static async checkAPIEndpoint(page, endpoint, expectedStatus = [200]) {
    try {
      const url = `${config.environments.development.api}${endpoint}`;
      const response = await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: config.timeouts.api 
      });
      
      const status = response.status();
      const isExpected = expectedStatus.includes(status);
      
      return {
        success: isExpected,
        status,
        url,
        expectedStatus
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        url: `${config.environments.development.api}${endpoint}`
      };
    }
  }

  static async login(page, userType = 'customer') {
    try {
      const user = config.testUsers[userType];
      if (!user) throw new Error(`Type d'utilisateur inconnu: ${userType}`);

      await page.goto(`${config.environments.development.frontend}/auth`);
      await page.type('[data-testid="email"], input[type="email"]', user.email);
      await page.type('[data-testid="password"], input[type="password"]', user.password);
      await page.click('[data-testid="login-button"], button[type="submit"]');
      
      // Attendre la redirection
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      
      return true;
    } catch (error) {
      console.error(`Erreur de connexion pour ${userType}:`, error);
      return false;
    }
  }

  static async measurePerformance(page, action) {
    const startTime = Date.now();
    
    try {
      const result = await action();
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        duration,
        result,
        performanceOk: duration < config.performance.maxPageLoadTime
      };
    } catch (error) {
      return {
        success: false,
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }

  static async checkConsoleErrors(page) {
    const errors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push({
          type: 'console_error',
          message: msg.text(),
          timestamp: new Date().toISOString()
        });
      }
    });

    page.on('pageerror', error => {
      errors.push({
        type: 'page_error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });

    return () => errors;
  }

  static generateTestId() {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}min`;
  }

  static async cleanupOldReports(retentionDays = config.reports.retentionDays) {
    try {
      const reportsDir = config.reports.outputDir;
      const screenshotsDir = config.reports.screenshotDir;
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      
      for (const dir of [reportsDir, screenshotsDir]) {
        try {
          const files = await fs.readdir(dir);
          for (const file of files) {
            const filePath = path.join(dir, file);
            const stats = await fs.stat(filePath);
            
            if (stats.mtime < cutoffDate) {
              await fs.unlink(filePath);
              console.log(`Supprimé: ${filePath}`);
            }
          }
        } catch (error) {
          // Dossier n'existe pas encore, ignorer
        }
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
    }
  }

  static async verifyEnvironment() {
    const results = {
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      checks: []
    };

    // Vérifier la version Node.js
    const nodeVersion = parseInt(process.version.slice(1));
    results.checks.push({
      name: 'Node.js Version',
      status: nodeVersion >= 16 ? 'PASS' : 'FAIL',
      details: `Version ${process.version} (minimum: v16)`
    });

    // Vérifier les dépendances critiques
    const deps = ['puppeteer'];
    for (const dep of deps) {
      try {
        require(dep);
        results.checks.push({
          name: `Dépendance ${dep}`,
          status: 'PASS',
          details: 'Module disponible'
        });
      } catch (error) {
        results.checks.push({
          name: `Dépendance ${dep}`,
          status: 'FAIL',
          details: `Module manquant: ${error.message}`
        });
      }
    }

    return results;
  }
}

module.exports = TestHelpers;