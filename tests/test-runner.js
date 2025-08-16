/**
 * Runner principal pour tous les tests E2E
 * Exécute tous les tests et génère les rapports
 */

const path = require('path');
const config = require('./config/test-config');
const TestHelpers = require('./utils/test-helpers');
const ReportGenerator = require('./utils/report-generator');

// Import des tests par fonctionnalité
const AuthenticationTests = require('./features/authentication.test');
const RatingsTests = require('./features/ratings.test');
const CommercesTests = require('./features/commerces.test');

class TestRunner {
  constructor(options = {}) {
    this.options = {
      features: options.features || Object.keys(config.features).filter(f => config.features[f].enabled),
      parallel: options.parallel || false,
      generateReport: options.generateReport !== false,
      cleanup: options.cleanup !== false,
      verbose: options.verbose || false
    };
    
    this.reportGenerator = new ReportGenerator();
    this.startTime = Date.now();
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      reset: '\x1b[0m'     // Reset
    };
    
    if (this.options.verbose || level !== 'info') {
      console.log(`${colors[level]}[${timestamp}] ${message}${colors.reset}`);
    }
  }

  async runSingleFeature(featureName) {
    this.log(`🧪 Début des tests: ${featureName}`, 'info');
    
    try {
      let testClass;
      
      switch (featureName.toLowerCase()) {
        case 'authentication':
          testClass = new AuthenticationTests();
          break;
        case 'ratings':
          testClass = new RatingsTests();
          break;
        case 'commerces':
          testClass = new CommercesTests();
          break;
        default:
          throw new Error(`Fonctionnalité de test inconnue: ${featureName}`);
      }
      
      const result = await testClass.runAllTests();
      
      // Ajouter des métadonnées
      result.startTime = Date.now();
      result.duration = Date.now() - result.startTime;
      
      const passed = result.summary.passed;
      const total = result.summary.total;
      const status = result.summary.failed === 0 && result.summary.errors === 0 ? 'success' : 'warning';
      
      this.log(`✅ ${featureName}: ${passed}/${total} tests réussis`, status);
      
      if (result.summary.failed > 0) {
        this.log(`❌ ${result.summary.failed} tests échoués`, 'error');
      }
      
      if (result.summary.errors > 0) {
        this.log(`⚠️  ${result.summary.errors} erreurs`, 'warning');
      }
      
      return result;
      
    } catch (error) {
      this.log(`❌ Erreur lors des tests ${featureName}: ${error.message}`, 'error');
      
      return {
        feature: featureName,
        timestamp: new Date().toISOString(),
        results: [],
        summary: { total: 0, passed: 0, failed: 0, errors: 1 },
        error: error.message
      };
    }
  }

  async runAllFeatures() {
    this.log(`🚀 Début de l'exécution des tests pour ${this.options.features.length} fonctionnalités`, 'info');
    
    const results = [];
    
    if (this.options.parallel) {
      // Exécution en parallèle
      this.log('⚡ Exécution en parallèle', 'info');
      const promises = this.options.features.map(feature => this.runSingleFeature(feature));
      const parallelResults = await Promise.allSettled(promises);
      
      parallelResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            feature: this.options.features[index],
            error: result.reason.message,
            summary: { total: 0, passed: 0, failed: 0, errors: 1 }
          });
        }
      });
    } else {
      // Exécution séquentielle
      this.log('🔄 Exécution séquentielle', 'info');
      for (const feature of this.options.features) {
        const result = await this.runSingleFeature(feature);
        results.push(result);
      }
    }
    
    return results;
  }

  async generateReports(results) {
    if (!this.options.generateReport) {
      this.log('📋 Génération de rapports désactivée', 'info');
      return null;
    }
    
    this.log('📊 Génération des rapports...', 'info');
    
    // Ajouter les résultats au générateur de rapport
    results.forEach(result => {
      this.reportGenerator.addFeatureResult(result);
    });
    
    try {
      const jsonReport = await this.reportGenerator.generateJSONReport();
      const htmlReport = await this.reportGenerator.generateHTMLReport();
      const summaryReport = await this.reportGenerator.generateSummaryReport();
      
      this.log(`✅ Rapport JSON généré: ${jsonReport}`, 'success');
      this.log(`✅ Rapport HTML généré: ${htmlReport}`, 'success');
      this.log(`✅ Résumé sauvé: ${summaryReport}`, 'success');
      
      return {
        json: jsonReport,
        html: htmlReport,
        summary: summaryReport
      };
      
    } catch (error) {
      this.log(`❌ Erreur lors de la génération des rapports: ${error.message}`, 'error');
      return null;
    }
  }

  async checkEnvironment() {
    this.log('🔍 Vérification de l\'environnement...', 'info');
    
    const envCheck = await TestHelpers.verifyEnvironment();
    const failedChecks = envCheck.checks.filter(c => c.status === 'FAIL');
    
    if (failedChecks.length > 0) {
      this.log('⚠️  Problèmes d\'environnement détectés:', 'warning');
      failedChecks.forEach(check => {
        this.log(`   - ${check.name}: ${check.details}`, 'warning');
      });
    } else {
      this.log('✅ Environnement validé', 'success');
    }
    
    return envCheck;
  }

  async cleanup() {
    if (!this.options.cleanup) return;
    
    this.log('🧹 Nettoyage des anciens rapports...', 'info');
    await TestHelpers.cleanupOldReports();
  }

  printSummary(results) {
    const totalDuration = Date.now() - this.startTime;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DE L\'EXÉCUTION DES TESTS');
    console.log('='.repeat(60));
    
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalErrors = 0;
    let totalSkipped = 0;
    
    results.forEach(result => {
      const summary = result.summary;
      totalTests += summary.total;
      totalPassed += summary.passed;
      totalFailed += summary.failed;
      totalErrors += summary.errors;
      totalSkipped += summary.skipped || 0;
      
      const status = summary.failed === 0 && summary.errors === 0 ? '✅' : '❌';
      console.log(`${status} ${result.feature}: ${summary.passed}/${summary.total} (${summary.failed} échecs, ${summary.errors} erreurs)`);
    });
    
    console.log('-'.repeat(60));
    console.log(`📈 Total: ${totalPassed}/${totalTests} tests réussis`);
    console.log(`⏱️  Durée: ${TestHelpers.formatDuration(totalDuration)}`);
    console.log(`📊 Taux de réussite: ${totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0}%`);
    
    if (totalFailed > 0) {
      console.log(`❌ Échecs: ${totalFailed}`);
    }
    
    if (totalErrors > 0) {
      console.log(`⚠️  Erreurs: ${totalErrors}`);
    }
    
    if (totalSkipped > 0) {
      console.log(`⏭️  Ignorés: ${totalSkipped}`);
    }
    
    console.log('='.repeat(60) + '\n');
    
    return {
      success: totalFailed === 0 && totalErrors === 0,
      totalTests,
      totalPassed,
      totalFailed,
      totalErrors,
      duration: totalDuration
    };
  }

  async run() {
    try {
      // Vérification de l'environnement
      await this.checkEnvironment();
      
      // Nettoyage préalable
      await this.cleanup();
      
      // Exécution des tests
      const results = await this.runAllFeatures();
      
      // Génération des rapports
      const reports = await this.generateReports(results);
      
      // Affichage du résumé
      const summary = this.printSummary(results);
      
      return {
        success: summary.success,
        results,
        reports,
        summary
      };
      
    } catch (error) {
      this.log(`❌ Erreur fatale: ${error.message}`, 'error');
      console.error(error.stack);
      
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = TestRunner;

// Exécution directe si appelé en tant que script
if (require.main === module) {
  const argv = process.argv.slice(2);
  const options = {};
  
  // Parser les arguments
  if (argv.includes('--parallel')) options.parallel = true;
  if (argv.includes('--no-report')) options.generateReport = false;
  if (argv.includes('--no-cleanup')) options.cleanup = false;
  if (argv.includes('--verbose')) options.verbose = true;
  
  // Features spécifiques
  const featureArg = argv.find(arg => arg.startsWith('--features='));
  if (featureArg) {
    options.features = featureArg.split('=')[1].split(',');
  }
  
  const runner = new TestRunner(options);
  
  runner.run().then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
}