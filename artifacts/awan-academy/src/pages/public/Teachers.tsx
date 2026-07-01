import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { supabase, type Teacher } from '@/lib/supabase';

export function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('teachers').select('*').eq('status', 'active').order('full_name')
      .then(({ data }) => { setTeachers((data ?? []) as Teacher[]); setLoading(false); });
  }, []);

  return <div className="w-full bg-background pt-20">
    <div className="bg-primary text-white py-20 text-center"><div className="container mx-auto px-4">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-serif font-bold mb-4">Our Faculty</motion.h1>
      <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">Meet the dedicated educators shaping the future at The Awan Academy.</p>
    </div></div>
    <section className="py-20"><div className="container mx-auto px-4">
      {loading ? <p className="text-center text-muted-foreground">Loading faculty...</p> : teachers.length === 0 ? <p className="text-center text-muted-foreground">Faculty profiles are being updated.</p> :
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">{teachers.map((teacher, i) =>
        <motion.div key={teacher.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg">
          <div className="aspect-[4/5] bg-muted relative overflow-hidden flex items-center justify-center">
            {teacher.photo_url ? <img src={teacher.photo_url} alt={teacher.full_name} className="w-full h-full object-cover object-center" /> : <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center font-serif text-4xl font-bold">{teacher.full_name.split(' ').map(part => part[0]).slice(0, 2).join('')}</div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" /><h3 className="absolute bottom-4 left-6 text-2xl font-serif font-bold text-white">{teacher.full_name}</h3>
          </div>
          <div className="p-6"><div className="flex flex-wrap gap-2 mb-4">{teacher.subjects?.map(subject => <span key={subject} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 text-primary rounded-md text-xs font-semibold"><BookOpen size={12} /> {subject}</span>)}</div>{teacher.qualification && <p className="font-semibold text-sm mb-2">{teacher.qualification}</p>}<p className="text-muted-foreground text-sm leading-relaxed">{teacher.bio || 'Dedicated educator at The Awan Academy.'}</p></div>
        </motion.div>)}</div>}
    </div></section>
  </div>;
}
