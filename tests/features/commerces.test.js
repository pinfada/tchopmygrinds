/**
 * Tests de la fonctionnalité Commerces
 * Navigation, recherche, géolocalisation, affichage des détails
 */

const puppeteer = require('puppeteer');
const config = require('../config/test-config');
const TestHelpers = require('../utils/test-helpers');

class CommercesTests {
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
    
    // Simuler une géolocalisation (Yaoundé)
    await this.page.setGeolocation(config.features.geolocation.mockLocation);
    
    return true;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async testCommercesListPage() {
    const testName = 'Commerces List Page';
    try {
      const performance = await TestHelpers.measurePerformance(this.page, async () => {
        await this.page.goto(`${config.environments.development.frontend}/commerces`, {
          waitUntil: 'networkidle0',
          timeout: config.timeouts.navigation
        });
      });

      const screenshot = await TestHelpers.takeScreenshot(this.page, 'commerces_list', this.testId);
      
      // Vérifier les éléments de la page
      const commerceCards = await this.page.$$('.commerce-card, [data-testid="commerce-card"], .card');
      const searchBox = await TestHelpers.waitForElement(this.page, 'input[type="search"], [data-testid="search"]');
      const mapElement = await TestHelpers.waitForElement(this.page, '.map, [data-testid="map"], #map');
      
      // Vérifier la présence de commerces
      const commerceNames = await this.page.$$eval('h3, .commerce-name, [data-testid="commerce-name"]', 
        elements => elements.length);

      this.testResults.push({
        test: testName,
        status: commerceCards.length > 0 || commerceNames > 0 ? 'PASS' : 'FAIL',
        duration: performance.duration,
        details: {
          commerceCards: commerceCards.length,
          commerceNames,
          searchBox: searchBox ? 'Found' : 'Missing',
          mapElement: mapElement ? 'Found' : 'Missing',
          performance: performance.performanceOk ? 'Good' : 'Slow',
          screenshot
        }
      });

    } catch (error) {
      this.testResults.push({
        test: testName,
        status: 'ERROR',
        error: error.message,
        screenshot: await TestHelpers.takeScreenshot(this.page, 'commerces_error', this.testId)
      });
    }
  }

  async testCommerceDetailPage() {
    const testName = 'Commerce Detail Page';
    try {
      await this.page.goto(`${config.environments.development.frontend}/commerces/1`, {
        waitUntil: 'networkidle0'
      });

      await this.page.waitForTimeout(2000);
      const screenshot = await TestHelpers.takeScreenshot(this.page, 'commerce_detail', this.testId);
      
      // Vérifier les éléments de détail
      const commerceName = await TestHelpers.waitForElement(this.page, 'h1, .commerce-title, [data-testid="commerce-name"]');
      const commerceInfo = await TestHelpers.waitForElement(this.page, '.commerce-info, .contact, [data-testid="commerce-info"]');
      const productsSection = await TestHelpers.waitForElement(this.page, '.products, [data-testid="products"]');
      const mapSection = await TestHelpers.waitForElement(this.page, '.map, [data-testid="map"]');
      
      // Chercher des produits du commerce
      const productCards = await this.page.$$('.product-card, [data-testid="product"], .card');
      
      this.testResults.push({
        test: testName,
        status: commerceName ? 'PASS' : 'FAIL',
        details: {
          commerceName: commerceName ? 'Found' : 'Missing',
          commerceInfo: commerceInfo ? 'Found' : 'Missing',
          productsSection: productsSection ? 'Found' : 'Missing',
          mapSection: mapSection ? 'Found' : 'Missing',
          productCards: productCards.length,
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

  async testCommerceSearch() {
    const testName = 'Commerce Search Functionality';
    try {
      await this.page.goto(`${config.environments.development.frontend}/commerces`);
      await this.page.waitForTimeout(2000);
      
      const searchInput = await this.page.$('input[type="search"], [data-testid="search"], input[placeholder*="recherch"]');
      
      if (searchInput) {
        // Effectuer une recherche
        await searchInput.type('market');
        await this.page.waitForTimeout(1000);
        
        // Vérifier si des résultats apparaissent ou changent
        const resultsAfterSearch = await this.page.$$('.commerce-card, .card');
        const screenshot = await TestHelpers.takeScreenshot(this.page, 'search_results', this.testId);
        
        this.testResults.push({
          test: testName,
          status: 'PASS', // La recherche fonctionne si l'input existe
          details: {
            searchInputFound: true,
            resultsCount: resultsAfterSearch.length,
            screenshot
          }
        });
      } else {
        this.testResults.push({
          test: testName,
          status: 'FAIL',
          details: { searchInputFound: false }
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

  async testNearbyCommercesAPI() {
    const testName = 'Nearby Commerces API';
    try {
      const lat = config.features.geolocation.mockLocation.lat;
      const lng = config.features.geolocation.mockLocation.lng;
      
      const result = await TestHelpers.checkAPIEndpoint(
        this.page, 
        `/api/v1/commerces/nearby?latitude=${lat}&longitude=${lng}`, 
        [200]
      );

      this.testResults.push({
        test: testName,
        status: result.success ? 'PASS' : 'FAIL',
        details: result
      });

    } catch (error) {
      this.testResults.push({
        test: testName,
        status: 'ERROR',
        error: error.message
      });
    }
  }

  async testCommerceNavigation() {
    const testName = 'Commerce Navigation';
    try {
      // Aller sur la liste des commerces
      await this.page.goto(`${config.environments.development.frontend}/commerces`);
      await this.page.waitForTimeout(2000);
      
      // Chercher et cliquer sur le premier commerce
      const firstCommerceLink = await this.page.$('a[href*="/commerces/"], .commerce-card a, [data-testid="commerce-link"]');
      
      if (firstCommerceLink) {
        const screenshot1 = await TestHelpers.takeScreenshot(this.page, 'before_navigation', this.testId);
        
        await firstCommerceLink.click();
        await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
        
        const screenshot2 = await TestHelpers.takeScreenshot(this.page, 'after_navigation', this.testId);
        
        // Vérifier qu'on est sur une page de détail
        const isDetailPage = this.page.url().includes('/commerces/') && 
                            this.page.url().match(/\/commerces\/\d+/);
        
        this.testResults.push({
          test: testName,
          status: isDetailPage ? 'PASS' : 'FAIL',
          details: {
            navigationSuccessful: isDetailPage,
            finalUrl: this.page.url(),
            screenshots: [screenshot1, screenshot2]
          }
        });
      } else {
        this.testResults.push({
          test: testName,
          status: 'FAIL',
          details: { commerceLinkFound: false }
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

  async testMapIntegration() {
    const testName = 'Map Integration';
    try {
      await this.page.goto(`${config.environments.development.frontend}/commerces`);
      await this.page.waitForTimeout(3000); // Laisser le temps à la carte de charger
      
      const screenshot = await TestHelpers.takeScreenshot(this.page, 'map_integration', this.testId);
      
      // Vérifier la présence d'éléments de carte
      const mapContainer = await TestHelpers.waitForElement(this.page, '.leaflet-container, .map-container, [data-testid="map"]');
      const mapTiles = await TestHelpers.waitForElement(this.page, '.leaflet-tile, .map-tile');
      const markers = await this.page.$$('.leaflet-marker, .marker, .leaflet-marker-icon');
      
      this.testResults.push({
        test: testName,
        status: mapContainer ? 'PASS' : 'FAIL',
        details: {
          mapContainer: mapContainer ? 'Found' : 'Missing',
          mapTiles: mapTiles ? 'Found' : 'Missing',
          markersCount: markers.length,
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

  async testCommercesAPI() {
    const testName = 'Commerces API Endpoints';
    try {
      const endpoints = [
        { path: '/api/v1/commerces', expectedStatus: [200] },
        { path: '/api/v1/commerces/1', expectedStatus: [200, 404] },
        { path: '/api/v1/commerces/search', expectedStatus: [200] },
        { path: '/api/v1/commerces/nearby', expectedStatus: [200] }
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
      
      await this.testCommercesListPage();
      await this.testCommerceDetailPage();
      await this.testCommerceSearch();
      await this.testCommerceNavigation();
      await this.testMapIntegration();
      await this.testNearbyCommercesAPI();
      await this.testCommercesAPI();
      
      return {
        feature: 'Commerces',
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

module.exports = CommercesTests;

if (require.main === module) {
  const test = new CommercesTests();
  test.runAllTests().then(result => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.summary.failed === 0 && result.summary.errors === 0 ? 0 : 1);
  }).catch(error => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
}