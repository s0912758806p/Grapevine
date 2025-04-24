/**
 * Giscus configuration for GitHub authentication
 * You will need to set up a GitHub repository with Giscus app installed.
 * Visit https://giscus.app to get your repository settings.
 */

export const giscusConfig = {
  // Replace these values with your actual GitHub repo details from https://giscus.app/
  repo: "username/repo" as `${string}/${string}`, // Your GitHub repo in format: 'username/repository'
  repoId: "R_kgDOJXxxxxxx", // Your GitHub repository ID
  category: "Announcements", // The name of the discussion category
  categoryId: "DIC_kwDOJXxxxxx", // The ID of the discussion category
  mapping: "pathname" as const, // How Giscus should map discussions to pages
  reactionsEnabled: "1" as const, // Enable reactions
  emitMetadata: "0" as const, // Don't emit metadata
  inputPosition: "top" as const, // Comment box position
  theme: "light", // Theme
};

/**
 * To set up Giscus:
 * 1. Go to https://giscus.app and follow the setup process
 * 2. Make sure the GitHub app is installed in your repository:
 *    https://github.com/apps/giscus
 * 3. Enable discussions in your repository settings:
 *    Settings > Features > Discussions
 * 4. Copy the values from the giscus configuration script
 * 5. Replace the placeholder values in this file
 *
 * Note: For GitHub authentication to work properly with Giscus:
 * - Your repository must be public
 * - The Giscus app must have access to your repository
 * - Discussions must be enabled on your repository
 */
