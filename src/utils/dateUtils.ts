/**
 * Date processing utility functions
 */

/**
 * Unified date formatting function
 * @param date Date object
 * @returns Formatted date string MM/DD/YYYY
 */
export const formatDateString = (date: Date): string => {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

/**
 * Format short date
 * @param timestamp Timestamp
 * @returns Formatted date string MM/DD/YYYY
 */
export const formatShortDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return formatDateString(date);
};

/**
 * Format date and time
 * @param timestamp Timestamp
 * @returns Formatted date and time string MM/DD/YYYY HH:MM
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const dateStr = formatDateString(date);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${dateStr} ${hours}:${minutes}`;
};

/**
 * Get nearby dates centered around a given timestamp
 * @param timestamp Center timestamp
 * @param dayRange Number of days in range
 * @param minTime Minimum time limit
 * @returns Array of nearby date strings
 */
export const getNearbyDates = (
  timestamp: number,
  dayRange: number,
  minTime: number
): string[] => {
  const dates: string[] = [];
  const currentDate = new Date(timestamp);

  // Get dates before and after
  for (let i = -dayRange; i <= dayRange; i++) {
    if (i === 0) continue; // Skip the current date

    // Create new date object to avoid modifying the original
    const nearbyDate = new Date(currentDate.getTime());
    // Set the date by adjusting days
    nearbyDate.setDate(currentDate.getDate() + i);

    // Only include dates within the time range
    if (nearbyDate.getTime() >= minTime && nearbyDate.getTime() <= Date.now()) {
      dates.push(formatShortDate(nearbyDate.getTime()));
    }
  }

  return dates;
};

/**
 * Calculate timestamp for specified days ago
 * @param days Number of days
 * @returns Timestamp for the specified number of days ago
 */
export const getDateBeforeDays = (days: number): number => {
  return Date.now() - days * 24 * 60 * 60 * 1000;
};
