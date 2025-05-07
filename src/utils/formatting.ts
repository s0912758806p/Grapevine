/**
 * Utility functions for formatting data
 */

/**
 * Format seconds into a readable time string (e.g., "2h 15m")
 * @param totalSeconds Total seconds to format
 * @returns Formatted string
 */
export const formatTimeFromSeconds = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

/**
 * Calculate days between a date and now
 * @param timestamp The timestamp to calculate days from
 * @returns Number of days
 */
export const getDaysSince = (timestamp: number): number => {
  const now = Date.now();
  const diffInMs = now - timestamp;
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
};

/**
 * Format a date to a user-friendly string
 * @param dateString The date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format an ISO date to a relative time string (e.g., "2 days ago")
 * @param dateString ISO date string
 * @returns Relative time string
 */
export const getRelativeTimeString = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();

  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSecs < 60) {
    return "just now";
  } else if (diffInMins < 60) {
    return `${diffInMins} minute${diffInMins > 1 ? "s" : ""} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  } else if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  } else {
    return formatDate(dateString);
  }
};
