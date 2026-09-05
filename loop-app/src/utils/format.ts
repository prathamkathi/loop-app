/**
 * Utility functions for formatting strings and identifiers.
 */

/**
 * Normalises a host identifier for display:
 * - Bare club handle (e.g. 'bhmiitd') -> '@bhmiitd'
 * - Already prefixed handle (e.g. '@bhmiitd') -> '@bhmiitd'
 * - Human-readable name with spaces (e.g. 'Campus Club') -> 'Campus Club'
 * - Empty/missing -> ''
 */
export function formatHost(host?: string | null): string {
  if (!host) return '';
  const trimmed = host.trim();
  if (trimmed.startsWith('@')) return trimmed;
  if (!trimmed.includes(' ')) return `@${trimmed}`;
  return trimmed;
}

/**
 * Normalises a host identifier for storage (bare handle):
 * e.g. '@bhmiitd' -> 'bhmiitd'
 */
export function normalizeHost(host?: string | null): string {
  if (!host) return '';
  return host.replace(/^@+/, '').trim();
}
