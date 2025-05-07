/**
 * Utility functions for performance optimization
 */

/**
 * Throttle a function call to execute at most once in a specified time period
 * @param func The function to throttle
 * @param delay Minimum time between function calls in milliseconds
 * @returns Throttled function
 */
export const throttle = <T extends (...args: unknown[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCallTime = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCallTime >= delay) {
      lastCallTime = now;
      func(...args);
    }
  };
};

/**
 * Specialized throttle function for GeolocationPosition
 * @param func Function to throttle that takes GeolocationPosition
 * @param delay Minimum time between function calls in milliseconds
 * @returns Throttled function
 */
export const throttleGeoPosition = (
  func: (position: GeolocationPosition) => void,
  delay: number
): ((position: GeolocationPosition) => void) => {
  let lastCallTime = 0;

  return (position: GeolocationPosition) => {
    const now = Date.now();
    if (now - lastCallTime >= delay) {
      lastCallTime = now;
      func(position);
    }
  };
};

/**
 * Debounce a function call to execute only after a specified time period has passed
 * @param func The function to debounce
 * @param delay Time to wait after last call in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};
