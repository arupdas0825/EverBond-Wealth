/**
 * EverBond ID Utility
 * 
 * Generates, validates, and formats permanent EverBond IDs.
 * Format: EB-XXXXXX (6 uppercase alphanumeric characters)
 * Excludes ambiguous characters: O, 0, I, 1, L
 */

const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ2345679';

/**
 * Generate a new EverBond ID in the format EB-XXXXXX
 * @returns {string} e.g. "EB-A7K92X"
 */
export function generateEverBondId() {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));
  }
  return `EB-${code}`;
}

/**
 * Validate an EverBond ID string
 * @param {string} id - The ID to validate
 * @returns {boolean} true if valid format EB-XXXXXX
 */
export function isValidEverBondId(id) {
  if (!id || typeof id !== 'string') return false;
  return /^EB-[A-Z2-9]{6}$/.test(id.trim().toUpperCase());
}

/**
 * Normalize raw input into proper EverBond ID format
 * Strips whitespace, uppercases, adds EB- prefix if missing
 * @param {string} raw - Raw user input
 * @returns {string} Formatted ID
 */
export function formatEverBondId(raw) {
  if (!raw) return '';
  let cleaned = raw.trim().toUpperCase().replace(/\s+/g, '');
  
  // If user typed just the 6-char code without prefix
  if (/^[A-Z2-9]{6}$/.test(cleaned)) {
    return `EB-${cleaned}`;
  }
  
  // If starts with EB but missing dash
  if (/^EB[A-Z2-9]{6}$/.test(cleaned)) {
    return `EB-${cleaned.slice(2)}`;
  }
  
  return cleaned;
}
