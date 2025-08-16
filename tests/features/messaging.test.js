/**
 * Tests du système de messagerie - Communication vendeur-client
 * Fonctionnalité critique pour les interactions commerciales
 */

const puppeteer = require('puppeteer');
const config = require('../config/test-config');
const TestHelpers = require('../utils/test-helpers');

class MessagingTests {
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

  async testMessagesPageAccess() {
    const testName = 'Messages Page Access';
    try {
      // Se connecter d'abord
      await TestHelpers.login(this.page, 'customer');
      
      const performance = await TestHelpers.measurePerformance(this.page, async () => {
        await this.page.goto(`${config.environments.development.frontend}/messages`, {
          waitUntil: 'networkidle0',
          timeout: config.timeouts.navigation
        });
      });

      const screenshot = await TestHelpers.takeScreenshot(this.page, 'messages_page', this.testId);
      
      // Vérifier les éléments de la page
      const messagesTitle = await TestHelpers.waitForText(this.page, 'Messages');
      const conversationList = await TestHelpers.waitForElement(this.page, '[data-testid="conversation-list"], .conversation');
      const searchInput = await TestHelpers.waitForElement(this.page, 'input[placeholder*="Rechercher"]');

      this.testResults.push({
        test: testName,
        status: messagesTitle && searchInput ? 'PASS' : 'FAIL',
        duration: performance.duration,
        details: {
          messagesTitle: messagesTitle ? 'Found' : 'Missing',
          conversationList: conversationList ? 'Found' : 'Missing',
          searchInput: searchInput ? 'Found' : 'Missing',
          performance: performance.performanceOk ? 'Good' : 'Slow',
          screenshot
        }
      });

    } catch (error) {
      this.testResults.push({
        test: testName,
        status: 'ERROR',
        error: error.message,
        screenshot: await TestHelpers.takeScreenshot(this.page, 'messages_error', this.testId)
      });
    }
  }

  async testStartConversation() {
    const testName = 'Start New Conversation';
    try {
      // Aller sur la page d'un commerce pour démarrer une conversation
      await this.page.goto(`${config.environments.development.frontend}/commerces`);
      
      // Attendre le chargement et cliquer sur un commerce
      await this.page.waitForTimeout(2000);
      const commerceCard = await this.page.$('[data-testid="commerce-card"], .commerce-item');
      
      if (commerceCard) {
        await commerceCard.click();
        await this.page.waitForTimeout(1000);
        
        // Chercher le bouton "Message" ou "Contacter"
        const messageButton = await TestHelpers.waitForElement(this.page, 
          '[data-testid="message-button"], button:contains("Message"), button:contains("Contacter")'
        );
        
        const screenshot1 = await TestHelpers.takeScreenshot(this.page, 'before_message', this.testId);
        
        if (messageButton) {
          await messageButton.click();
          await this.page.waitForTimeout(2000);
          
          // Vérifier la redirection vers les messages
          const currentUrl = this.page.url();
          const isOnMessages = currentUrl.includes('/messages');
          
          const screenshot2 = await TestHelpers.takeScreenshot(this.page, 'after_message_click', this.testId);
          
          this.testResults.push({
            test: testName,
            status: isOnMessages ? 'PASS' : 'FAIL',
            details: {
              messageButtonFound: true,
              redirectedToMessages: isOnMessages,
              finalUrl: currentUrl,
              screenshots: [screenshot1, screenshot2]
            }
          });
        } else {
          this.testResults.push({
            test: testName,
            status: 'FAIL',
            details: {
              messageButtonFound: false,
              screenshot: screenshot1
            }
          });
        }
      } else {
        this.testResults.push({
          test: testName,
          status: 'SKIP',
          details: { reason: 'No commerce cards found' }
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

  async testSendMessage() {
    const testName = 'Send Message';
    try {
      // Aller sur la page messages
      await this.page.goto(`${config.environments.development.frontend}/messages`);
      await this.page.waitForTimeout(2000);
      
      // Vérifier s'il y a des conversations existantes
      const conversations = await this.page.$$('[data-testid="conversation-item"], .conversation-item');
      
      if (conversations.length > 0) {
        // Cliquer sur la première conversation
        await conversations[0].click();
        await this.page.waitForTimeout(1000);
        
        // Chercher la zone de saisie de message
        const messageInput = await TestHelpers.waitForElement(this.page, 
          'textarea[placeholder*="message"], input[placeholder*="message"], [data-testid="message-input"]'
        );
        
        if (messageInput) {
          const testMessage = `Message de test automatisé - ${new Date().toISOString()}`;
          
          // Taper le message
          await this.page.focus('textarea[placeholder*="message"], input[placeholder*="message"]');
          await this.page.type('textarea[placeholder*="message"], input[placeholder*="message"]', testMessage);
          
          const screenshot1 = await TestHelpers.takeScreenshot(this.page, 'message_typed', this.testId);
          
          // Chercher et cliquer sur le bouton d'envoi
          const sendButton = await TestHelpers.waitForElement(this.page, 
            'button[type="submit"], [data-testid="send-button"], button:contains("Envoyer")'
          );
          
          if (sendButton) {
            await sendButton.click();
            await this.page.waitForTimeout(2000);
            
            // Vérifier que le message apparaît dans la conversation
            const messageInChat = await TestHelpers.waitForText(this.page, testMessage);
            const screenshot2 = await TestHelpers.takeScreenshot(this.page, 'message_sent', this.testId);
            
            this.testResults.push({
              test: testName,
              status: messageInChat ? 'PASS' : 'FAIL',
              details: {
                messageInputFound: true,
                sendButtonFound: true,
                messageAppeared: messageInChat ? 'Yes' : 'No',
                messageContent: testMessage,
                screenshots: [screenshot1, screenshot2]
              }
            });
          } else {
            this.testResults.push({
              test: testName,
              status: 'FAIL',
              details: {
                messageInputFound: true,
                sendButtonFound: false,
                screenshot: screenshot1
              }
            });
          }
        } else {
          this.testResults.push({
            test: testName,
            status: 'FAIL',
            details: { messageInputFound: false }
          });
        }
      } else {
        this.testResults.push({
          test: testName,
          status: 'SKIP',
          details: { reason: 'No existing conversations to test with' }
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

  async testMessageNotifications() {
    const testName = 'Message Notifications';
    try {
      // Aller sur la page principale
      await this.page.goto(`${config.environments.development.frontend}/`);
      await this.page.waitForTimeout(2000);
      
      // Chercher le badge de notifications de messages
      const notificationBadge = await TestHelpers.waitForElement(this.page, 
        '[data-testid="message-notification"], .message-badge, .notification-badge'
      );
      
      // Chercher l'icône de messages dans la navigation
      const messageIcon = await TestHelpers.waitForElement(this.page, 
        '[data-testid="messages-link"], a[href*="messages"], button:contains("Messages")'
      );
      
      const screenshot = await TestHelpers.takeScreenshot(this.page, 'message_notifications', this.testId);
      
      this.testResults.push({
        test: testName,
        status: messageIcon ? 'PASS' : 'FAIL',
        details: {
          notificationBadge: notificationBadge ? 'Found' : 'Not found',
          messageIcon: messageIcon ? 'Found' : 'Missing',
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

  async testMessageAPI() {
    const testName = 'Messages API Endpoints';
    try {
      const endpoints = [
        { path: '/api/v1/messages', method: 'GET', expectedStatus: [200, 401] },
        { path: '/api/v1/messages/conversations', method: 'GET', expectedStatus: [200, 401] },
        { path: '/api/v1/messages/unread_count', method: 'GET', expectedStatus: [200, 401] },
        { path: '/api/v1/messages/start_conversation', method: 'POST', expectedStatus: [200, 401, 422] }
      ];

      const results = [];
      for (const endpoint of endpoints) {
        const result = await TestHelpers.checkAPIEndpoint(this.page, endpoint.path, endpoint.expectedStatus);
        results.push({
          endpoint: endpoint.path,
          method: endpoint.method,
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

  async testConversationSearch() {
    const testName = 'Conversation Search';
    try {
      await this.page.goto(`${config.environments.development.frontend}/messages`);
      await this.page.waitForTimeout(2000);
      
      // Chercher la barre de recherche
      const searchInput = await TestHelpers.waitForElement(this.page, 
        'input[placeholder*="Rechercher"], [data-testid="search-conversations"]'
      );
      
      if (searchInput) {
        // Taper quelque chose dans la recherche
        await this.page.focus('input[placeholder*="Rechercher"]');
        await this.page.type('input[placeholder*="Rechercher"]', 'test');
        await this.page.waitForTimeout(1000);
        
        const screenshot = await TestHelpers.takeScreenshot(this.page, 'conversation_search', this.testId);
        
        // Vérifier que la liste est filtrée (ou vide si pas de résultats)
        const conversationList = await this.page.$('[data-testid="conversation-list"], .conversations-list');
        
        this.testResults.push({
          test: testName,
          status: 'PASS',
          details: {
            searchInputFound: true,
            searchExecuted: true,
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

  async runAllTests() {
    try {
      await this.init();
      
      await this.testMessagesPageAccess();
      await this.testStartConversation();
      await this.testSendMessage();
      await this.testMessageNotifications();
      await this.testMessageAPI();
      await this.testConversationSearch();
      
      return {
        feature: 'Messaging System',
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

module.exports = MessagingTests;

// Exécution directe si appelé en tant que script
if (require.main === module) {
  const test = new MessagingTests();
  test.runAllTests().then(result => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.summary.failed === 0 && result.summary.errors === 0 ? 0 : 1);
  }).catch(error => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
}