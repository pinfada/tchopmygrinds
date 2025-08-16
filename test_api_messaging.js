/**
 * Tests API spécifiques pour le système de messagerie
 * Test les endpoints REST de l'API de messagerie
 */

const axios = require('axios');

class MessageAPITests {
  constructor() {
    this.baseURL = 'http://localhost:3000/api/v1';
    this.testResults = [];
    this.authToken = null;
    this.testUsers = {
      sender: { email: 'customer@test.com', password: 'password123' },
      receiver: { email: 'merchant@test.com', password: 'password123' }
    };
  }

  async authenticateUser(user) {
    try {
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: user.email,
        password: user.password
      });
      
      return response.headers.authorization?.replace('Bearer ', '') || 
             response.data.token ||
             null;
    } catch (error) {
      console.error('Authentication failed:', error.response?.data || error.message);
      return null;
    }
  }

  async testAuthentication() {
    const testName = 'User Authentication for Messaging';
    try {
      this.authToken = await this.authenticateUser(this.testUsers.sender);
      
      this.testResults.push({
        test: testName,
        status: this.authToken ? 'PASS' : 'FAIL',
        details: {
          tokenReceived: !!this.authToken,
          tokenLength: this.authToken ? this.authToken.length : 0
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

  async testStartConversation() {
    const testName = 'Start Conversation API';
    try {
      if (!this.authToken) {
        throw new Error('No authentication token available');
      }

      const response = await axios.post(
        `${this.baseURL}/messages/start_conversation`,
        { receiver_id: 16 }, // ID de test
        {
          headers: { Authorization: `Bearer ${this.authToken}` }
        }
      );

      const isSuccess = response.status === 200 && response.data.data.conversation_id;

      this.testResults.push({
        test: testName,
        status: isSuccess ? 'PASS' : 'FAIL',
        details: {
          statusCode: response.status,
          conversationId: response.data.data?.conversation_id,
          existing: response.data.data?.existing,
          receiverInfo: response.data.data?.receiver ? 'Present' : 'Missing'
        }
      });

      return response.data.data?.conversation_id;
    } catch (error) {
      this.testResults.push({
        test: testName,
        status: 'ERROR',
        error: error.response?.data?.error || error.message,
        statusCode: error.response?.status
      });
      return null;
    }
  }

  async testSendMessage() {
    const testName = 'Send Message API';
    try {
      if (!this.authToken) {
        throw new Error('No authentication token available');
      }

      const messageData = {
        content: `Test message from API - ${new Date().toISOString()}`,
        receiver_id: 16,
        message_type: 'general',
        subject: 'Test API Message'
      };

      const response = await axios.post(
        `${this.baseURL}/messages`,
        { message: messageData },
        {
          headers: { Authorization: `Bearer ${this.authToken}` }
        }
      );

      const isSuccess = response.status === 201 && response.data.data.message.id;

      this.testResults.push({
        test: testName,
        status: isSuccess ? 'PASS' : 'FAIL',
        details: {
          statusCode: response.status,
          messageId: response.data.data?.message?.id,
          messageContent: response.data.data?.message?.content,
          conversationId: response.data.data?.message?.conversation_id,
          messageType: response.data.data?.message?.message_type
        }
      });

      return response.data.data?.message;
    } catch (error) {
      this.testResults.push({
        test: testName,
        status: 'ERROR',
        error: error.response?.data?.error || error.message,
        statusCode: error.response?.status
      });
      return null;
    }
  }

  async testGetConversations() {
    const testName = 'Get Conversations API';
    try {
      if (!this.authToken) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(
        `${this.baseURL}/messages/conversations`,
        {
          headers: { Authorization: `Bearer ${this.authToken}` }
        }
      );

      const isSuccess = response.status === 200 && Array.isArray(response.data.data.conversations);

      this.testResults.push({
        test: testName,
        status: isSuccess ? 'PASS' : 'FAIL',
        details: {
          statusCode: response.status,
          conversationsCount: response.data.data?.conversations?.length || 0,
          unreadCount: response.data.data?.unread_count || 0,
          hasConversations: response.data.data?.conversations?.length > 0
        }
      });

      return response.data.data?.conversations;
    } catch (error) {
      this.testResults.push({
        test: testName,
        status: 'ERROR',
        error: error.response?.data?.error || error.message,
        statusCode: error.response?.status
      });
      return null;
    }
  }

  async testGetMessages() {
    const testName = 'Get Messages API';
    try {
      if (!this.authToken) {
        throw new Error('No authentication token available');
      }

      // D'abord récupérer les conversations pour avoir un conversation_id
      const conversations = await this.testGetConversations();
      
      if (!conversations || conversations.length === 0) {
        this.testResults.push({
          test: testName,
          status: 'SKIP',
          details: { reason: 'No conversations available to test with' }
        });
        return;
      }

      const conversationId = conversations[0].conversation_id;
      
      const response = await axios.get(
        `${this.baseURL}/messages?conversation_id=${conversationId}`,
        {
          headers: { Authorization: `Bearer ${this.authToken}` }
        }
      );

      const isSuccess = response.status === 200 && Array.isArray(response.data.data.messages);

      this.testResults.push({
        test: testName,
        status: isSuccess ? 'PASS' : 'FAIL',
        details: {
          statusCode: response.status,
          messagesCount: response.data.data?.messages?.length || 0,
          conversationId: conversationId,
          paginationInfo: response.data.data?.pagination ? 'Present' : 'Missing'
        }
      });

    } catch (error) {
      this.testResults.push({
        test: testName,
        status: 'ERROR',
        error: error.response?.data?.error || error.message,
        statusCode: error.response?.status
      });
    }
  }

  async testUnreadCount() {
    const testName = 'Unread Count API';
    try {
      if (!this.authToken) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(
        `${this.baseURL}/messages/unread_count`,
        {
          headers: { Authorization: `Bearer ${this.authToken}` }
        }
      );

      const isSuccess = response.status === 200 && 
                       typeof response.data.data.unread_count === 'number';

      this.testResults.push({
        test: testName,
        status: isSuccess ? 'PASS' : 'FAIL',
        details: {
          statusCode: response.status,
          unreadCount: response.data.data?.unread_count,
          responseFormat: typeof response.data.data?.unread_count
        }
      });

    } catch (error) {
      this.testResults.push({
        test: testName,
        status: 'ERROR',
        error: error.response?.data?.error || error.message,
        statusCode: error.response?.status
      });
    }
  }

  async testMessageWithProduct() {
    const testName = 'Message with Product Context API';
    try {
      if (!this.authToken) {
        throw new Error('No authentication token available');
      }

      const messageData = {
        content: 'Je suis intéressé par ce produit. Est-il toujours disponible ?',
        receiver_id: 16,
        message_type: 'product_inquiry',
        subject: 'Demande d\'information produit',
        product_id: 1 // ID de test
      };

      const response = await axios.post(
        `${this.baseURL}/messages`,
        { message: messageData },
        {
          headers: { Authorization: `Bearer ${this.authToken}` }
        }
      );

      const isSuccess = response.status === 201 && 
                       response.data.data.message.message_type === 'product_inquiry';

      this.testResults.push({
        test: testName,
        status: isSuccess ? 'PASS' : 'FAIL',
        details: {
          statusCode: response.status,
          messageType: response.data.data?.message?.message_type,
          productId: response.data.data?.message?.product?.id,
          hasProductContext: !!response.data.data?.message?.product
        }
      });

    } catch (error) {
      this.testResults.push({
        test: testName,
        status: 'ERROR',
        error: error.response?.data?.error || error.message,
        statusCode: error.response?.status
      });
    }
  }

  async testUnauthorizedAccess() {
    const testName = 'Unauthorized Access Protection';
    try {
      // Tester sans token
      const response = await axios.get(`${this.baseURL}/messages/conversations`);
      
      // Ne devrait pas arriver ici
      this.testResults.push({
        test: testName,
        status: 'FAIL',
        details: {
          statusCode: response.status,
          reason: 'Request succeeded without authentication'
        }
      });

    } catch (error) {
      const isCorrectError = error.response?.status === 401;
      
      this.testResults.push({
        test: testName,
        status: isCorrectError ? 'PASS' : 'FAIL',
        details: {
          statusCode: error.response?.status,
          errorMessage: error.response?.data?.error,
          correctlyBlocked: isCorrectError
        }
      });
    }
  }

  async runAllTests() {
    console.log('🧪 Démarrage des tests API de messagerie...\n');

    try {
      await this.testAuthentication();
      await this.testUnauthorizedAccess();
      
      if (this.authToken) {
        await this.testStartConversation();
        await this.testSendMessage();
        await this.testGetConversations();
        await this.testGetMessages();
        await this.testUnreadCount();
        await this.testMessageWithProduct();
      }

      const summary = {
        total: this.testResults.length,
        passed: this.testResults.filter(t => t.status === 'PASS').length,
        failed: this.testResults.filter(t => t.status === 'FAIL').length,
        errors: this.testResults.filter(t => t.status === 'ERROR').length,
        skipped: this.testResults.filter(t => t.status === 'SKIP').length
      };

      const result = {
        feature: 'Messaging API',
        timestamp: new Date().toISOString(),
        baseURL: this.baseURL,
        authenticated: !!this.authToken,
        results: this.testResults,
        summary
      };

      console.log('\n📊 Résultats des tests API de messagerie:');
      console.log(`✅ Réussis: ${summary.passed}`);
      console.log(`❌ Échoués: ${summary.failed}`);
      console.log(`🔥 Erreurs: ${summary.errors}`);
      console.log(`⏭️ Ignorés: ${summary.skipped}`);
      console.log(`📈 Total: ${summary.total}`);

      if (summary.failed > 0 || summary.errors > 0) {
        console.log('\n🔍 Tests échoués/erreurs:');
        this.testResults
          .filter(t => t.status === 'FAIL' || t.status === 'ERROR')
          .forEach(test => {
            console.log(`  - ${test.test}: ${test.status}`);
            if (test.error) console.log(`    Erreur: ${test.error}`);
          });
      }

      return result;

    } catch (error) {
      console.error('❌ Erreur fatale lors des tests:', error.message);
      process.exit(1);
    }
  }
}

// Exécution directe
if (require.main === module) {
  const tests = new MessageAPITests();
  tests.runAllTests().then(result => {
    const success = result.summary.failed === 0 && result.summary.errors === 0;
    process.exit(success ? 0 : 1);
  });
}

module.exports = MessageAPITests;