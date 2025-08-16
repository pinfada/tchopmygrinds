/**
 * Script d'exécution des tests de régression
 * À utiliser avant chaque déploiement en production
 */

const TestRunner = require('./test-runner');
const RegressionDetector = require('./regression-detector');
const VisualRegressionDetector = require('./visual-regression-detector');

class RegressionTestRunner {
  constructor(options = {}) {
    this.options = {
      updateBaseline: options.updateBaseline || false,
      exitOnRegression: options.exitOnRegression !== false,
      verbose: options.verbose || false,
      features: options.features || ['authentication', 'commerces', 'ratings', 'product-interest', 'cart-checkout'],
      visualTests: options.visualTests !== false
    };
  }

  async run() {
    console.log('🔍 TESTS DE RÉGRESSION - TchopMyGrinds');
    console.log('='.repeat(50));
    console.log('⚠️  IMPORTANT: Ces tests vérifient les régressions avant déploiement');
    console.log('');

    try {
      // 1. Exécuter tous les tests
      const runner = new TestRunner({
        features: this.options.features,
        parallel: false, // Séquentiel pour plus de stabilité
        generateReport: true,
        verbose: this.options.verbose
      });

      console.log('📋 Phase 1: Exécution des tests...');
      const testResults = await runner.run();

      if (!testResults.success) {
        console.log('❌ Tests échoués - impossible d\'analyser les régressions');
        process.exit(1);
      }

      // 2. Analyser les régressions
      console.log('\n📋 Phase 2: Analyse des régressions...');
      const detector = new RegressionDetector();
      detector.setCurrentResults({
        metadata: {
          generatedAt: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development'
        },
        features: testResults.results,
        summary: testResults.summary
      });

      const regressionAnalysis = await detector.analyzeRegressions();
      detector.printRegressionReport(regressionAnalysis);

      // 2b. Analyser les régressions visuelles
      let visualAnalysis = null;
      if (this.options.visualTests) {
        console.log('\n📋 Phase 2b: Analyse des régressions visuelles...');
        const visualDetector = new VisualRegressionDetector();
        visualAnalysis = await visualDetector.analyzeVisualRegressions();
        visualDetector.printVisualReport(visualAnalysis);
        
        if (this.options.updateBaseline) {
          await visualDetector.updateBaseline();
        }
      }

      // 3. Décision sur la baseline
      if (this.options.updateBaseline || regressionAnalysis.isBaseline) {
        console.log('📋 Phase 3: Mise à jour de la baseline...');
        await detector.updateBaseline();
      }

      // 4. Décision finale
      console.log('📋 Phase 4: Évaluation finale...');
      const hasHighSeverityRegressions = regressionAnalysis.regressions?.some(r => r.severity === 'high');
      const hasCriticalRegressions = regressionAnalysis.regressions?.some(r => r.type === 'functional');

      if (hasHighSeverityRegressions || hasCriticalRegressions) {
        console.log('🚨 RÉSULTAT: DÉPLOIEMENT NON RECOMMANDÉ');
        console.log('   Raison: Régressions critiques détectées');
        console.log('   Action: Corriger les régressions avant déploiement');
        
        if (this.options.exitOnRegression) {
          process.exit(1);
        }
      } else if (regressionAnalysis.regressions?.length > 0) {
        console.log('⚠️  RÉSULTAT: DÉPLOIEMENT AVEC PRUDENCE');
        console.log('   Raison: Régressions mineures détectées');
        console.log('   Action: Surveillance renforcée recommandée');
      } else {
        console.log('✅ RÉSULTAT: DÉPLOIEMENT AUTORISÉ');
        console.log('   Raison: Aucune régression détectée');
        console.log('   Action: Déploiement sécurisé');
      }

      // 5. Rapport final
      const reportPath = testResults.reports?.html;
      if (reportPath) {
        console.log(`\n📊 Rapport détaillé disponible: ${reportPath}`);
      }

      console.log('\n' + '='.repeat(50));
      
      return {
        success: !hasHighSeverityRegressions && !hasCriticalRegressions,
        testResults,
        regressionAnalysis,
        recommendation: hasHighSeverityRegressions || hasCriticalRegressions ? 'BLOCK' : 
                       regressionAnalysis.regressions?.length > 0 ? 'CAUTION' : 'PROCEED'
      };

    } catch (error) {
      console.error('❌ Erreur lors des tests de régression:', error.message);
      console.error(error.stack);
      process.exit(1);
    }
  }
}

// Utilisation en ligne de commande
if (require.main === module) {
  const argv = process.argv.slice(2);
  const options = {};

  // Parser les arguments
  if (argv.includes('--update-baseline')) options.updateBaseline = true;
  if (argv.includes('--no-exit-on-regression')) options.exitOnRegression = false;
  if (argv.includes('--verbose')) options.verbose = true;

  const featureArg = argv.find(arg => arg.startsWith('--features='));
  if (featureArg) {
    options.features = featureArg.split('=')[1].split(',');
  }

  const regressionRunner = new RegressionTestRunner(options);
  
  regressionRunner.run().then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = RegressionTestRunner;