/**
 * Détecteur de régressions visuelles
 * Compare les captures d'écran et détecte les changements visuels inattendus
 */

const fs = require('fs').promises;
const path = require('path');
const { createHash } = require('crypto');
const config = require('./config/test-config');

class VisualRegressionDetector {
  constructor() {
    this.baselineDir = path.join(process.cwd(), 'tests', 'baseline', 'screenshots');
    this.currentDir = path.join(process.cwd(), 'test-screenshots');
    this.diffDir = path.join(process.cwd(), 'test-artifacts', 'visual-diffs');
    this.threshold = config.visual?.threshold || 0.05; // 5% de différence par défaut
  }

  async init() {
    await fs.mkdir(this.baselineDir, { recursive: true });
    await fs.mkdir(this.currentDir, { recursive: true });
    await fs.mkdir(this.diffDir, { recursive: true });
  }

  /**
   * Calcule un hash simple d'une image pour détecter les changements
   */
  async calculateImageHash(imagePath) {
    try {
      const imageBuffer = await fs.readFile(imagePath);
      return createHash('md5').update(imageBuffer).digest('hex');
    } catch (error) {
      return null;
    }
  }

  /**
   * Compare les dimensions de deux images
   */
  async compareImageDimensions(path1, path2) {
    try {
      // Pour une comparaison simple, on compare les tailles de fichiers
      const stats1 = await fs.stat(path1);
      const stats2 = await fs.stat(path2);
      
      const sizeDiff = Math.abs(stats1.size - stats2.size) / Math.max(stats1.size, stats2.size);
      
      return {
        sizeDiff,
        baseline: stats1.size,
        current: stats2.size,
        changed: sizeDiff > this.threshold
      };
    } catch (error) {
      return {
        sizeDiff: 1,
        changed: true,
        error: error.message
      };
    }
  }

  /**
   * Trouve tous les screenshots actuels
   */
  async getCurrentScreenshots() {
    try {
      const files = await fs.readdir(this.currentDir);
      return files.filter(file => file.endsWith('.png') || file.endsWith('.jpg'));
    } catch (error) {
      return [];
    }
  }

  /**
   * Trouve tous les screenshots de baseline
   */
  async getBaselineScreenshots() {
    try {
      const files = await fs.readdir(this.baselineDir);
      return files.filter(file => file.endsWith('.png') || file.endsWith('.jpg'));
    } catch (error) {
      return [];
    }
  }

  /**
   * Compare un screenshot avec sa baseline
   */
  async compareScreenshot(filename) {
    const currentPath = path.join(this.currentDir, filename);
    const baselinePath = path.join(this.baselineDir, filename);
    
    // Vérifier si la baseline existe
    try {
      await fs.access(baselinePath);
    } catch (error) {
      return {
        type: 'new_screenshot',
        filename,
        status: 'NEW',
        message: 'Nouveau screenshot sans baseline'
      };
    }

    // Comparer les hashs
    const currentHash = await this.calculateImageHash(currentPath);
    const baselineHash = await this.calculateImageHash(baselinePath);

    if (!currentHash || !baselineHash) {
      return {
        type: 'error',
        filename,
        status: 'ERROR',
        message: 'Erreur lors de la lecture des images'
      };
    }

    if (currentHash === baselineHash) {
      return {
        type: 'identical',
        filename,
        status: 'PASS',
        message: 'Images identiques'
      };
    }

    // Comparer les dimensions/tailles
    const dimensionComparison = await this.compareImageDimensions(baselinePath, currentPath);

    if (dimensionComparison.changed) {
      return {
        type: 'visual_regression',
        filename,
        status: 'FAIL',
        message: `Changement visuel détecté (${Math.round(dimensionComparison.sizeDiff * 100)}% de différence)`,
        details: {
          baselineSize: dimensionComparison.baseline,
          currentSize: dimensionComparison.current,
          sizeDiff: dimensionComparison.sizeDiff,
          threshold: this.threshold
        }
      };
    }

    return {
      type: 'minor_change',
      filename,
      status: 'PASS',
      message: 'Changements mineurs dans les limites acceptables',
      details: {
        sizeDiff: dimensionComparison.sizeDiff,
        threshold: this.threshold
      }
    };
  }

  /**
   * Analyse complète des régressions visuelles
   */
  async analyzeVisualRegressions() {
    await this.init();

    const currentScreenshots = await this.getCurrentScreenshots();
    const baselineScreenshots = await this.getBaselineScreenshots();

    if (currentScreenshots.length === 0) {
      return {
        isBaseline: false,
        hasScreenshots: false,
        message: 'Aucun screenshot trouvé pour l\'analyse',
        comparisons: []
      };
    }

    if (baselineScreenshots.length === 0) {
      // Première exécution - créer la baseline
      await this.createBaseline(currentScreenshots);
      return {
        isBaseline: true,
        hasScreenshots: true,
        message: 'Baseline créée à partir des screenshots actuels',
        comparisons: currentScreenshots.map(filename => ({
          type: 'baseline_created',
          filename,
          status: 'BASELINE',
          message: 'Screenshot ajouté à la baseline'
        }))
      };
    }

    // Comparer chaque screenshot
    const comparisons = [];
    
    for (const filename of currentScreenshots) {
      const comparison = await this.compareScreenshot(filename);
      comparisons.push(comparison);
    }

    // Détecter les screenshots supprimés
    for (const filename of baselineScreenshots) {
      if (!currentScreenshots.includes(filename)) {
        comparisons.push({
          type: 'missing_screenshot',
          filename,
          status: 'MISSING',
          message: 'Screenshot présent dans la baseline mais absent de l\'exécution actuelle'
        });
      }
    }

    // Calculer les statistiques
    const stats = this.calculateVisualStats(comparisons);

    return {
      isBaseline: false,
      hasScreenshots: true,
      comparisons,
      stats,
      recommendation: this.generateVisualRecommendation(stats)
    };
  }

  /**
   * Calcule les statistiques des comparaisons visuelles
   */
  calculateVisualStats(comparisons) {
    return {
      total: comparisons.length,
      identical: comparisons.filter(c => c.status === 'PASS' && c.type === 'identical').length,
      minorChanges: comparisons.filter(c => c.status === 'PASS' && c.type === 'minor_change').length,
      regressions: comparisons.filter(c => c.status === 'FAIL').length,
      newScreenshots: comparisons.filter(c => c.type === 'new_screenshot').length,
      missingScreenshots: comparisons.filter(c => c.type === 'missing_screenshot').length,
      errors: comparisons.filter(c => c.status === 'ERROR').length
    };
  }

  /**
   * Génère une recommandation basée sur l'analyse visuelle
   */
  generateVisualRecommendation(stats) {
    if (stats.regressions === 0 && stats.errors === 0) {
      if (stats.newScreenshots > 0) {
        return `✅ Aucune régression visuelle. ${stats.newScreenshots} nouveau(x) screenshot(s) détecté(s).`;
      }
      return '✅ Aucune régression visuelle détectée. Interface stable.';
    }

    if (stats.regressions > 0) {
      const severity = stats.regressions > stats.total * 0.3 ? 'CRITIQUE' : 'ATTENTION';
      return `🚨 ${severity}: ${stats.regressions} régression(s) visuelle(s) détectée(s). Vérification manuelle recommandée.`;
    }

    if (stats.errors > 0) {
      return `⚠️ ${stats.errors} erreur(s) lors de la comparaison visuelle. Vérification nécessaire.`;
    }

    return '✅ Analyse visuelle terminée sans problème majeur.';
  }

  /**
   * Crée la baseline à partir des screenshots actuels
   */
  async createBaseline(screenshots) {
    for (const filename of screenshots) {
      const currentPath = path.join(this.currentDir, filename);
      const baselinePath = path.join(this.baselineDir, filename);
      
      try {
        await fs.copyFile(currentPath, baselinePath);
      } catch (error) {
        console.error(`Erreur lors de la copie de ${filename}:`, error.message);
      }
    }
  }

  /**
   * Met à jour la baseline avec les screenshots actuels
   */
  async updateBaseline() {
    const currentScreenshots = await this.getCurrentScreenshots();
    await this.createBaseline(currentScreenshots);
    console.log(`✅ Baseline visuelle mise à jour avec ${currentScreenshots.length} screenshot(s)`);
  }

  /**
   * Génère un rapport détaillé des comparaisons visuelles
   */
  async generateVisualReport(analysis) {
    const reportPath = path.join(this.diffDir, 'visual-regression-report.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      analysis,
      threshold: this.threshold,
      paths: {
        baseline: this.baselineDir,
        current: this.currentDir,
        diffs: this.diffDir
      }
    };

    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    return reportPath;
  }

  /**
   * Affiche un rapport visuel dans la console
   */
  printVisualReport(analysis) {
    console.log('\n' + '='.repeat(60));
    console.log('👁️  RAPPORT D\'ANALYSE VISUELLE');
    console.log('='.repeat(60));

    if (!analysis.hasScreenshots) {
      console.log('⚠️  Aucun screenshot trouvé pour l\'analyse');
      return;
    }

    if (analysis.isBaseline) {
      console.log('📋 Première exécution - Baseline visuelle créée');
      console.log(`   ${analysis.comparisons.length} screenshot(s) ajouté(s) à la baseline`);
      return;
    }

    const stats = analysis.stats;
    console.log(`📊 Analyse de ${stats.total} screenshot(s):`);
    console.log(`   ✅ Identiques: ${stats.identical}`);
    console.log(`   🔍 Changements mineurs: ${stats.minorChanges}`);
    console.log(`   🚨 Régressions: ${stats.regressions}`);
    console.log(`   ✨ Nouveaux: ${stats.newScreenshots}`);
    console.log(`   ❌ Manquants: ${stats.missingScreenshots}`);
    console.log(`   ⚠️  Erreurs: ${stats.errors}`);

    if (stats.regressions > 0) {
      console.log('\n🚨 Régressions visuelles détectées:');
      analysis.comparisons
        .filter(c => c.status === 'FAIL')
        .forEach(regression => {
          console.log(`   • ${regression.filename}: ${regression.message}`);
          if (regression.details) {
            console.log(`     Taille baseline: ${regression.details.baselineSize} bytes`);
            console.log(`     Taille actuelle: ${regression.details.currentSize} bytes`);
            console.log(`     Différence: ${Math.round(regression.details.sizeDiff * 100)}%`);
          }
        });
    }

    if (stats.newScreenshots > 0) {
      console.log('\n✨ Nouveaux screenshots:');
      analysis.comparisons
        .filter(c => c.type === 'new_screenshot')
        .forEach(newShot => {
          console.log(`   • ${newShot.filename}: ${newShot.message}`);
        });
    }

    console.log(`\n💡 Recommandation: ${analysis.recommendation}`);
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Nettoie les anciens screenshots et diffs
   */
  async cleanup(keepDays = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - keepDays);

    const dirs = [this.currentDir, this.diffDir];
    
    for (const dir of dirs) {
      try {
        const files = await fs.readdir(dir);
        
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime < cutoffDate) {
            await fs.unlink(filePath);
          }
        }
      } catch (error) {
        // Dossier n'existe pas ou autre erreur, ignorer
      }
    }
  }
}

module.exports = VisualRegressionDetector;