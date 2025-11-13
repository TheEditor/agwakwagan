/**
 * Hash Utilities for External API Reference
 *
 * Generates stable, short hashes for cards and columns that can be
 * referenced by external systems (Beads, CI/CD, AI agents).
 *
 * Key Principle: Agwakwagan is the source of truth for identity.
 * External actors receive hashes from the API and store them for reference.
 */

/**
 * Generate 4-character base36 hash (0-9, a-z)
 *
 * Base36 gives us 36^4 = 1,679,616 unique combinations
 * This is sufficient for typical boards (unlikely to exceed 1M cards)
 *
 * @returns 4-character hash like "a3f2", "7b2k", "9qq0"
 */
function generateBase36Hash(): string {
  // Generate random number between 0 and 1679615 (36^4 - 1)
  const max = Math.pow(36, 4);
  const random = Math.floor(Math.random() * max);

  // Convert to base36 and pad to 4 characters
  return random.toString(36).padStart(4, '0');
}

/**
 * Generate card hash with format: card-{xxxx}
 *
 * Example outputs: card-a3f2, card-7b2k, card-9qq0
 *
 * @returns Card hash string
 */
export function generateCardHash(): string {
  return `card-${generateBase36Hash()}`;
}

/**
 * Generate column hash with format: col-{xxxx}
 *
 * Example outputs: col-x9k2, col-m4n7, col-iic8
 *
 * @returns Column hash string
 */
export function generateColumnHash(): string {
  return `col-${generateBase36Hash()}`;
}

/**
 * Validate hash format against expected prefix
 *
 * Rules (from Beads conventions):
 * - Prefix max length: 8 characters (including trailing hyphen)
 * - Allowed characters: lowercase letters, numbers, hyphens
 * - Prefix must start with a letter
 * - Prefix must end with a hyphen
 * - Hash portion: exactly 4 base36 characters (0-9, a-z)
 *
 * @param hash - The hash string to validate (e.g., "card-a3f2")
 * @param prefix - The expected prefix including hyphen (e.g., "card-" or "col-")
 * @returns true if hash matches format, false otherwise
 */
export function isValidHash(hash: string, prefix: 'card-' | 'col-'): boolean {
  // Pattern: {prefix}{4 lowercase alphanumeric}
  const regex = new RegExp(`^${prefix}[0-9a-z]{4}$`);
  return regex.test(hash);
}
