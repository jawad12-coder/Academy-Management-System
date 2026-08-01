import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type GalleryImage = { id: string | number; src: string; category: string; title: string };

export function Gallery() {
  const [filter, setFilter] = useState('All');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [managedImages, setManagedImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('gallery').select('id,title,image_url,category').eq('is_public', true).order('created_at', { ascending: false }).then(({ data }) => {
      setManagedImages((data ?? []).map(item => ({
        id: item.id,
        src: item.image_url,
        title: item.title || 'Rekhta Academy',
        category: item.category || 'Events',
      })));
      setLoading(false);
    });
  }, []);

  const categories = useMemo(() => Array.from(new Set(['All', ...managedImages.map(image => image.category)])), [managedImages]);

  const filteredImages = filter === 'All'
    ? managedImages
    : managedImages.filter(img => img.category === filter);

  return (
    <div className="w-full bg-background pt-20 min-h-screen">
      <div className="bg-primary text-white py-16 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Photo Gallery</h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Glimpses of academic life, events, and memories at Rekhta Academy Pakistan.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === cat
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading gallery...</p>
        ) : managedImages.length === 0 ? (
          <p className="text-center text-muted-foreground">Gallery photos are being added.</p>
        ) : (
          /* Masonry Grid */
          <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            <AnimatePresence>
              {filteredImages.map((img) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={img.id}
                  className="break-inside-avoid relative group cursor-pointer rounded-xl overflow-hidden"
                  onClick={() => setSelectedImage(img.src)}
                >
                  <img src={img.src} alt={img.title} className="w-full h-auto bg-muted" loading="lazy" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4">
                    <ZoomIn className="text-white mb-2" size={32} />
                    <p className="text-white font-medium text-center">{img.title}</p>
                    <p className="text-accent text-xs mt-1 uppercase tracking-wider">{img.category}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-8 cursor-zoom-out"
          >
            <button
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
            >
              <X size={40} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImage}
              alt="Enlarged gallery view"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
