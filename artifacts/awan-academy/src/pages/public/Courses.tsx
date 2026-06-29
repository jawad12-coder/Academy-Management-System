import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, ArrowRight, CheckCircle2 } from 'lucide-react';

const courses = [
  {
    level: "Primary Level",
    classes: "Class 1 to 5",
    fee: "PKR 1,500 – 2,000 / month",
    description: "Laying the foundation for a lifetime of learning. We focus on building strong basics in English, Mathematics, and Science while instilling moral values.",
    features: [
      "Individual attention to every child",
      "Interactive and engaging teaching methods",
      "Focus on handwriting and reading skills",
      "Regular parent-teacher meetings"
    ],
    color: "from-blue-900 to-blue-700"
  },
  {
    level: "Middle Level",
    classes: "Class 6 to 8",
    fee: "PKR 2,000 – 2,500 / month",
    description: "Bridging the gap between foundational learning and serious academic preparation. We start introducing conceptual depth and logical reasoning.",
    features: [
      "Subject specialist teachers",
      "Introduction to scientific concepts",
      "Structured weekly testing",
      "Skill development for secondary level"
    ],
    color: "from-emerald-800 to-emerald-600"
  },
  {
    level: "Secondary Level",
    classes: "Class 9 & 10",
    fee: "PKR 3,500 / month",
    description: "Intensive preparation for Board Examinations (Science & Arts groups). Our most rigorous program designed for top results.",
    features: [
      "Comprehensive syllabus coverage",
      "Past paper practice and analysis",
      "Pre-board grand test sessions",
      "Time management & paper presentation skills"
    ],
    color: "from-[#6B0F1A] to-[#8E1422]" // Primary brand color
  },
  {
    level: "Higher Secondary",
    classes: "FSc & ICS",
    fee: "PKR 1,500 / subject",
    description: "Specialized, subject-specific coaching by experienced professors. Focused on maximizing aggregate scores for university admissions.",
    features: [
      "Expert professors for specific subjects",
      "Entry-test oriented conceptual teaching",
      "Extensive revision sessions",
      "Career counseling and guidance"
    ],
    color: "from-slate-900 to-slate-700"
  }
];

export function Courses() {
  return (
    <div className="w-full bg-background pt-20">
      {/* Header */}
      <div className="bg-primary text-white py-20 text-center relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold mb-4"
          >
            Academic Programs
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-primary-foreground/80 max-w-2xl mx-auto"
          >
            Comprehensive coaching tailored for every stage of your child's educational journey.
          </motion.p>
        </div>
      </div>

      {/* Course Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {courses.map((course, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, rotateX: 2, rotateY: 2 }}
                style={{ transformPerspective: 1000 }}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full"
              >
                {/* Card Header */}
                <div className={`p-8 bg-gradient-to-br ${course.color} text-white relative overflow-hidden`}>
                  <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
                    <GraduationCap size={120} />
                  </div>
                  <h2 className="text-3xl font-serif font-bold mb-2 relative z-10">{course.level}</h2>
                  <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm relative z-10">
                    <BookOpen size={16} /> {course.classes}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-8 flex flex-col flex-1">
                  <div className="mb-6">
                    <p className="text-muted-foreground leading-relaxed">{course.description}</p>
                  </div>
                  
                  <div className="space-y-3 mb-8 flex-1">
                    <h4 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">Key Features</h4>
                    {course.features.map((feature, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-accent shrink-0 mt-0.5" />
                        <span className="text-muted-foreground text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer */}
                  <div className="pt-6 border-t border-border flex items-center justify-between mt-auto">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Fee Structure</p>
                      <p className="font-bold text-foreground text-lg">{course.fee}</p>
                    </div>
                    <a 
                      href="https://wa.me/923331962657" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-accent hover:text-primary transition-colors shrink-0"
                    >
                      <ArrowRight size={20} />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted border-t border-border">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-6">Ready to join The Awan Academy?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Admissions for the new session are currently open. Contact us on WhatsApp or visit the campus to secure your seat.
          </p>
          <a 
            href="https://wa.me/923331962657" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-bold rounded-md hover:bg-primary/90 transition-colors shadow-lg text-lg"
          >
            Apply Now via WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}