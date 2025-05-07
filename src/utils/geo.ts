/**
 * Utility functions for geolocation
 */

/**
 * Calculate distance between two geographical points in meters
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in meters
 */
export const getDistanceMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const toRadians = (value: number) => {
    return (value * Math.PI) / 180;
  };
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000;
};

/**
 * Fetch address information from coordinates using Nominatim API
 * @param latitude Latitude
 * @param longitude Longitude
 * @returns Promise with address data or error
 */
export const fetchLocationAddress = async (
  latitude: number,
  longitude: number
) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
    {
      headers: {
        "Accept-Language": "en-US,en;q=0.9,zh-TW;q=0.8,zh;q=0.7",
        "User-Agent": "Grapevine App Location Service",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get address");
  }

  const data = await response.json();

  // Extract address information
  const address = data.display_name;
  const city =
    data.address.city ||
    data.address.town ||
    data.address.village ||
    data.address.hamlet;
  const region = data.address.state || data.address.county;
  const country = data.address.country;

  return {
    address,
    city,
    region,
    country,
  };
};
