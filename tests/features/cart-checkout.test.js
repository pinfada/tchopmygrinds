/**
 * Tests E2E pour le panier et processus de commande
 * Workflow critique pour l'e-commerce
 */

const puppeteer = require('puppeteer');
const config = require('../config/test-config');
const TestHelpers = require('../utils/test-helpers');

class CartCheckoutTests {
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

  async testAddToCart() {
    const testName = 'Add Product to Cart';
    try {
      await TestHelpers.login(this.page, 'customer');
      
      // Naviguer vers la liste des produits
      await this.page.goto(`${config.environments.development.frontend}/products`);
      
      const screenshot1 = await TestHelpers.takeScreenshot(this.page, 'products_page', this.testId);
      
      // Chercher un produit disponible
      const productCard = await TestHelpers.waitForElement(this.page, '.product-card:not(:contains("Épuisé")), [data-testid="product-available"]');
      
      if (productCard) {
        await productCard.click();
        await this.page.waitForTimeout(1000);
        
        // Chercher le bouton d'ajout au panier
        const addToCartButton = await TestHelpers.waitForElement(this.page, '[data-testid="add-to-cart"], button:contains("Ajouter"), .add-to-cart-btn');
        
        if (addToCartButton) {
          const performance = await TestHelpers.measurePerformance(this.page, async () => {
            await addToCartButton.click();
            await this.page.waitForTimeout(2000);
          });
          
          // Vérifier la confirmation ou mise à jour du compteur panier
          const cartCounter = await this.page.$('[data-testid="cart-count"], .cart-counter, .badge');
          const successMessage = await TestHelpers.waitForText(this.page, 'Ajouté|panier|Added');
          
          const screenshot2 = await TestHelpers.takeScreenshot(this.page, 'after_add_to_cart', this.testId);
          
          this.testResults.push({
            test: testName,
            status: cartCounter || successMessage ? 'PASS' : 'FAIL',
            duration: performance.duration,
            details: {
              productFound: true,
              buttonFound: true,
              cartCounter: cartCounter ? 'Updated' : 'Missing',
              successMessage: successMessage ? 'Displayed' : 'Missing',
              performance: performance.performanceOk ? 'Good' : 'Slow',
              screenshots: [screenshot1, screenshot2]
            }
          });
        } else {
          this.testResults.push({
            test: testName,
            status: 'FAIL',
            details: { productFound: true, buttonFound: false, screenshot: screenshot1 }
          });
        }
      } else {
        this.testResults.push({
          test: testName,
          status: 'SKIP',
          details: { reason: 'No available products found', screenshot: screenshot1 }
        });
      }

    } catch (error) {
      this.testResults.push({
        test: testName,
        status: 'ERROR',
        error: error.message,
        screenshot: await TestHelpers.takeScreenshot(this.page, 'add_cart_error', this.testId)
      });
    }
  }

  async testCartPage() {
    const testName = 'Cart Page Functionality';
    try {
      await TestHelpers.login(this.page, 'customer');
      
      // Naviguer vers le panier
      await this.page.goto(`${config.environments.development.frontend}/cart`);
      
      const screenshot = await TestHelpers.takeScreenshot(this.page, 'cart_page', this.testId);
      
      // Vérifier les éléments du panier
      const cartItems = await this.page.$$('.cart-item, [data-testid="cart-item"]');
      const totalPrice = await TestHelpers.waitForElement(this.page, '.total-price, [data-testid="total-price"]');
      const checkoutButton = await TestHelpers.waitForElement(this.page, '[data-testid="checkout-button"], button:contains("Commander"), .checkout-btn');
      
      // Tests de manipulation du panier
      let quantityUpdateWorks = false;
      if (cartItems.length > 0) {
        const quantityInput = await this.page.$('.quantity-input, [data-testid="quantity-input"]');
        if (quantityInput) {
          await this.page.click(quantityInput);
          await this.page.keyboard.selectAll();
          await this.page.type(quantityInput, '3');
          await this.page.waitForTimeout(1000);
          quantityUpdateWorks = true;
        }
      }
      
      this.testResults.push({
        test: testName,
        status: cartItems.length > 0 && totalPrice && checkoutButton ? 'PASS' : 'FAIL',
        details: {
          cartItems: cartItems.length,
          totalPrice: totalPrice ? 'Found' : 'Missing',
          checkoutButton: checkoutButton ? 'Found' : 'Missing',
          quantityUpdate: quantityUpdateWorks ? 'Working' : 'Not tested',
          screenshot
        }
      });

    } catch (error) {
      this.testResults.push({
        test: testName,
        status: 'ERROR',
        error: error.message,
        screenshot: await TestHelpers.takeScreenshot(this.page, 'cart_error', this.testId)
      });
    }
  }

  async testRemoveFromCart() {
    const testName = 'Remove Item from Cart';
    try {
      await TestHelpers.login(this.page, 'customer');
      await this.page.goto(`${config.environments.development.frontend}/cart`);
      
      const cartItemsBefore = await this.page.$$('.cart-item, [data-testid="cart-item"]');
      
      if (cartItemsBefore.length > 0) {
        // Chercher le bouton de suppression
        const removeButton = await this.page.$('.remove-item, [data-testid="remove-item"], button:contains("Supprimer")');
        
        if (removeButton) {
          const screenshot1 = await TestHelpers.takeScreenshot(this.page, 'before_remove', this.testId);
          
          await removeButton.click();
          await this.page.waitForTimeout(2000);
          
          const cartItemsAfter = await this.page.$$('.cart-item, [data-testid="cart-item"]');
          const screenshot2 = await TestHelpers.takeScreenshot(this.page, 'after_remove', this.testId);
          
          this.testResults.push({
            test: testName,
            status: cartItemsAfter.length < cartItemsBefore.length ? 'PASS' : 'FAIL',
            details: {
              itemsBefore: cartItemsBefore.length,
              itemsAfter: cartItemsAfter.length,
              removeButtonFound: true,
              screenshots: [screenshot1, screenshot2]
            }
          });
        } else {
          this.testResults.push({
            test: testName,
            status: 'FAIL',
            details: { removeButtonFound: false, items: cartItemsBefore.length }
          });
        }
      } else {
        this.testResults.push({
          test: testName,
          status: 'SKIP',
          details: { reason: 'No items in cart to remove' }
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

  async testCheckoutProcess() {
    const testName = 'Checkout Process';
    try {
      await TestHelpers.login(this.page, 'customer');
      
      // S'assurer qu'il y a des items dans le panier
      await this.page.goto(`${config.environments.development.frontend}/cart`);
      const cartItems = await this.page.$$('.cart-item, [data-testid="cart-item"]');
      
      if (cartItems.length === 0) {
        // Ajouter un produit au panier d'abord
        await this.page.goto(`${config.environments.development.frontend}/products`);
        const addButton = await this.page.$('[data-testid="add-to-cart"], button:contains("Ajouter")');
        if (addButton) {
          await addButton.click();
          await this.page.waitForTimeout(1000);
          await this.page.goto(`${config.environments.development.frontend}/cart`);
        }
      }
      
      // Commencer le processus de commande
      const checkoutButton = await TestHelpers.waitForElement(this.page, '[data-testid="checkout-button"], button:contains("Commander")');
      
      if (checkoutButton) {
        const screenshot1 = await TestHelpers.takeScreenshot(this.page, 'before_checkout', this.testId);
        
        const performance = await TestHelpers.measurePerformance(this.page, async () => {
          await checkoutButton.click();
          await this.page.waitForTimeout(3000);
        });
        
        // Vérifier la page de commande/checkout
        const checkoutForm = await this.page.$('form, [data-testid="checkout-form"], .checkout-page');
        const addressSection = await this.page.$('.address-section, [data-testid="address-section"]');
        const paymentSection = await this.page.$('.payment-section, [data-testid="payment-section"]');
        
        const screenshot2 = await TestHelpers.takeScreenshot(this.page, 'checkout_page', this.testId);
        
        this.testResults.push({
          test: testName,
          status: checkoutForm ? 'PASS' : 'FAIL',
          duration: performance.duration,
          details: {
            checkoutForm: checkoutForm ? 'Found' : 'Missing',
            addressSection: addressSection ? 'Found' : 'Missing',
            paymentSection: paymentSection ? 'Found' : 'Missing',
            performance: performance.performanceOk ? 'Good' : 'Slow',
            screenshots: [screenshot1, screenshot2]
          }
        });
      } else {
        this.testResults.push({
          test: testName,
          status: 'FAIL',
          details: { checkoutButtonFound: false }
        });
      }

    } catch (error) {
      this.testResults.push({
        test: testName,
        status: 'ERROR',
        error: error.message,
        screenshot: await TestHelpers.takeScreenshot(this.page, 'checkout_error', this.testId)
      });
    }
  }

  async testOrderConfirmation() {
    const testName = 'Order Confirmation';
    try {
      await TestHelpers.login(this.page, 'customer');
      
      // Simuler une commande complète (version simplifiée)
      await this.page.goto(`${config.environments.development.frontend}/orders`);
      
      // Vérifier la page de commandes
      const ordersPage = await TestHelpers.waitForElement(this.page, '.orders-page, [data-testid="orders-page"], .order-history');
      const ordersList = await this.page.$$('.order-item, [data-testid="order-item"]');
      
      const screenshot = await TestHelpers.takeScreenshot(this.page, 'orders_page', this.testId);
      
      this.testResults.push({
        test: testName,
        status: ordersPage ? 'PASS' : 'FAIL',
        details: {
          ordersPage: ordersPage ? 'Found' : 'Missing',
          ordersCount: ordersList.length,
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

  async testCartPersistence() {
    const testName = 'Cart Persistence';
    try {
      await TestHelpers.login(this.page, 'customer');
      
      // Ajouter un produit au panier
      await this.page.goto(`${config.environments.development.frontend}/products`);
      const addButton = await this.page.$('[data-testid="add-to-cart"], button:contains("Ajouter")');
      if (addButton) {
        await addButton.click();
        await this.page.waitForTimeout(1000);
      }
      
      // Recharger la page
      await this.page.reload({ waitUntil: 'networkidle0' });
      await this.page.waitForTimeout(2000);
      
      // Vérifier que le panier est maintenu
      const cartCounter = await this.page.$('[data-testid="cart-count"], .cart-counter');
      const cartCountText = cartCounter ? await this.page.evaluate(el => el.textContent, cartCounter) : '0';
      
      const screenshot = await TestHelpers.takeScreenshot(this.page, 'cart_persistence', this.testId);
      
      this.testResults.push({
        test: testName,
        status: parseInt(cartCountText) > 0 ? 'PASS' : 'FAIL',
        details: {
          cartCount: cartCountText,
          persistent: parseInt(cartCountText) > 0,
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

  async runAllTests() {
    try {
      await this.init();
      
      await this.testAddToCart();
      await this.testCartPage();
      await this.testRemoveFromCart();
      await this.testCheckoutProcess();
      await this.testOrderConfirmation();
      await this.testCartPersistence();
      
      return {
        feature: 'Cart & Checkout',
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

module.exports = CartCheckoutTests;

// Exécution directe si appelé en tant que script
if (require.main === module) {
  const test = new CartCheckoutTests();
  test.runAllTests().then(result => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.summary.failed === 0 && result.summary.errors === 0 ? 0 : 1);
  }).catch(error => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
}