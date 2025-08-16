/**
 * Pipeline CI/CD pour les tests automatiques
 * Script d'intégration continue pour GitHub Actions / autres CI
 */

const fs = require('fs').promises;
const path = require('path');
const TestRunner = require('./test-runner');
const RegressionDetector = require('./regression-detector');

class CIPipeline {
  constructor() {
    this.environment = process.env.NODE_ENV || 'ci';
    this.isCI = process.env.CI === 'true';
    this.branch = process.env.GITHUB_REF_NAME || process.env.BRANCH_NAME || 'unknown';
    this.commit = process.env.GITHUB_SHA || process.env.COMMIT_SHA || 'unknown';
    this.pullRequest = process.env.GITHUB_EVENT_NAME === 'pull_request';
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = this.isCI ? '::' : '';
    
    switch (level) {
      case 'error':
        console.log(`${prefix}error::${message}`);
        break;
      case 'warning':
        console.log(`${prefix}warning::${message}`);
        break;
      case 'notice':
        console.log(`${prefix}notice::${message}`);
        break;
      default:
        console.log(`[${timestamp}] ${message}`);
    }
  }

  async checkEnvironment() {
    this.log('🔧 Vérification de l\'environnement CI...');
    
    const checks = [
      { name: 'Node.js', check: () => process.version, required: true },
      { name: 'NPM', check: () => process.env.npm_version, required: true },
      { name: 'Git Branch', check: () => this.branch, required: false },
      { name: 'Commit SHA', check: () => this.commit.substring(0, 8), required: false }
    ];

    checks.forEach(check => {
      const value = check.check();
      if (value) {
        this.log(`✅ ${check.name}: ${value}`);
      } else if (check.required) {
        this.log(`❌ ${check.name}: Non disponible`, 'error');
        throw new Error(`${check.name} requis pour l'exécution CI`);
      } else {
        this.log(`⚠️  ${check.name}: Non disponible`, 'warning');
      }
    });
  }

  async runTests() {
    this.log('🧪 Exécution des tests E2E...');
    
    const runner = new TestRunner({
      parallel: this.isCI, // Parallèle en CI pour plus de rapidité
      generateReport: true,
      verbose: !this.isCI, // Moins verbose en CI
      cleanup: true
    });

    const results = await runner.run();
    
    if (!results.success) {
      this.log('❌ Tests E2E échoués', 'error');
      throw new Error(`${results.summary.totalFailed} tests échoués, ${results.summary.totalErrors} erreurs`);
    }

    this.log(`✅ Tests E2E réussis: ${results.summary.totalPassed}/${results.summary.totalTests}`);
    return results;
  }

  async analyzeRegressions(testResults) {
    this.log('🔍 Analyse des régressions...');
    
    const detector = new RegressionDetector();
    detector.setCurrentResults({
      metadata: {
        generatedAt: new Date().toISOString(),
        environment: this.environment,
        branch: this.branch,
        commit: this.commit,
        ci: this.isCI
      },
      features: testResults.results,
      summary: testResults.summary
    });

    const analysis = await detector.analyzeRegressions();
    
    if (analysis.isBaseline) {
      this.log('📋 Première exécution - baseline créée');
      return analysis;
    }

    const highRegressions = analysis.regressions.filter(r => r.severity === 'high').length;
    const functionalRegressions = analysis.regressions.filter(r => r.type === 'functional').length;

    if (functionalRegressions > 0) {
      this.log(`🚨 ${functionalRegressions} régression(s) fonctionnelle(s) détectée(s)`, 'error');
    }

    if (highRegressions > 0) {
      this.log(`⚠️  ${highRegressions} régression(s) critique(s) détectée(s)`, 'warning');
    }

    if (analysis.regressions.length === 0) {
      this.log('✅ Aucune régression détectée');
    }

    return analysis;
  }

  async generateArtifacts(testResults, regressionAnalysis) {
    this.log('📦 Génération des artefacts CI...');
    
    const artifactsDir = path.join(process.cwd(), 'test-artifacts');
    await fs.mkdir(artifactsDir, { recursive: true });

    // 1. Résumé JSON pour les outils CI
    const ciSummary = {
      timestamp: new Date().toISOString(),
      environment: this.environment,
      branch: this.branch,
      commit: this.commit,
      tests: {
        total: testResults.summary.totalTests,
        passed: testResults.summary.totalPassed,
        failed: testResults.summary.totalFailed,
        errors: testResults.summary.totalErrors,
        successRate: Math.round((testResults.summary.totalPassed / testResults.summary.totalTests) * 100)
      },
      regressions: {
        total: regressionAnalysis.regressions?.length || 0,
        high: regressionAnalysis.regressions?.filter(r => r.severity === 'high').length || 0,
        functional: regressionAnalysis.regressions?.filter(r => r.type === 'functional').length || 0
      },
      recommendation: this.getDeploymentRecommendation(regressionAnalysis),
      features: testResults.results.map(feature => ({
        name: feature.feature,
        passed: feature.summary.passed,
        failed: feature.summary.failed,
        errors: feature.summary.errors
      }))
    };

    const summaryPath = path.join(artifactsDir, 'ci-summary.json');
    await fs.writeFile(summaryPath, JSON.stringify(ciSummary, null, 2));

    // 2. Badge de statut (pour README)
    const badgeColor = ciSummary.tests.successRate >= 90 ? 'brightgreen' : 
                      ciSummary.tests.successRate >= 70 ? 'yellow' : 'red';
    const badgeText = `${ciSummary.tests.successRate}%25%20pass`;
    const badgeUrl = `https://img.shields.io/badge/tests-${badgeText}-${badgeColor}`;
    
    await fs.writeFile(path.join(artifactsDir, 'test-badge.md'), 
      `![Test Status](${badgeUrl})`);

    // 3. Rapport Markdown pour PR
    if (this.pullRequest) {
      const prReport = this.generatePRReport(ciSummary, regressionAnalysis);
      await fs.writeFile(path.join(artifactsDir, 'pr-report.md'), prReport);
    }

    this.log(`✅ Artefacts générés dans ${artifactsDir}`);
    return artifactsDir;
  }

  generatePRReport(summary, regressionAnalysis) {
    const successIcon = summary.tests.successRate >= 90 ? '✅' : 
                       summary.tests.successRate >= 70 ? '⚠️' : '❌';
    
    let report = `## ${successIcon} Rapport de Tests E2E\n\n`;
    
    report += `**Résumé:** ${summary.tests.passed}/${summary.tests.total} tests réussis (${summary.tests.successRate}%)\n\n`;
    
    if (summary.tests.failed > 0 || summary.tests.errors > 0) {
      report += `⚠️ **Attention:** ${summary.tests.failed} échecs, ${summary.tests.errors} erreurs\n\n`;
    }

    // Régressions
    if (regressionAnalysis.regressions?.length > 0) {
      report += `### 🔍 Régressions Détectées (${regressionAnalysis.regressions.length})\n\n`;
      
      regressionAnalysis.regressions.forEach(reg => {
        const icon = reg.severity === 'high' ? '🚨' : '⚠️';
        report += `- ${icon} **${reg.feature}** - ${reg.test}\n`;
        report += `  - Type: ${reg.type}\n`;
        report += `  - Sévérité: ${reg.severity}\n\n`;
      });
    }

    // Tests par fonctionnalité
    report += `### 📊 Détail par Fonctionnalité\n\n`;
    summary.features.forEach(feature => {
      const icon = feature.failed === 0 && feature.errors === 0 ? '✅' : '❌';
      report += `- ${icon} **${feature.name}**: ${feature.passed}/${feature.passed + feature.failed + feature.errors} tests\n`;
    });

    // Recommandation
    report += `\n### 💡 Recommandation\n\n`;
    switch (summary.recommendation) {
      case 'BLOCK':
        report += '🚨 **DÉPLOIEMENT BLOQUÉ** - Régressions critiques détectées';
        break;
      case 'CAUTION':
        report += '⚠️ **DÉPLOIEMENT AVEC PRUDENCE** - Régressions mineures détectées';
        break;
      case 'PROCEED':
        report += '✅ **DÉPLOIEMENT AUTORISÉ** - Aucune régression détectée';
        break;
      default:
        report += '📋 **PREMIÈRE EXÉCUTION** - Baseline créée';
    }

    return report;
  }

  getDeploymentRecommendation(regressionAnalysis) {
    if (regressionAnalysis.isBaseline) return 'BASELINE';
    
    const hasHighSeverity = regressionAnalysis.regressions?.some(r => r.severity === 'high');
    const hasFunctional = regressionAnalysis.regressions?.some(r => r.type === 'functional');
    
    if (hasHighSeverity || hasFunctional) return 'BLOCK';
    if (regressionAnalysis.regressions?.length > 0) return 'CAUTION';
    return 'PROCEED';
  }

  async run() {
    try {
      this.log('🚀 Démarrage du pipeline CI - TchopMyGrinds');
      this.log(`Branch: ${this.branch} | Commit: ${this.commit.substring(0, 8)}`);
      
      // 1. Vérification environnement
      await this.checkEnvironment();
      
      // 2. Exécution des tests
      const testResults = await this.runTests();
      
      // 3. Analyse des régressions
      const regressionAnalysis = await this.analyzeRegressions(testResults);
      
      // 4. Génération des artefacts
      const artifactsDir = await this.generateArtifacts(testResults, regressionAnalysis);
      
      // 5. Décision finale
      const recommendation = this.getDeploymentRecommendation(regressionAnalysis);
      const success = recommendation !== 'BLOCK';
      
      this.log(`🏁 Pipeline terminé: ${success ? 'SUCCÈS' : 'ÉCHEC'}`);
      this.log(`Recommandation: ${recommendation}`);
      
      if (this.isCI) {
        // Output pour GitHub Actions
        console.log(`::set-output name=success::${success}`);
        console.log(`::set-output name=recommendation::${recommendation}`);
        console.log(`::set-output name=artifacts::${artifactsDir}`);
      }
      
      return {
        success,
        recommendation,
        testResults,
        regressionAnalysis,
        artifactsDir
      };
      
    } catch (error) {
      this.log(`❌ Pipeline échoué: ${error.message}`, 'error');
      
      if (this.isCI) {
        console.log(`::set-output name=success::false`);
        console.log(`::set-output name=error::${error.message}`);
      }
      
      throw error;
    }
  }
}

// Exécution en tant que script
if (require.main === module) {
  const pipeline = new CIPipeline();
  
  pipeline.run().then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Erreur fatale du pipeline:', error);
    process.exit(1);
  });
}

module.exports = CIPipeline;