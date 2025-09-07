// src/services/storageService.js
/**
 * Wrapper around localStorage with error handling and data validation
 */

export const storageService = {
  /**
   * Store data in localStorage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   */
  set(key, value) {
    try {
      const serialized = JSON.stringify({
        data: value,
        timestamp: Date.now(),
        version: "1.0",
      });
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Failed to store ${key}:`, error);
      // Handle quota exceeded error
      if (error.name === "QuotaExceededError") {
        this.cleanup();
        // Try again after cleanup
        try {
          const serialized = JSON.stringify({
            data: value,
            timestamp: Date.now(),
            version: "1.0",
          });
          localStorage.setItem(key, serialized);
        } catch (retryError) {
          console.error(`Failed to store ${key} after cleanup:`, retryError);
        }
      }
    }
  },

  /**
   * Retrieve data from localStorage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} Stored value or default
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;

      const parsed = JSON.parse(item);

      // Handle legacy data without wrapper
      if (parsed && typeof parsed === "object" && "data" in parsed) {
        return parsed.data;
      }

      // Return raw data for backwards compatibility
      return parsed;
    } catch (error) {
      console.error(`Failed to retrieve ${key}:`, error);
      return defaultValue;
    }
  },

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
    }
  },

  /**
   * Clear all application data
   */
  clear() {
    try {
      const appKeys = this.getAppKeys();
      appKeys.forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error("Failed to clear storage:", error);
    }
  },

  /**
   * Get all application-specific keys
   * @returns {string[]} Array of app keys
   */
  getAppKeys() {
    const appPrefixes = ["analysis_", "user_", "ui_", "app_"];
    const keys = [];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && appPrefixes.some((prefix) => key.startsWith(prefix))) {
          keys.push(key);
        }
      }
    } catch (error) {
      console.error("Failed to get app keys:", error);
    }

    return keys;
  },

  /**
   * Clean up old or corrupted data
   */
  cleanup() {
    try {
      const keys = this.getAppKeys();
      const now = Date.now();
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

      keys.forEach((key) => {
        try {
          const item = localStorage.getItem(key);
          if (!item) return;

          const parsed = JSON.parse(item);
          if (parsed && parsed.timestamp && now - parsed.timestamp > maxAge) {
            localStorage.removeItem(key);
            console.log(`Cleaned up expired item: ${key}`);
          }
        } catch (error) {
          // Remove corrupted items
          localStorage.removeItem(key);
          console.log(`Cleaned up corrupted item: ${key}`);
        }
      });
    } catch (error) {
      console.error("Failed to cleanup storage:", error);
    }
  },

  /**
   * Get storage usage information
   * @returns {Object} Storage usage stats
   */
  getUsage() {
    try {
      const keys = this.getAppKeys();
      let totalSize = 0;
      const itemSizes = {};

      keys.forEach((key) => {
        const item = localStorage.getItem(key);
        if (item) {
          const size = new Blob([item]).size;
          totalSize += size;
          itemSizes[key] = size;
        }
      });

      return {
        totalSize,
        itemSizes,
        itemCount: keys.length,
        availableSpace: this.getAvailableSpace(),
      };
    } catch (error) {
      console.error("Failed to get storage usage:", error);
      return {
        totalSize: 0,
        itemSizes: {},
        itemCount: 0,
        availableSpace: 0,
      };
    }
  },

  /**
   * Estimate available localStorage space
   * @returns {number} Available space in bytes
   */
  getAvailableSpace() {
    try {
      const testKey = "storage_test";
      const testChunk = "a".repeat(1024); // 1KB
      let used = 0;

      // Test by writing chunks until quota exceeded
      while (used < 10 * 1024 * 1024) {
        // Max 10MB test
        try {
          localStorage.setItem(testKey, testChunk.repeat(used / 1024));
          used += 1024;
        } catch (error) {
          localStorage.removeItem(testKey);
          return used;
        }
      }

      localStorage.removeItem(testKey);
      return used;
    } catch (error) {
      return 0;
    }
  },

  /**
   * Check if localStorage is available
   * @returns {boolean} Whether localStorage is supported and available
   */
  isAvailable() {
    try {
      const test = "__storage_test__";
      localStorage.setItem(test, "test");
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  },
};
