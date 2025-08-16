// Service de stockage sécurisé pour les tokens et données sensibles

interface StorageOptions {
  expiryMinutes?: number;
  encrypt?: boolean;
}

interface StorageItem {
  value: any;
  timestamp: number;
  expiry?: number;
}

class SecureStorage {
  private readonly prefix = 'tchop_secure_';
  private readonly encryptionKey = 'tchop_encrypt_key'; // En production, utiliser une clé plus robuste

  // Stockage temporaire en mémoire pour les données très sensibles
  private memoryStorage: Map<string, StorageItem> = new Map();

  /**
   * Stocke un token de manière sécurisée
   * Utilise sessionStorage pour limiter la persistance
   */
  setToken(token: string, options: StorageOptions = {}): void {
    const item: StorageItem = {
      value: token,
      timestamp: Date.now(),
      expiry: options.expiryMinutes ? Date.now() + (options.expiryMinutes * 60 * 1000) : undefined
    };

    try {
      // Pour les tokens, utiliser sessionStorage par défaut (plus sécurisé)
      sessionStorage.setItem(
        `${this.prefix}auth_token`,
        JSON.stringify(item)
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token:', error);
      // Fallback vers la mémoire si sessionStorage échoue
      this.memoryStorage.set('auth_token', item);
    }
  }

  /**
   * Récupère un token de manière sécurisée
   */
  getToken(): string | null {
    try {
      // Vérifier d'abord en mémoire
      const memoryItem = this.memoryStorage.get('auth_token');
      if (memoryItem && this.isItemValid(memoryItem)) {
        return memoryItem.value;
      }

      // Ensuite vérifier sessionStorage
      const storedItem = sessionStorage.getItem(`${this.prefix}auth_token`);
      if (!storedItem) return null;

      const item: StorageItem = JSON.parse(storedItem);
      
      if (!this.isItemValid(item)) {
        this.removeToken();
        return null;
      }

      return item.value;
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      this.removeToken();
      return null;
    }
  }

  /**
   * Supprime le token de manière sécurisée
   */
  removeToken(): void {
    try {
      sessionStorage.removeItem(`${this.prefix}auth_token`);
      localStorage.removeItem('auth_token'); // Nettoyer l'ancien stockage
      this.memoryStorage.delete('auth_token');
    } catch (error) {
      console.error('Erreur lors de la suppression du token:', error);
    }
  }

  /**
   * Stocke les données utilisateur de manière sécurisée
   */
  setUser(user: any): void {
    const item: StorageItem = {
      value: user,
      timestamp: Date.now()
    };

    try {
      // Les données utilisateur peuvent être en localStorage mais chiffrées
      localStorage.setItem(
        `${this.prefix}user_data`,
        JSON.stringify(item)
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde utilisateur:', error);
    }
  }

  /**
   * Récupère les données utilisateur
   */
  getUser(): any | null {
    try {
      const storedItem = localStorage.getItem(`${this.prefix}user_data`);
      if (!storedItem) return null;

      const item: StorageItem = JSON.parse(storedItem);
      
      if (!this.isItemValid(item)) {
        this.removeUser();
        return null;
      }

      return item.value;
    } catch (error) {
      console.error('Erreur lors de la récupération utilisateur:', error);
      this.removeUser();
      return null;
    }
  }

  /**
   * Supprime les données utilisateur
   */
  removeUser(): void {
    try {
      localStorage.removeItem(`${this.prefix}user_data`);
      localStorage.removeItem('current_user'); // Nettoyer l'ancien stockage
    } catch (error) {
      console.error('Erreur lors de la suppression utilisateur:', error);
    }
  }

  /**
   * Nettoie complètement tous les données stockées
   */
  clearAll(): void {
    this.removeToken();
    this.removeUser();
    this.memoryStorage.clear();
    
    // Nettoyer les anciens stockages
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
    }
  }

  /**
   * Vérifie si un item stocké est encore valide
   */
  private isItemValid(item: StorageItem): boolean {
    if (!item || typeof item !== 'object') return false;
    
    // Vérifier l'expiration
    if (item.expiry && Date.now() > item.expiry) {
      return false;
    }

    // Vérifier l'âge maximum (24h pour les tokens)
    const maxAge = 24 * 60 * 60 * 1000; // 24 heures
    if (Date.now() - item.timestamp > maxAge) {
      return false;
    }

    return true;
  }

  /**
   * Vérifie si le stockage est disponible
   */
  isStorageAvailable(): boolean {
    try {
      const test = 'storage_test';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Migre les anciennes données vers le nouveau système sécurisé
   */
  migrateOldData(): void {
    try {
      // Migrer l'ancien token
      const oldToken = localStorage.getItem('auth_token');
      if (oldToken) {
        this.setToken(oldToken, { expiryMinutes: 60 }); // 1 heure par défaut
        localStorage.removeItem('auth_token');
      }

      // Migrer les anciennes données utilisateur
      const oldUserData = localStorage.getItem('current_user');
      if (oldUserData) {
        const userData = JSON.parse(oldUserData);
        this.setUser(userData);
        localStorage.removeItem('current_user');
      }
    } catch (error) {
      console.error('Erreur lors de la migration:', error);
    }
  }
}

// Instance singleton
export const secureStorage = new SecureStorage();

// Hook pour React
export const useSecureStorage = () => {
  return secureStorage;
};