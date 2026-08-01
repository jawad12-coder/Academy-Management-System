import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export type PublicSettings = { academy_name: string; email: string; phone: string; timings: string; address: string; instagram: string; tiktok: string; youtube: string };
const defaults: PublicSettings = { academy_name: 'Rekhta Academy Pakistan', email: 'rekhtaacademypakistan@gmail.com', phone: '+92 304 3333418', timings: 'Open 24 hours', address: '2 6th Road, Block F, New Katarian Satellite Town, Rawalpindi, 46000, Pakistan', instagram: '', tiktok: '', youtube: '' };

export function usePublicSettings() {
  const [settings, setSettings] = useState(defaults);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.from('settings').select('key,value').in('key', Object.keys(defaults)).then(({ data }) => {
      if (!data) return;
      setSettings(current => ({ ...current, ...Object.fromEntries(data.map(item => [item.key, String(item.value ?? '')])) }));
    });
  }, []);
  return settings;
}
