import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Menu, X, Phone, Mail, MapPin } from 'lucide-react';
import logo from '@assets/logo_1782659947703.jpeg';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Courses', path: '/courses' },
  { name: 'Fees', path: '/fees' },
  { name: 'Results', path: '/results' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Teachers', path: '/teachers' },
  { name: 'Admissions', path: '/admissions' },
  { name: 'Contact', path: '/contact' },
];

export function PublicShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset shared navigation state whenever a new public page is opened.
  // Keeping the previous scroll position can make a shorter page appear blank,
  // especially on mobile after navigating from the long home/gallery pages.
  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground py-2 px-4 md:px-8 text-xs md:text-sm font-medium hidden md:flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-accent" />
            <span>+92 333 1962657</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-accent" />
            <span>awansacademy@gmail.com</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-accent">Timings:</span>
          <span>4:00 PM - 7:30 PM</span>
        </div>
      </div>

      {/* Navbar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-background/80 backdrop-blur-md border-b border-border shadow-sm'
            : 'bg-background border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <img src={logo} alt="The Awan Academy" className="h-12 w-12 rounded-full object-cover border-2 border-accent" />
              <div>
                <h1 className="font-serif font-bold text-xl md:text-2xl text-primary leading-tight">The Awan Academy</h1>
                <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-semibold">Where Knowledge Meets Excellence</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-primary hover:bg-muted ${
                    location === link.path ? 'text-primary bg-primary/5 font-semibold' : 'text-foreground/80'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="w-px h-6 bg-border mx-2"></div>
              <Link
                href="/login"
                className="ml-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
              >
                Portal Login
              </Link>
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-b border-border bg-background overflow-hidden"
            >
              <div className="px-4 py-4 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`px-4 py-3 rounded-md text-base font-medium transition-colors ${
                      location === link.path ? 'text-primary bg-primary/5 font-semibold' : 'text-foreground/80'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="h-px bg-border my-2"></div>
                <Link
                  href="/login"
                  className="mx-4 my-2 px-4 py-3 text-center bg-primary text-primary-foreground rounded-md text-base font-semibold"
                >
                  Portal Login
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content with Page Transitions */}
      <main className="flex-1 flex flex-col w-full relative">
        <motion.div
          key={location}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground pt-16 pb-8 border-t-[6px] border-accent">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img src={logo} alt="Logo" className="h-12 w-12 rounded-full border border-accent/50" />
                <h2 className="font-serif font-bold text-2xl">The Awan Academy</h2>
              </div>
              <p className="text-primary-foreground/80 mb-6 text-sm leading-relaxed max-w-sm">
                A trusted, community-rooted institution in Pakistan serving students from Class 1 to 12. Excellence in education and character building.
              </p>
            </div>

            <div>
              <h3 className="font-serif font-bold text-xl mb-6 text-accent">Quick Links</h3>
              <ul className="grid grid-cols-2 gap-3 text-sm text-primary-foreground/80">
                <li><Link href="/about" className="hover:text-accent transition-colors">About Us</Link></li>
                <li><Link href="/courses" className="hover:text-accent transition-colors">Courses</Link></li>
                <li><Link href="/fees" className="hover:text-accent transition-colors">Fee Structure</Link></li>
                <li><Link href="/results" className="hover:text-accent transition-colors">Results</Link></li>
                <li><Link href="/gallery" className="hover:text-accent transition-colors">Gallery</Link></li>
                <li><Link href="/teachers" className="hover:text-accent transition-colors">Faculty</Link></li>
                <li><Link href="/admissions" className="hover:text-accent transition-colors">Admissions</Link></li>
                <li><Link href="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-serif font-bold text-xl mb-6 text-accent">Contact Info</h3>
              <ul className="space-y-4 text-sm text-primary-foreground/80">
                <li className="flex items-start gap-3">
                  <Phone size={18} className="text-accent shrink-0 mt-0.5" />
                  <span>+92 333 1962657</span>
                </li>
                <li className="flex items-start gap-3">
                  <Mail size={18} className="text-accent shrink-0 mt-0.5" />
                  <span>awansacademy@gmail.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-accent shrink-0 mt-0.5" />
                  <span>Pakistan</span>
                </li>
              </ul>
              <div className="mt-6 flex items-center gap-4 text-sm">
                <span className="font-semibold text-accent">Follow us:</span>
                <span className="opacity-80">Instagram</span>
                <span className="opacity-80">TikTok</span>
                <span className="opacity-80">YouTube</span>
              </div>
            </div>
          </div>
          <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-primary-foreground/60">
            <p>&copy; {new Date().getFullYear()} The Awan Academy. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Designed & Built to Production Quality</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/923331962657"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        aria-label="Chat on WhatsApp"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
          <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
          <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
          <path d="M9 15c1 1 3 1 4 0" />
        </svg>
        <span className="absolute right-full mr-4 bg-background text-foreground text-sm py-1.5 px-3 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-medium pointer-events-none border border-border">
          Chat with us
        </span>
      </a>
    </div>
  );
}
