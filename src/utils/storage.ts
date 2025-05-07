/**
 * Utility functions for working with localStorage
 */

/**
 * Load data from localStorage
 * @param key The key to load data from
 * @param defaultValue Default value if no data exists
 * @returns The parsed data or defaultValue if no data exists
 */
export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Failed to load data for key '${key}':`, error);
  }
  return defaultValue;
};

/**
 * Save data to localStorage
 * @param key The key to save data under
 * @param data The data to save
 */
export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save data for key '${key}':`, error);
  }
};

/**
 * Remove data from localStorage
 * @param key The key to remove
 */
export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove data for key '${key}':`, error);
  }
};
