import { createClient } from '@supabase/supabase-js';
import { logger } from './logger.js';

/**
 * Replit sometimes stores multiple secrets concatenated into one env var value,
 * e.g. SUPABASE_URL="SUPABASE_URL=https://... SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=..."
 * This function extracts the correct value for a given key from the raw string.
 */
function resolveEnvVar(key: string): string | undefined {
  const raw = process.env[key];
  if (!raw) return undefined;

  // If the value doesn't look like a combined blob (no KEY= pattern inside), return as-is
  if (!raw.includes('=')) return raw;

  // Check if it looks like a combined blob (starts with or contains "KEY=value" pairs)
  const combinedPattern = /([A-Z][A-Z0-9_]+)=(\S+)/g;
  let match: RegExpExecArray | null;
  const parsed: Record<string, string> = {};
  while ((match = combinedPattern.exec(raw)) !== null) {
    const [, k, v] = match;
    if (k && v) parsed[k] = v;
  }

  if (Object.keys(parsed).length > 0) {
    // Also update process.env with all parsed values for other modules.
    for (const [k, v] of Object.entries(parsed)) {
      if (!process.env[k] || process.env[k] === raw) {
        process.env[k] = v;
      }
    }
    return parsed[key] ?? raw;
  }

  return raw;
}

const supabaseUrl = resolveEnvVar('SUPABASE_URL');
const supabaseServiceRoleKey = resolveEnvVar('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceRoleKey) {
  logger.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

// Admin client with service role key – server-side ONLY
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Verify a user JWT token and return their profile role
export async function verifyUserToken(token: string) {
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role, status')
    .eq('id', data.user.id)
    .single();

  return profile ? { userId: data.user.id, role: profile.role as string, status: profile.status } : null;
}
