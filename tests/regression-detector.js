/**
 * Détecteur de régressions
 * Compare les résultats des tests avec les exécutions précédentes
 */

const fs = require('fs').promises;
const path = require('path');
const config = require('./config/test-config');

class RegressionDetector {
  constructor() {
    this.baselineFile = path.join(config.reports.outputDir, 'baseline.json');
    this.currentResults = null;
    this.baselineResults = null;
    this.regressions = [];
  }

  async loadBaseline() {
    try {
      const data = await fs.readFile(this.baselineFile, 'utf8');
      this.baselineResults = JSON.parse(data);
      return true;
    } catch (error) {
      console.log('⚠️  Aucune baseline trouvée. Première exécution?');
      return false;
    }
  }

  async saveBaseline(results) {
    await fs.mkdir(config.reports.outputDir, { recursive: true });
    await fs.writeFile(this.baselineFile, JSON.stringify(results, null, 2));
    console.log('✅ Baseline sauvegardée');
  }

  setCurrentResults(results) {
    this.currentResults = results;
  }

  detectPerformanceRegressions() {
    if (!this.baselineResults || !this.currentResults) return [];

    const performanceRegressions = [];

    this.currentResults.features.forEach(currentFeature => {
      const baselineFeature = this.baselineResults.features.find(f => f.feature === currentFeature.feature);
      if (!baselineFeature) return;

      currentFeature.results.forEach(currentTest => {
        const baselineTest = baselineFeature.results.find(t => t.test === currentTest.test);
        if (!baselineTest || !currentTest.duration || !baselineTest.duration) return;

        // Seuil de régression : +50% de temps d'exécution
        const regressionThreshold = baselineTest.duration * 1.5;
        
        if (currentTest.duration > regressionThreshold) {
          performanceRegressions.push({
            type: 'performance',
            feature: currentFeature.feature,
            test: currentTest.test,
            baselineDuration: baselineTest.duration,
            currentDuration: currentTest.duration,
            regression: Math.round(((currentTest.duration - baselineTest.duration) / baselineTest.duration) * 100),
            severity: currentTest.duration > baselineTest.duration * 2 ? 'high' : 'medium'
          });
        }
      });
    });

    return performanceRegressions;
  }

  detectFunctionalRegressions() {
    if (!this.baselineResults || !this.currentResults) return [];

    const functionalRegressions = [];

    this.currentResults.features.forEach(currentFeature => {
      const baselineFeature = this.baselineResults.features.find(f => f.feature === currentFeature.feature);
      if (!baselineFeature) return;

      currentFeature.results.forEach(currentTest => {
        const baselineTest = baselineFeature.results.find(t => t.test === currentTest.test);
        if (!baselineTest) return;

        // Détection de régression fonctionnelle
        if (baselineTest.status === 'PASS' && currentTest.status !== 'PASS') {
          functionalRegressions.push({
            type: 'functional',
            feature: currentFeature.feature,
            test: currentTest.test,
            baselineStatus: baselineTest.status,
            currentStatus: currentTest.status,
            error: currentTest.error || 'Test qui réussissait maintenant échoue',
            severity: 'high'
          });
        }

        // Nouveau test qui échoue
        if (!baselineTest && currentTest.status !== 'PASS') {
          functionalRegressions.push({
            type: 'new_failure',
            feature: currentFeature.feature,
            test: currentTest.test,
            status: currentTest.status,
            error: currentTest.error || 'Nouveau test qui échoue',
            severity: 'medium'
          });
        }
      });
    });

    return functionalRegressions;
  }

  detectCoverageRegressions() {
    if (!this.baselineResults || !this.currentResults) return [];

    const coverageRegressions = [];

    // Comparer le nombre total de tests
    const baselineTotal = this.baselineResults.summary.totalTests;
    const currentTotal = this.currentResults.summary.totalTests;

    if (currentTotal < baselineTotal) {
      coverageRegressions.push({
        type: 'coverage',
        description: 'Diminution du nombre de tests',
        baselineCount: baselineTotal,
        currentCount: currentTotal,
        difference: baselineTotal - currentTotal,
        severity: 'medium'
      });
    }

    // Comparer le taux de réussite global
    const baselineSuccessRate = this.baselineResults.summary.successRate;
    const currentSuccessRate = this.currentResults.summary.successRate;

    if (currentSuccessRate < baselineSuccessRate - 10) { // Seuil de 10%
      coverageRegressions.push({
        type: 'success_rate',
        description: 'Diminution significative du taux de réussite',
        baselineRate: baselineSuccessRate,
        currentRate: currentSuccessRate,
        difference: baselineSuccessRate - currentSuccessRate,
        severity: currentSuccessRate < baselineSuccessRate - 20 ? 'high' : 'medium'
      });
    }

    return coverageRegressions;
  }

  detectNewTests() {
    if (!this.baselineResults || !this.currentResults) return [];

    const newTests = [];

    this.currentResults.features.forEach(currentFeature => {
      const baselineFeature = this.baselineResults.features.find(f => f.feature === currentFeature.feature);
      
      currentFeature.results.forEach(currentTest => {
        const isNewTest = !baselineFeature || 
                         !baselineFeature.results.find(t => t.test === currentTest.test);
        
        if (isNewTest) {
          newTests.push({
            type: 'new_test',
            feature: currentFeature.feature,
            test: currentTest.test,
            status: currentTest.status,
            severity: 'info'
          });
        }
      });
    });

    return newTests;
  }

  async analyzeRegressions() {
    if (!this.currentResults) {
      throw new Error('Aucun résultat actuel fourni pour l\'analyse');
    }

    const hasBaseline = await this.loadBaseline();
    
    if (!hasBaseline) {
      console.log('📋 Première exécution - création de la baseline');
      await this.saveBaseline(this.currentResults);
      return {
        isBaseline: true,
        regressions: [],
        newTests: [],
        summary: 'Baseline créée avec succès'
      };
    }

    console.log('🔍 Analyse des régressions...');

    const performanceRegressions = this.detectPerformanceRegressions();
    const functionalRegressions = this.detectFunctionalRegressions();
    const coverageRegressions = this.detectCoverageRegressions();
    const newTests = this.detectNewTests();

    const allRegressions = [
      ...performanceRegressions,
      ...functionalRegressions,
      ...coverageRegressions
    ];

    // Calculer les métriques
    const highSeverityCount = allRegressions.filter(r => r.severity === 'high').length;
    const mediumSeverityCount = allRegressions.filter(r => r.severity === 'medium').length;

    const analysis = {
      isBaseline: false,
      regressions: allRegressions,
      newTests,
      summary: {
        totalRegressions: allRegressions.length,
        highSeverity: highSeverityCount,
        mediumSeverity: mediumSeverityCount,
        newTestsCount: newTests.length,
        recommendation: this.generateRecommendation(allRegressions, newTests)
      },
      comparison: {
        baseline: {
          timestamp: this.baselineResults.metadata.generatedAt,
          totalTests: this.baselineResults.summary.totalTests,
          successRate: this.baselineResults.summary.successRate
        },
        current: {
          timestamp: this.currentResults.metadata.generatedAt,
          totalTests: this.currentResults.summary.totalTests,
          successRate: this.currentResults.summary.successRate
        }
      }
    };

    return analysis;
  }

  generateRecommendation(regressions, newTests) {
    if (regressions.length === 0) {
      return newTests.length > 0 
        ? '✅ Aucune régression détectée. Nouveaux tests ajoutés avec succès.'
        : '✅ Aucune régression détectée. Système stable.';
    }

    const highSeverity = regressions.filter(r => r.severity === 'high').length;
    const functionalRegressions = regressions.filter(r => r.type === 'functional').length;
    const performanceRegressions = regressions.filter(r => r.type === 'performance').length;

    if (highSeverity > 0) {
      if (functionalRegressions > 0) {
        return '🚨 CRITIQUE: Régressions fonctionnelles détectées. Ne pas déployer en production.';
      }
      return '⚠️  ATTENTION: Régressions critiques détectées. Révision nécessaire avant déploiement.';
    }

    if (performanceRegressions > 0) {
      return '📉 Régressions de performance détectées. Optimisation recommandée.';
    }

    return '⚠️  Régressions mineures détectées. Surveillance recommandée.';
  }

  async updateBaseline() {
    if (this.currentResults) {
      await this.saveBaseline(this.currentResults);
      console.log('✅ Baseline mise à jour');
    }
  }

  printRegressionReport(analysis) {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 RAPPORT D\'ANALYSE DES RÉGRESSIONS');
    console.log('='.repeat(60));

    if (analysis.isBaseline) {
      console.log('📋 Première exécution - Baseline créée');
      return;
    }

    console.log(`📊 Comparaison avec baseline du ${new Date(analysis.comparison.baseline.timestamp).toLocaleDateString('fr-FR')}`);
    console.log(`   Tests: ${analysis.comparison.baseline.totalTests} → ${analysis.comparison.current.totalTests}`);
    console.log(`   Taux de réussite: ${analysis.comparison.baseline.successRate}% → ${analysis.comparison.current.successRate}%`);

    if (analysis.regressions.length === 0) {
      console.log('\n✅ Aucune régression détectée !');
    } else {
      console.log(`\n⚠️  ${analysis.regressions.length} régression(s) détectée(s):`);
      
      analysis.regressions.forEach(regression => {
        const severityIcon = regression.severity === 'high' ? '🚨' : '⚠️';
        console.log(`   ${severityIcon} [${regression.type.toUpperCase()}] ${regression.feature} - ${regression.test}`);
        
        if (regression.type === 'performance') {
          console.log(`       Durée: ${regression.baselineDuration}ms → ${regression.currentDuration}ms (+${regression.regression}%)`);
        } else if (regression.type === 'functional') {
          console.log(`       Statut: ${regression.baselineStatus} → ${regression.currentStatus}`);
        }
      });
    }

    if (analysis.newTests.length > 0) {
      console.log(`\n✨ ${analysis.newTests.length} nouveau(x) test(s) ajouté(s):`);
      analysis.newTests.forEach(test => {
        const statusIcon = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
        console.log(`   ${statusIcon} ${test.feature} - ${test.test}`);
      });
    }

    console.log(`\n💡 Recommandation: ${analysis.summary.recommendation}`);
    console.log('='.repeat(60) + '\n');
  }
}

module.exports = RegressionDetector;