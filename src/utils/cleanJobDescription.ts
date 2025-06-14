
/**
 * Clean and format a job description string for nice display (never raw JSON).
 */
export function cleanJobDescription(description: string | undefined | null): string {
  if (!description) return '';
  let cleaned = description
    .replace(/[\{\}]/g, '') // Remove curly braces
    .replace(/["']/g, '') // Remove quotes
    .replace(/\\n/g, ' ') // Replace \n with spaces
    .replace(/\s+/g, ' ') // Collapse spaces
    .replace(/^\w+:\s*/, '') // Remove property names
    .trim();
  // Very short or junky fallback:
  if (cleaned.length < 20 || /undefined|null/.test(cleaned)) {
    return 'Professional opportunity with competitive compensation and benefits.';
  }
  // Never show JSON-like output!
  if (/^\w+\s*:\s*\[?\{?/.test(cleaned)) {
    cleaned = cleaned.replace(/^\w+\s*:\s*/,'');
  }
  return cleaned;
}
