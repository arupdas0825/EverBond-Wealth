/**
 * EverBond ID Utility
 * 
 * Generates, validates, and formats the 3-Layer EverBond Identity System:
 * 1. Personal ID: EB-[NAME_4_CHARS]-[HEX_4_CHARS], e.g. EB-ARUP-84F2
 * 2. Couple ID:   EB-COUPLE-[HEX_4_CHARS]-[HEX_4_CHARS], e.g. EB-COUPLE-AS22-7K9X
 * 3. Family ID:   EB-FAMILY-[HEX_4_CHARS]-[UPPERCASE_5_CHARS], e.g. EB-FAMILY-AS22-RUPTA
 */

const HEX = '0123456789ABCDEF';
const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ2345679';

/**
 * Generate a new Personal EverBond ID
 * @param {string} name - The user's name
 * @returns {string} e.g. "EB-ARUP-84F2"
 */
export function generatePersonalId(name) {
  let cleanName = (name || 'USER')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, ''); // Keep only letters
  
  if (cleanName.length < 4) {
    cleanName = (cleanName + 'USER').slice(0, 4);
  } else {
    cleanName = cleanName.slice(0, 4);
  }
  
  let randHex = '';
  for (let i = 0; i < 4; i++) {
    randHex += HEX.charAt(Math.floor(Math.random() * HEX.length));
  }
  
  return `EB-${cleanName}-${randHex}`;
}

/**
 * Legacy generator (repurposed to fallback/default)
 */
export function generateEverBondId() {
  return generatePersonalId('USER');
}

/**
 * Generate a new Relationship ID (Internal)
 * @returns {string} e.g. "REL-2026-001"
 */
export function generateRelationshipId() {
  const year = new Date().getFullYear();
  const randNum = String(Math.floor(100 + Math.random() * 900)); // 3 digits
  return `REL-${year}-${randNum}`;
}

/**
 * Generate a new Family ID (Internal)
 * @returns {string} e.g. "FAM-2026-001"
 */
export function generateFamilyId() {
  const year = new Date().getFullYear();
  const randNum = String(Math.floor(100 + Math.random() * 900)); // 3 digits
  return `FAM-${year}-${randNum}`;
}

/**
 * Validate an EverBond Personal ID string
 * @param {string} id - The ID to validate
 * @returns {boolean} true if valid format EB-[A-Z]{4}-[0-9A-F]{4}
 */
export function isValidEverBondId(id) {
  if (!id || typeof id !== 'string') return false;
  const cleaned = id.trim().toUpperCase();
  return /^EB-[A-Z]{4}-[0-9A-F]{4}$/.test(cleaned);
}

/**
 * Normalize raw input into proper EverBond ID format
 */
export function formatEverBondId(raw) {
  if (!raw) return '';
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}
