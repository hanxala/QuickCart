/**
 * Validates and sanitizes image URLs for Next.js Image component
 * @param {string|Array} imageSource - The image source URL or array of URLs
 * @param {string} fallback - Optional fallback placeholder
 * @returns {string} Valid image URL or fallback placeholder
 */
export function getValidImageUrl(imageSource, fallback = null) {
  // Default placeholder SVG
  const defaultPlaceholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA4MEMxMDEuNTY5IDgwIDExMiA5MC40MzE1IDExMiAxMTJDMTEyIDEzMy41NjkgMTAxLjU2OSAxNDQgODAgMTQ0QzU4LjQzMTUgMTQ0IDQ4IDEzMy41NjkgNDggMTEyQzQ4IDkwLjQzMTUgNTguNDMxNSA4MCA4MCA4MFoiIGZpbGw9IiM5QjlCOUIiLz4KPHBhdGggZD0iTTgwIDExMkM4My4zMTQgMTEyIDg2IDEwOS4zMTQgODYgMTA2Qzg2IDEwMi42ODYgODMuMzE0IDEwMCA4MCAxMDBDNzYuNjg2IDEwMCA3NCAxMDIuNjg2IDc0IDEwNkM3NCAxMDkuMzE0IDc2LjY04IDExMiA4MCAxMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=';
  
  // Extract the first image if it's an array
  const imageSrc = Array.isArray(imageSource) ? imageSource[0] : imageSource;
  
  // Check if the image source is valid
  if (imageSrc && typeof imageSrc === 'string') {
    // Allow HTTP/HTTPS URLs and data URLs (base64)
    if (imageSrc.startsWith('http') || imageSrc.startsWith('data:')) {
      return imageSrc;
    }
    
    // Allow relative paths that start with /
    if (imageSrc.startsWith('/')) {
      return imageSrc;
    }
  }
  
  // Return fallback or default placeholder for invalid URLs (like local file paths)
  return fallback || defaultPlaceholder;
}

/**
 * Checks if an image URL is valid for Next.js Image component
 * @param {string} url - The image URL to validate
 * @returns {boolean} True if the URL is valid for Next.js
 */
export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  // Allow HTTP/HTTPS URLs, data URLs, and relative paths
  return url.startsWith('http') || url.startsWith('data:') || url.startsWith('/');
}
