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
 * Generate a new Couple EverBond ID
 * @returns {string} e.g. "EB-COUPLE-AS22-7K9X"
 */
export function generateCoupleId() {
  let p1 = '';
  let p2 = '';
  
  // Generate AS22 part
  for (let i = 0; i < 4; i++) {
    p1 += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));
  }
  // Generate 7K9X part
  for (let i = 0; i < 4; i++) {
    p2 += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));
  }
  
  return `EB-COUPLE-${p1}-${p2}`;
}

/**
 * Generate a new Family EverBond ID
 * @param {string} partner1 - First partner's name
 * @param {string} partner2 - Second partner's name
 * @returns {string} e.g. "EB-FAMILY-AS22-RUPTA"
 */
export function generateFamilyId(partner1, partner2) {
  let p1 = '';
  // Generate first part (4 random alphanumeric characters)
  for (let i = 0; i < 4; i++) {
    p1 += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));
  }
  
  // Construct personalized 5-char name part (e.g. RUPTA)
  let p1Part = (partner1 || 'FAM').trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
  if (p1Part.length < 3) p1Part = (p1Part + 'FAM').slice(0, 3);
  
  let p2Part = (partner2 || 'LY').trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
  if (p2Part.length < 2) p2Part = (p2Part + 'LY').slice(0, 2);
  
  const p2 = `${p1Part}${p2Part}`; // 5 uppercase characters
  
  return `EB-FAMILY-${p1}-${p2}`;
}

/**
 * Validate an EverBond Personal ID string
 * @param {string} id - The ID to validate
 * @returns {boolean} true if valid format EB-[A-Z]{4}-[0-9A-F]{4}
 */
export function isValidEverBondId(id) {
  if (!id || typeof id !== 'string') return false;
  const cleaned = id.trim().toUpperCase();
  return /^EB-[A-Z]{4}-[0-9A-F]{4}$/.test(cleaned) || /^EB-[A-Z0-9]{6}$/.test(cleaned);
}

/**
 * Normalize raw input into proper EverBond ID format
 */
export function formatEverBondId(raw) {
  if (!raw) return '';
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}
