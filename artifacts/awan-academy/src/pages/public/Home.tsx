import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Users, BookOpen, Award, ChevronRight } from 'lucide-react';
import heroBg from '@assets/pictures_1782659947703.jpeg';
import classPhoto from '@assets/students_learninig_1782659969968.jpeg';
import teacher1 from '@assets/sir_sohaib_1782659947704.jpeg';
import teacher2 from '@assets/Sir1_1782659947704.jpeg';
import teacher3 from '@assets/Sir2_1782659969969.jpeg';

const stats = [
  { value: '130+', label: 'Students Enrolled' },
  { value: '7', label: 'Expert Teachers' },
  { value: '1-12', label: 'Classes Taught' },
  { value: '100%', label: 'Board Results' },
];

const courseLevels = [
  {
    title: 'Primary Level',
    classes: 'Classes 1 - 5',
    desc: 'Building a strong foundation with interactive learning and character building.',
  },
  {
    title: 'Middle Level',
    classes: 'Classes 6 - 8',
    desc: 'Fostering critical thinking and preparing for secondary education.',
  },
  {
    title: 'Secondary Level',
    classes: 'Classes 9 - 10 (Science/Arts)',
    desc: 'Rigorous board preparation with comprehensive testing sessions.',
  },
  {
    title: 'Higher Secondary',
    classes: 'FSc & ICS',
    desc: 'Specialized subject coaching by expert professors for college excellence.',
  },
];

const topTeachers = [
  { name: 'Sir Sohaib', subjects: 'Chemistry & Physics', image: teacher1 },
  { name: 'Sir Junaid', subjects: 'Mathematics, CS & Urdu', image: teacher2 },
  { name: 'Sir Mudasir', subjects: 'English Literature', image: teacher3 },
];

export function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img src={heroBg} alt="Students" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-background/40 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        <div className="container relative z-10 px-4 md:px-6 mx-auto pt-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl text-white"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block px-4 py-1.5 mb-6 rounded-full bg-accent/20 border border-accent/50 backdrop-blur-sm"
            >
              <span className="text-accent font-semibold text-sm tracking-wider uppercase">Admissions Open 2026-27</span>
            </motion.div>
            
            <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight mb-6 text-white drop-shadow-lg">
              Empowering Minds, <br/>
              <span className="text-accent italic">Shaping Futures.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl leading-relaxed font-medium drop-shadow-md">
              A premium educational institution dedicated to excellence in academics and character building for students from Class 1 to FSc/ICS.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="https://wa.me/923331962657" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 bg-accent text-primary font-bold rounded-md hover:bg-white transition-colors shadow-[0_0_20px_rgba(201,168,76,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]"
              >
                Apply for Admission
              </a>
              <Link 
                href="/fees"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white font-semibold rounded-md border border-white/20 hover:bg-white/20 backdrop-blur-sm transition-colors"
              >
                View Fee Structure
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent z-10"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background relative z-20 -mt-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card shadow-lg rounded-xl p-6 text-center border-t-4 border-accent"
              >
                <div className="text-4xl font-bold font-serif text-primary mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2 relative"
            >
              <div className="absolute inset-0 bg-accent translate-x-4 translate-y-4 rounded-lg -z-10"></div>
              <img 
                src={classPhoto} 
                alt="Classroom" 
                className="rounded-lg shadow-xl w-full object-cover aspect-[4/3] border-4 border-white"
              />
              <div className="absolute -bottom-6 -left-6 bg-primary text-white p-6 rounded-lg shadow-xl border-l-4 border-accent max-w-[200px]">
                <p className="font-serif font-bold text-xl mb-1">Years of</p>
                <p className="text-sm text-accent">Academic Excellence</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2 space-y-6"
            >
              <div className="inline-flex items-center gap-2 text-primary font-semibold tracking-wider uppercase text-sm">
                <span className="w-8 h-px bg-accent"></span> About Us
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
                Nurturing Potential, <br/>Inspiring Greatness
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                At The Awan Academy, we believe that education is more than just passing exams. It's about developing character, instilling values, and preparing students for the challenges of tomorrow. 
              </p>
              <p className="text-muted-foreground leading-relaxed text-lg">
                With a highly qualified faculty, structured testing systems, and a focus on conceptual learning, we ensure every student reaches their full potential.
              </p>
              
              <ul className="space-y-3 pt-4">
                {['Interactive Learning Environment', 'Weekly & Monthly Testing System', 'Focus on Character Building'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="pt-6">
                <Link href="/about" className="inline-flex items-center gap-2 text-primary font-semibold hover:text-accent transition-colors group">
                  Discover Our Story <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Courses Preview (3D Cards) */}
      <section className="py-24 bg-primary text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">Academic Programs</h2>
            <p className="text-primary-foreground/80 text-lg">Comprehensive curriculum designed to build strong foundations and achieve board excellence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courseLevels.map((course, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10, rotateX: 5, rotateY: -5 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-xl transition-all duration-300 group cursor-pointer"
                style={{ transformPerspective: 1000 }}
              >
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-6 text-accent group-hover:bg-accent group-hover:text-primary transition-colors">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-2xl font-serif font-bold mb-2">{course.title}</h3>
                <div className="text-accent font-semibold mb-4 text-sm tracking-wide">{course.classes}</div>
                <p className="text-primary-foreground/70 leading-relaxed mb-8">{course.desc}</p>
                <div className="mt-auto flex items-center text-sm font-semibold group-hover:text-accent transition-colors">
                  Explore <ChevronRight size={16} className="ml-1" />
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/courses" className="inline-flex items-center justify-center px-6 py-3 bg-transparent border-2 border-accent text-accent font-semibold rounded-md hover:bg-accent hover:text-primary transition-colors">
              View All Details & Fees
            </Link>
          </div>
        </div>
      </section>

      {/* Teachers Preview */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-16">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 text-primary font-semibold tracking-wider uppercase text-sm mb-4">
                <span className="w-8 h-px bg-accent"></span> Our Faculty
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">Meet Our Experts</h2>
            </div>
            <Link href="/teachers" className="hidden md:flex items-center gap-2 text-primary font-semibold hover:text-accent transition-colors">
              View All Teachers <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {topTeachers.map((teacher, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-2xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-square overflow-hidden relative bg-muted">
                  <img 
                    src={teacher.image} 
                    alt={teacher.name} 
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6 relative">
                  <h3 className="text-2xl font-serif font-bold text-foreground mb-1">{teacher.name}</h3>
                  <p className="text-accent font-medium">{teacher.subjects}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Link href="/teachers" className="inline-flex items-center gap-2 text-primary font-semibold">
              View All Teachers <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Results Banner */}
      <section className="py-16 bg-muted border-y border-border">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-2xl p-8 md:p-12 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent rounded-full blur-3xl opacity-20"></div>
            
            <div className="relative z-10 max-w-2xl text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 text-sm font-semibold mb-6">
                <Award size={16} className="text-accent" />
                <span>Outstanding Achievement</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">SSC-II 2025 Board Results</h2>
              <p className="text-primary-foreground/80 text-lg mb-0">We are incredibly proud to announce a <span className="text-accent font-bold">100% success rate</span> in the recent board examinations, with our top students scoring above 500 marks.</p>
            </div>
            
            <div className="relative z-10 shrink-0">
              <Link href="/results" className="inline-flex items-center justify-center px-8 py-4 bg-accent text-primary font-bold rounded-md hover:bg-white transition-colors shadow-lg">
                View Full Results
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}