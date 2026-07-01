import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type PublicSettings = { academy_name: string; email: string; phone: string; timings: string; address: string; instagram: string; tiktok: string; youtube: string };
const defaults: PublicSettings = { academy_name: 'The Awan Academy', email: 'awansacademy@gmail.com', phone: '+92 333 1962657', timings: '4:00 PM - 7:30 PM', address: 'Pakistan', instagram: 'https://www.instagram.com/awans_academy/', tiktok: '', youtube: 'https://youtube.com/channel/UCyjJBJ_UBEFzDKnR_LYiuTA' };

export function usePublicSettings() {
  const [settings, setSettings] = useState(defaults);
  useEffect(() => {
    supabase.from('settings').select('key,value').in('key', Object.keys(defaults)).then(({ data }) => {
      if (!data) return;
      setSettings(current => ({ ...current, ...Object.fromEntries(data.map(item => [item.key, String(item.value ?? '')])) }));
    });
  }, []);
  return settings;
}
