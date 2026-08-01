import { motion } from 'framer-motion';
import { Award, Star, Quote } from 'lucide-react';
import sscPoster1 from '@assets/SSC_2_results_2025_1782659969967.jpeg';
import sscPoster2 from '@assets/SSC_2_results_2025_part2_1782659969969.jpeg';
import inspiringPeople from '@assets/inspring_peoples_1782659947705.jpeg';

export function Results() {
  return (
    <div className="w-full bg-background pt-20">
      {/* Hero */}
      <div className="bg-primary text-white py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-accent text-primary rounded-full mb-8 shadow-[0_0_30px_rgba(201,168,76,0.5)]"
          >
            <Award size={48} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif font-bold mb-4"
          >
            100% Board Result
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-primary-foreground/90 max-w-2xl mx-auto font-medium tracking-wide"
          >
            SSC-II 2025 Batch Excellence
          </motion.p>
        </div>
      </div>

      {/* Top Students */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold text-foreground">Our High Achievers</h2>
            <div className="w-16 h-1 bg-accent mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* 1st Position */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card p-8 rounded-2xl shadow-xl border-t-8 border-[#FFD700] text-center transform md:-translate-y-4"
            >
              <div className="w-16 h-16 mx-auto bg-[#FFD700]/10 text-[#FFD700] rounded-full flex items-center justify-center mb-4">
                <Star size={32} fill="currentColor" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1">Taha Bin Tanveer</h3>
              <p className="text-3xl font-black text-primary my-4">512 <span className="text-base text-muted-foreground font-medium">Marks</span></p>
              <p className="text-sm font-semibold text-accent uppercase tracking-wider">1st Position</p>
            </motion.div>

            {/* 2nd Position */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-card p-8 rounded-2xl shadow-lg border-t-8 border-[#C0C0C0] text-center"
            >
              <div className="w-16 h-16 mx-auto bg-[#C0C0C0]/10 text-[#C0C0C0] rounded-full flex items-center justify-center mb-4">
                <Star size={32} fill="currentColor" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1">Hassan Asghar</h3>
              <p className="text-3xl font-black text-primary my-4">501 <span className="text-base text-muted-foreground font-medium">Marks</span></p>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">2nd Position</p>
            </motion.div>

            {/* 3rd Position */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-card p-8 rounded-2xl shadow-lg border-t-8 border-[#CD7F32] text-center"
            >
              <div className="w-16 h-16 mx-auto bg-[#CD7F32]/10 text-[#CD7F32] rounded-full flex items-center justify-center mb-4">
                <Star size={32} fill="currentColor" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1">Muqaddas Qureshi</h3>
              <p className="text-3xl font-black text-primary my-4">500 <span className="text-base text-muted-foreground font-medium">Marks</span></p>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">3rd Position</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Official Posters */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-12">Official Result Posters</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <img src={sscPoster1} alt="SSC Results 2025 Part 1" className="w-full rounded-lg shadow-2xl border-4 border-muted" />
            <img src={sscPoster2} alt="SSC Results 2025 Part 2" className="w-full rounded-lg shadow-2xl border-4 border-muted" />
          </div>
        </div>
      </section>

      {/* Inspiring Stories */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center max-w-6xl mx-auto">
            <div className="md:w-1/2">
              <img src={inspiringPeople} alt="Inspiring Students" className="w-full rounded-xl shadow-2xl border-2 border-accent" />
            </div>
            <div className="md:w-1/2 space-y-6">
              <Quote size={48} className="text-accent opacity-50" />
              <h2 className="text-3xl md:text-4xl font-serif font-bold">Inspiring Greatness</h2>
              <p className="text-lg text-primary-foreground/90 leading-relaxed">
                Behind every mark on the result sheet is a story of hard work, late nights, and unyielding determination. Our students have proven that with the right guidance and a disciplined environment, no goal is too high.
              </p>
              <p className="text-lg text-primary-foreground/90 leading-relaxed">
                We congratulate the parents and the tireless faculty whose joint efforts made this historical 100% result possible.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}