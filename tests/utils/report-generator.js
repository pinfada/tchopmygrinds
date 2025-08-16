/**
 * Générateur de rapports pour les tests E2E
 * Crée des rapports HTML et JSON détaillés
 */

const fs = require('fs').promises;
const path = require('path');
const config = require('../config/test-config');

class ReportGenerator {
  constructor() {
    this.reportData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        testSuite: 'TchopMyGrinds E2E Tests'
      },
      features: [],
      summary: {
        totalTests: 0,
        totalPassed: 0,
        totalFailed: 0,
        totalErrors: 0,
        totalSkipped: 0,
        successRate: 0,
        duration: 0
      },
      performance: {
        slowestTest: null,
        fastestTest: null,
        averageDuration: 0
      },
      regressions: [],
      recommendations: []
    };
  }

  addFeatureResult(featureResult) {
    this.reportData.features.push(featureResult);
    this.updateSummary();
  }

  updateSummary() {
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalErrors = 0;
    let totalSkipped = 0;
    let totalDuration = 0;

    this.reportData.features.forEach(feature => {
      totalTests += feature.summary.total;
      totalPassed += feature.summary.passed;
      totalFailed += feature.summary.failed;
      totalErrors += feature.summary.errors;
      totalSkipped += feature.summary.skipped || 0;

      // Calculer la durée totale des tests
      feature.results.forEach(result => {
        if (result.duration) totalDuration += result.duration;
      });
    });

    this.reportData.summary = {
      totalTests,
      totalPassed,
      totalFailed,
      totalErrors,
      totalSkipped,
      successRate: totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0,
      duration: totalDuration
    };

    this.updatePerformanceMetrics();
    this.detectRegressions();
    this.generateRecommendations();
  }

  updatePerformanceMetrics() {
    const allTests = this.reportData.features.flatMap(f => f.results);
    const testsWithDuration = allTests.filter(t => t.duration);

    if (testsWithDuration.length > 0) {
      const slowest = testsWithDuration.reduce((a, b) => a.duration > b.duration ? a : b);
      const fastest = testsWithDuration.reduce((a, b) => a.duration < b.duration ? a : b);
      const avgDuration = testsWithDuration.reduce((sum, t) => sum + t.duration, 0) / testsWithDuration.length;

      this.reportData.performance = {
        slowestTest: { name: slowest.test, duration: slowest.duration },
        fastestTest: { name: fastest.test, duration: fastest.duration },
        averageDuration: Math.round(avgDuration)
      };
    }
  }

  detectRegressions() {
    this.reportData.regressions = [];

    this.reportData.features.forEach(feature => {
      feature.results.forEach(result => {
        // Détecter les régressions potentielles
        if (result.status === 'FAIL' && result.test.includes('Critical')) {
          this.reportData.regressions.push({
            feature: feature.feature,
            test: result.test,
            type: 'Critical Failure',
            impact: 'High'
          });
        }

        if (result.duration && result.duration > config.performance.maxPageLoadTime) {
          this.reportData.regressions.push({
            feature: feature.feature,
            test: result.test,
            type: 'Performance Regression',
            impact: 'Medium',
            details: `Duration: ${result.duration}ms (max: ${config.performance.maxPageLoadTime}ms)`
          });
        }

        if (result.status === 'ERROR') {
          this.reportData.regressions.push({
            feature: feature.feature,
            test: result.test,
            type: 'Test Error',
            impact: 'Medium',
            details: result.error
          });
        }
      });
    });
  }

  generateRecommendations() {
    this.reportData.recommendations = [];

    const { summary } = this.reportData;

    if (summary.successRate < 70) {
      this.reportData.recommendations.push({
        type: 'Quality',
        priority: 'High',
        message: `Taux de réussite faible (${summary.successRate}%). Réviser les fonctionnalités critiques.`
      });
    }

    if (summary.totalErrors > 0) {
      this.reportData.recommendations.push({
        type: 'Stability',
        priority: 'High',
        message: `${summary.totalErrors} erreurs détectées. Vérifier la stabilité de l'environnement.`
      });
    }

    if (this.reportData.performance.averageDuration > config.performance.maxPageLoadTime) {
      this.reportData.recommendations.push({
        type: 'Performance',
        priority: 'Medium',
        message: `Performance dégradée (moyenne: ${this.reportData.performance.averageDuration}ms). Optimiser le chargement.`
      });
    }

    if (summary.totalSkipped > summary.totalTests * 0.2) {
      this.reportData.recommendations.push({
        type: 'Coverage',
        priority: 'Medium',
        message: `Beaucoup de tests ignorés (${summary.totalSkipped}). Vérifier la configuration.`
      });
    }

    // Recommandations positives
    if (summary.successRate >= 90) {
      this.reportData.recommendations.push({
        type: 'Quality',
        priority: 'Info',
        message: '🎉 Excellent taux de réussite ! Système stable.'
      });
    }
  }

  async generateJSONReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `test-report-${timestamp}.json`;
    const filepath = path.join(config.reports.outputDir, filename);

    await fs.mkdir(config.reports.outputDir, { recursive: true });
    await fs.writeFile(filepath, JSON.stringify(this.reportData, null, 2));

    return filepath;
  }

  async generateHTMLReport() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `test-report-${timestamp}.html`;
    const filepath = path.join(config.reports.outputDir, filename);

    const html = this.createHTMLTemplate();
    
    await fs.mkdir(config.reports.outputDir, { recursive: true });
    await fs.writeFile(filepath, html);

    return filepath;
  }

  createHTMLTemplate() {
    const { reportData } = this;
    
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport de Tests E2E - TchopMyGrinds</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: white; padding: 30px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header h1 { color: #2563eb; margin-bottom: 10px; }
        .meta { color: #666; font-size: 14px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .stat-number { font-size: 2.5em; font-weight: bold; margin-bottom: 10px; }
        .stat-label { color: #666; font-size: 14px; }
        .pass { color: #10b981; }
        .fail { color: #ef4444; }
        .error { color: #f59e0b; }
        .skip { color: #6b7280; }
        .features { display: grid; gap: 20px; }
        .feature { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .feature-header { padding: 20px; background: #f8fafc; border-bottom: 1px solid #e5e7eb; }
        .feature-title { font-size: 1.2em; font-weight: bold; margin-bottom: 10px; }
        .feature-summary { display: flex; gap: 20px; font-size: 14px; }
        .test-list { padding: 0; }
        .test-item { padding: 15px 20px; border-bottom: 1px solid #f1f1f1; display: flex; justify-content: between; align-items: center; }
        .test-item:last-child { border-bottom: none; }
        .test-name { flex: 1; }
        .test-status { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .status-pass { background: #d1fae5; color: #065f46; }
        .status-fail { background: #fee2e2; color: #991b1b; }
        .status-error { background: #fef3c7; color: #92400e; }
        .status-skip { background: #f3f4f6; color: #374151; }
        .recommendations { background: white; padding: 20px; border-radius: 8px; margin-top: 20px; }
        .recommendation { padding: 10px; margin: 10px 0; border-left: 4px solid; border-radius: 4px; }
        .rec-high { background: #fef2f2; border-color: #ef4444; }
        .rec-medium { background: #fffbeb; border-color: #f59e0b; }
        .rec-info { background: #f0fdf4; border-color: #10b981; }
        .progress-bar { width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; margin: 10px 0; }
        .progress-fill { height: 100%; transition: width 0.3s ease; }
        .regressions { background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .regression { background: white; padding: 10px; margin: 10px 0; border-radius: 4px; border-left: 4px solid #ef4444; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 ${reportData.metadata.testSuite}</h1>
            <div class="meta">
                <p>Généré le ${new Date(reportData.metadata.generatedAt).toLocaleString('fr-FR')}</p>
                <p>Environnement: ${reportData.metadata.environment} | Version: ${reportData.metadata.version}</p>
            </div>
        </div>

        <div class="summary">
            <div class="stat-card">
                <div class="stat-number">${reportData.summary.totalTests}</div>
                <div class="stat-label">Tests Total</div>
            </div>
            <div class="stat-card">
                <div class="stat-number pass">${reportData.summary.totalPassed}</div>
                <div class="stat-label">Réussis</div>
            </div>
            <div class="stat-card">
                <div class="stat-number fail">${reportData.summary.totalFailed}</div>
                <div class="stat-label">Échoués</div>
            </div>
            <div class="stat-card">
                <div class="stat-number error">${reportData.summary.totalErrors}</div>
                <div class="stat-label">Erreurs</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${reportData.summary.successRate}%</div>
                <div class="stat-label">Taux de Réussite</div>
                <div class="progress-bar">
                    <div class="progress-fill pass" style="width: ${reportData.summary.successRate}%"></div>
                </div>
            </div>
        </div>

        ${reportData.regressions.length > 0 ? `
        <div class="regressions">
            <h2>⚠️ Régressions Détectées (${reportData.regressions.length})</h2>
            ${reportData.regressions.map(reg => `
                <div class="regression">
                    <strong>${reg.feature} - ${reg.test}</strong><br>
                    <span style="color: #666;">Type: ${reg.type} | Impact: ${reg.impact}</span>
                    ${reg.details ? `<br><small>${reg.details}</small>` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}

        <div class="features">
            ${reportData.features.map(feature => `
                <div class="feature">
                    <div class="feature-header">
                        <div class="feature-title">${feature.feature}</div>
                        <div class="feature-summary">
                            <span class="pass">✅ ${feature.summary.passed}</span>
                            <span class="fail">❌ ${feature.summary.failed}</span>
                            <span class="error">⚠️ ${feature.summary.errors}</span>
                            ${feature.summary.skipped ? `<span class="skip">⏭️ ${feature.summary.skipped}</span>` : ''}
                        </div>
                    </div>
                    <div class="test-list">
                        ${feature.results.map(test => `
                            <div class="test-item">
                                <div class="test-name">${test.test}</div>
                                <div class="test-status status-${test.status.toLowerCase()}">${test.status}</div>
                                ${test.duration ? `<div style="font-size: 12px; color: #666; margin-left: 10px;">${test.duration}ms</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>

        ${reportData.recommendations.length > 0 ? `
        <div class="recommendations">
            <h2>💡 Recommandations</h2>
            ${reportData.recommendations.map(rec => `
                <div class="recommendation rec-${rec.priority.toLowerCase()}">
                    <strong>${rec.type}</strong>: ${rec.message}
                </div>
            `).join('')}
        </div>
        ` : ''}

        <div style="margin-top: 40px; text-align: center; color: #666; font-size: 14px;">
            <p>Rapport généré automatiquement par le système de tests TchopMyGrinds</p>
        </div>
    </div>
</body>
</html>`;
  }

  async generateSummaryReport() {
    const summaryFile = path.join(config.reports.outputDir, 'latest-summary.json');
    const summary = {
      lastRun: this.reportData.metadata.generatedAt,
      summary: this.reportData.summary,
      regressions: this.reportData.regressions.length,
      recommendations: this.reportData.recommendations.length,
      features: this.reportData.features.map(f => ({
        name: f.feature,
        passed: f.summary.passed,
        failed: f.summary.failed,
        errors: f.summary.errors
      }))
    };

    await fs.writeFile(summaryFile, JSON.stringify(summary, null, 2));
    return summaryFile;
  }

  static async comparePreviousRun() {
    try {
      const summaryFile = path.join(config.reports.outputDir, 'latest-summary.json');
      const previousData = JSON.parse(await fs.readFile(summaryFile, 'utf8'));
      
      return {
        hasPreviousRun: true,
        previousRun: previousData
      };
    } catch (error) {
      return {
        hasPreviousRun: false,
        message: 'Aucune exécution précédente trouvée'
      };
    }
  }

  static formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}min`;
  }
}

module.exports = ReportGenerator;