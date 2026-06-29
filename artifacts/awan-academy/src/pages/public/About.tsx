import { motion } from 'framer-motion';
import { Target, Eye, Shield, CheckCircle } from 'lucide-react';
import ceoImage from '@assets/CEO_1782659916168.jpeg';
import facultyImage from '@assets/pictures2_1782659947704.jpeg';
import aboutImage from '@assets/students_learninig_1782659969968.jpeg';

export function About() {
  return (
    <div className="w-full bg-background pt-20">
      {/* Page Header */}
      <div className="bg-primary text-white py-20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold mb-4"
          >
            About The Awan Academy
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-primary-foreground/80 max-w-2xl mx-auto"
          >
            A legacy of academic excellence, character building, and unwavering commitment to student success.
          </motion.p>
        </div>
      </div>

      {/* Intro Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16 items-center max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2 space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Who We Are</h2>
              <div className="w-16 h-1 bg-accent mb-8"></div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The Awan Academy was established with a singular vision: to provide premium, uncompromising quality education to the students of our community. 
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Starting with a small group of dedicated students, we have grown into a trusted institution serving over 130 students from primary to higher secondary levels. We believe that every student has unique potential, and our role is to discover, nurture, and polish that potential.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed font-medium text-foreground">
                We don't just teach subjects; we build mindsets.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary translate-x-4 translate-y-4 rounded-xl -z-10"></div>
                <img src={aboutImage} alt="Students learning" className="rounded-xl shadow-lg border-2 border-white w-full object-cover aspect-video" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-muted/50 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card p-10 rounded-2xl shadow-sm border border-border"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                <Target size={28} />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-4 text-foreground">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To deliver conceptual, modern education in a disciplined environment. We strive to empower students with the critical thinking skills, academic rigor, and moral framework needed to excel in board examinations and beyond.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-primary text-white p-10 rounded-2xl shadow-xl relative overflow-hidden"
            >
              <div className="absolute right-0 top-0 opacity-10">
                <Eye size={120} className="translate-x-8 -translate-y-8" />
              </div>
              <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center mb-6 text-primary relative z-10">
                <Eye size={28} />
              </div>
              <h3 className="text-2xl font-serif font-bold mb-4 relative z-10">Our Vision</h3>
              <p className="text-primary-foreground/90 leading-relaxed relative z-10">
                To be recognized as the leading academy in the region, setting the benchmark for educational standards, ethical development, and unparalleled academic results.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-foreground">Why Choose The Awan Academy?</h2>
            <div className="w-24 h-1 bg-accent mx-auto"></div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { icon: Shield, title: 'Safe Environment', desc: 'A strictly disciplined, secure, and conducive environment for focused learning.' },
              { icon: CheckCircle, title: 'Expert Faculty', desc: 'Subject specialists with proven track records in delivering top board results.' },
              { icon: Target, title: 'Testing System', desc: 'Rigorous weekly, monthly, and grand test sessions to ensure exam readiness.' },
              { icon: Eye, title: 'Individual Focus', desc: 'Limited class sizes to ensure personal attention to every student\'s progress.' },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <feature.icon size={32} />
                </div>
                <h4 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h4>
                <p className="text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CEO Section */}
      <section className="py-24 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="w-48 h-48 md:w-64 md:h-64 shrink-0 relative">
                <div className="absolute inset-0 border-2 border-accent rounded-full translate-x-2 translate-y-2"></div>
                <img src={ceoImage} alt="CEO" className="w-full h-full object-cover rounded-full relative z-10" />
              </div>
              <div>
                <svg className="w-12 h-12 text-accent mb-6 opacity-50" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <p className="text-xl md:text-2xl font-serif italic text-primary-foreground/90 leading-relaxed mb-8">
                  "Education is the most powerful weapon which you can use to change the world. At The Awan Academy, we don't compromise on discipline or academic rigor, because we know we are shaping the future leaders of our nation."
                </p>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-1">Director & CEO</h4>
                  <p className="text-accent font-medium uppercase tracking-wider text-sm">The Awan Academy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Faculty Group Photo */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-foreground">Our Core Team</h2>
            <div className="w-24 h-1 bg-accent mx-auto mb-6"></div>
            <p className="text-muted-foreground">Behind every successful student is a team of dedicated educators who go above and beyond.</p>
          </div>
          <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-muted">
            <img src={facultyImage} alt="Faculty Group" className="w-full h-auto" />
          </div>
        </div>
      </section>
    </div>
  );
}