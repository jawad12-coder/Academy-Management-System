import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/supabase';
import { setAuthTokenGetter, setBaseUrl } from '@workspace/api-client-react';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<Profile | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, VITE_API_URL points to the deployed Express server
    // (e.g. https://awan-api.railway.app). In dev it is '' and Vite proxy handles /api/*.
    const apiUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? '';
    setBaseUrl(apiUrl);

    // Set auth token getter so Express API hooks auto-attach JWT Bearer header
    setAuthTokenGetter(async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    });

    // Load existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      }
      setLoading(false);
    });

    // Keep in sync with token refreshes and sign-out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
        return;
      }
      // For SIGNED_IN the signIn() function already sets the user to avoid a double fetch.
      // Handle TOKEN_REFRESHED and INITIAL_SESSION to keep the session alive.
      if (session?.user && (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<Profile | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (!data.user) return null;

    const profile = await fetchProfile(data.user.id);
    if (profile) setUser(profile);
    return profile;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
