const puppeteer = require('puppeteer');

// Configuration
const BASE_URL = 'http://localhost:3000';

async function testRatingAPIs() {
  console.log('🧪 Test des APIs d\'évaluation...\n');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const tests = [
    {
      name: 'API Commerces',
      url: `${BASE_URL}/api/v1/commerces`,
      expectedStatus: [200]
    },
    {
      name: 'API Produits', 
      url: `${BASE_URL}/api/v1/products`,
      expectedStatus: [200]
    },
    {
      name: 'API Ratings (sans auth)',
      url: `${BASE_URL}/api/v1/ratings?rateable_type=Product&rateable_id=1`,
      expectedStatus: [200, 401] // 401 acceptable si auth requise
    },
    {
      name: 'API Admin Ratings (sans auth)',
      url: `${BASE_URL}/api/v1/admin/ratings`,
      expectedStatus: [401, 403] // Doit être protégé
    },
    {
      name: 'API Admin Stats (sans auth)',
      url: `${BASE_URL}/api/v1/admin/ratings/stats`,
      expectedStatus: [401, 403] // Doit être protégé
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      console.log(`🔍 Test: ${test.name}`);
      
      const response = await page.goto(test.url, {
        waitUntil: 'networkidle0',
        timeout: 5000
      });
      
      const status = response.status();
      const isExpected = test.expectedStatus.includes(status);
      
      if (isExpected) {
        console.log(`   ✅ Status ${status} (attendu)`);
        results.push({ test: test.name, status: 'PASS', httpStatus: status });
      } else {
        console.log(`   ❌ Status ${status} (attendu: ${test.expectedStatus.join(', ')})`);
        results.push({ test: test.name, status: 'FAIL', httpStatus: status });
      }
      
      // Vérifier le contenu pour les APIs publiques
      if (status === 200) {
        const content = await response.text();
        if (content.includes('error')) {
          console.log(`   ⚠️  Réponse contient des erreurs`);
        } else if (content.length > 10) {
          console.log(`   ✅ Contenu valide (${content.length} chars)`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
      results.push({ test: test.name, status: 'ERROR', error: error.message });
    }
    
    console.log('');
  }
  
  await browser.close();
  
  // Résumé
  const passed = results.filter(r => r.status === 'PASS').length;
  const total = results.length;
  
  console.log('📊 RÉSUMÉ DES TESTS API');
  console.log('='.repeat(30));
  console.log(`✅ Réussis: ${passed}/${total}`);
  console.log(`❌ Échoués: ${total - passed}/${total}`);
  console.log(`📈 Taux de réussite: ${Math.round((passed/total)*100)}%\n`);
  
  if (passed === total) {
    console.log('🎉 Tous les tests API sont passés !');
    console.log('💡 Les endpoints d\'évaluation sont fonctionnels');
  } else {
    console.log('⚠️  Certains tests ont échoué');
    console.log('💡 Vérifiez que Rails server fonctionne sur le port 3000');
  }
  
  return passed === total;
}

// Lancement
if (require.main === module) {
  testRatingAPIs().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = testRatingAPIs;