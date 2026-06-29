/**
 * Replit sometimes concatenates multiple secrets into one env var value,
 * e.g. SUPABASE_URL might contain "SUPABASE_URL=https://... SUPABASE_ANON_KEY=..."
 * This parser detects and fixes that, setting all parsed keys on process.env.
 */
export function parseAndFixEnvVars(varNames: string[]): void {
  // Regex: KEY=value where value ends before the next KEY= or end of string
  // Works for space-separated KEY=value groups
  const kvRegex = /([A-Z0-9_]+)=(\S+)/g;

  for (const name of varNames) {
    const raw = process.env[name];
    if (!raw) continue;

    // Only try to parse if the value looks like a combined key=value blob
    // (i.e., it contains another KEY= pattern besides itself)
    if (!raw.includes('=')) continue;

    // If the value starts with "NAME=value" pattern, it's a combined blob
    const firstMatch = raw.match(/^([A-Z0-9_]+)=/);
    if (!firstMatch) continue;

    // Parse all key=value pairs from the raw string
    let match: RegExpExecArray | null;
    kvRegex.lastIndex = 0;
    while ((match = kvRegex.exec(raw)) !== null) {
      const [, key, value] = match;
      if (key && value) {
        process.env[key] = value;
      }
    }
  }
}
