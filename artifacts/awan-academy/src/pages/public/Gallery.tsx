import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Import images mapping
import imgEnglish from '@assets/English_period_1782659916168.jpeg';
import imgStudentsLearn from '@assets/students_learninig_1782659969968.jpeg';
import imgUrdu from '@assets/urdu_classes_1782659994499.jpeg';
import imgWhatsApp from '@assets/WhatsApp_Image_2026-06-28_at_6.15.09_PM_1782659994499.jpeg';
import imgTripTeachers from '@assets/trip_teachers_1782659994498.jpeg';
import imgTripMall from '@assets/trips_student_p2_1782659994498.jpeg';
import imgTripStudents from '@assets/trip_students_1782659994500.jpeg';
import imgTripSign from '@assets/child_slohgans_1782659916168.jpeg';
import imgFarewell3 from '@assets/farewell_apert_2026_p3_1782659916168.jpeg';
import imgFarewell1 from '@assets/farewell_part_teachers_warsd_2026_p1_1782659916169.jpeg';
import imgStudents from '@assets/students__1782659969967.jpeg';
import imgPics1 from '@assets/pictures_1782659947703.jpeg';
import imgPics2 from '@assets/pictures2_1782659947704.jpeg';
import imgLadies from '@assets/ladiews_sdtudents_1782659947702.jpeg';
import imgTeachers from '@assets/teachers__1782659969968.jpeg';
import imgSpeech from '@assets/speech_competionwiwinerrer_1782659969969.jpeg';
import imgEnjoy from '@assets/enjoy_1782659916168.jpeg';
import imgTests from '@assets/tests_1782659994499.jpeg';
import imgIndoor from '@assets/indoor_image2_1782659947704.jpeg';

const defaultCategories = ['All', 'Classroom', 'Trips', 'Farewell', 'Faculty', 'Events', 'Tests'];

type GalleryImage = { id: string | number; src: string; category: string; title: string };

const galleryData: GalleryImage[] = [
  { id: 1, src: imgEnglish, category: 'Classroom', title: 'English Period' },
  { id: 2, src: imgStudentsLearn, category: 'Classroom', title: 'Students Learning' },
  { id: 3, src: imgUrdu, category: 'Classroom', title: 'Urdu Class' },
  { id: 4, src: imgIndoor, category: 'Classroom', title: 'Indoor Activities' },
  { id: 5, src: imgTripTeachers, category: 'Trips', title: 'Teachers on Trip' },
  { id: 6, src: imgTripMall, category: 'Trips', title: 'Trip - Mall Road' },
  { id: 7, src: imgTripStudents, category: 'Trips', title: 'Students on Trip' },
  { id: 8, src: imgTripSign, category: 'Trips', title: 'Trip Slogans' },
  { id: 9, src: imgFarewell3, category: 'Farewell', title: 'Farewell Party' },
  { id: 10, src: imgFarewell1, category: 'Farewell', title: 'Teachers at Farewell' },
  { id: 11, src: imgStudents, category: 'Farewell', title: 'Farewell Batch 2026' },
  { id: 12, src: imgPics1, category: 'Faculty', title: 'Boys Group' },
  { id: 13, src: imgPics2, category: 'Faculty', title: 'Faculty Group' },
  { id: 14, src: imgLadies, category: 'Faculty', title: 'Female Students' },
  { id: 15, src: imgTeachers, category: 'Faculty', title: 'Girls Class' },
  { id: 16, src: imgSpeech, category: 'Events', title: 'Speech Competition' },
  { id: 17, src: imgEnjoy, category: 'Events', title: 'Students Enjoying' },
  { id: 18, src: imgTests, category: 'Tests', title: 'Examination Hall' },
  { id: 19, src: imgWhatsApp, category: 'Tests', title: 'Test Day' },
];

export function Gallery() {
  const [filter, setFilter] = useState('All');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [managedImages, setManagedImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    supabase.from('gallery').select('id,title,image_url,category').eq('is_public', true).order('created_at', { ascending: false }).then(({ data }) => {
      setManagedImages((data ?? []).map(item => ({
        id: item.id,
        src: item.image_url,
        title: item.title || 'Academy Gallery',
        category: item.category || 'Events',
      })));
    });
  }, []);

  const allImages = useMemo(() => [...managedImages, ...galleryData], [managedImages]);
  const categories = useMemo(() => Array.from(new Set([...defaultCategories, ...managedImages.map(image => image.category)])), [managedImages]);

  const filteredImages = filter === 'All' 
    ? allImages
    : allImages.filter(img => img.category === filter);

  return (
    <div className="w-full bg-background pt-20 min-h-screen">
      <div className="bg-primary text-white py-16 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Photo Gallery</h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Glimpses of academic life, events, and memories at The Awan Academy.
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

        {/* Masonry Grid */}
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
