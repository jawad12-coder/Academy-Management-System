import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import sirJunaid from '@assets/Sir1_1782659947704.jpeg';
import sirShoaib from '@assets/sir_sohaib_1782659947704.jpeg';
import sirMudasir from '@assets/Sir2_1782659969969.jpeg';

const teachers = [
  {
    name: "Sir Junaid",
    subjects: ["Mathematics", "Computer Science", "Urdu"],
    image: sirJunaid,
    bio: "Expert in analytical subjects with years of board examination experience."
  },
  {
    name: "Sir Shoaib",
    subjects: ["Chemistry", "Physics"],
    image: sirShoaib,
    bio: "Science specialist known for conceptual clarity and engaging teaching methods."
  },
  {
    name: "Sir Mudasir",
    subjects: ["English"],
    image: sirMudasir,
    bio: "Literature and grammar expert focusing on communication and writing skills."
  },
  {
    name: "Miss Uzra",
    subjects: ["Biology", "English", "General Science"],
    image: null,
    bio: "Dedicated teacher with a passion for life sciences and foundational English."
  },
  {
    name: "Miss Shanzil",
    subjects: ["Islamiat", "Tarjama tul Quran"],
    image: null,
    bio: "Guiding students in religious studies and moral values with patience."
  },
  {
    name: "Miss Hijab",
    subjects: ["General Mathematics"],
    image: null,
    bio: "Building strong mathematical foundations for primary and middle levels."
  },
  {
    name: "Miss Komal",
    subjects: ["Arts"],
    image: null,
    bio: "Fostering creativity and expression through arts and crafts."
  }
];

export function Teachers() {
  return (
    <div className="w-full bg-background pt-20">
      <div className="bg-primary text-white py-20 text-center">
        <div className="container mx-auto px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold mb-4"
          >
            Our Faculty
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-primary-foreground/80 max-w-2xl mx-auto"
          >
            Meet the dedicated educators shaping the future at The Awan Academy.
          </motion.p>
        </div>
      </div>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {teachers.map((teacher, i) => (
              <motion.div
                key={teacher.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10, rotateY: 5, rotateX: 5 }}
                style={{ transformPerspective: 1000 }}
                className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="h-64 bg-muted relative overflow-hidden flex items-center justify-center">
                  {teacher.image ? (
                    <img 
                      src={teacher.image} 
                      alt={teacher.name} 
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center font-serif text-4xl font-bold">
                      {teacher.name.split(' ')[1]?.[0] || teacher.name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <h3 className="absolute bottom-4 left-6 text-2xl font-serif font-bold text-white">{teacher.name}</h3>
                </div>
                
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {teacher.subjects.map(sub => (
                      <span key={sub} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 text-primary rounded-md text-xs font-semibold">
                        <BookOpen size={12} /> {sub}
                      </span>
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{teacher.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}