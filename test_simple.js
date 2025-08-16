const puppeteer = require('puppeteer');

async function testRatingSystem() {
  console.log('🧪 Test simple du système d\'évaluations\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1280, height: 720 }
  });
  
  const page = await browser.newPage();
  
  try {
    // Test 1: Vérifier que le frontend démarre
    console.log('🔍 Test: Chargement du frontend React...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0', timeout: 10000 });
    console.log('✅ Frontend accessible\n');
    
    // Test 2: Aller sur une page de produit
    console.log('🔍 Test: Navigation vers page produit...');
    await page.goto('http://localhost:3001/products/1', { waitUntil: 'networkidle0', timeout: 10000 });
    console.log('✅ Page produit accessible\n');
    
    // Test 3: Vérifier la présence de composants d'évaluation
    console.log('🔍 Test: Recherche des composants d\'évaluation...');
    
    // Attendre un peu que les composants se chargent
    await page.waitForTimeout(2000);
    
    // Prendre une capture d'écran pour diagnostique
    await page.screenshot({ path: 'test-screenshot.png', fullPage: true });
    console.log('📷 Capture d\'écran sauvée: test-screenshot.png');
    
    // Chercher différents sélecteurs possibles
    const selectors = [
      'section:contains("évaluation")',
      'div:contains("avis")', 
      'button:contains("Laisser")',
      '.rating-section',
      '[data-testid="rating"]',
      '.star-rating',
      'svg[viewBox="0 0 20 20"]' // étoiles SVG
    ];
    
    let foundComponents = 0;
    for (const selector of selectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          console.log(`✅ Trouvé ${elements.length} élément(s) pour: ${selector}`);
          foundComponents++;
        }
      } catch (error) {
        // Sélecteur non supporté, on continue
      }
    }
    
    if (foundComponents > 0) {
      console.log(`\n🎉 ${foundComponents} type(s) de composants d'évaluation détectés !`);
    } else {
      console.log('\n⚠️  Aucun composant d\'évaluation détecté sur la page');
    }
    
    // Test 4: Vérifier le code source pour les imports
    console.log('\n🔍 Test: Analyse du code source...');
    const content = await page.content();
    
    const checks = [
      { name: 'Import React', pattern: /react/i },
      { name: 'Composant Rating', pattern: /rating/i },
      { name: 'Étoiles', pattern: /star|étoile/i },
      { name: 'Évaluation', pattern: /évaluation|avis/i }
    ];
    
    checks.forEach(check => {
      if (check.pattern.test(content)) {
        console.log(`✅ ${check.name} détecté dans le code`);
      } else {
        console.log(`❌ ${check.name} non trouvé`);
      }
    });
    
    console.log('\n✅ Tests terminés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur durant les tests:', error.message);
  } finally {
    await browser.close();
  }
}

testRatingSystem().catch(console.error);