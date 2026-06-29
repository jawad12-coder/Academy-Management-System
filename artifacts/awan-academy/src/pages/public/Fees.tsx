import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import feeStructureImage from '@assets/fees_structure_1782659916167.jpeg';

export function Fees() {
  return (
    <div className="w-full bg-background pt-20">
      <div className="bg-primary text-white py-16 text-center">
        <div className="container mx-auto px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold mb-4"
          >
            Fee Structure
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-primary-foreground/80 max-w-2xl mx-auto"
          >
            Transparent and affordable quality education.
          </motion.p>
        </div>
      </div>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-12 flex items-start gap-4">
            <AlertCircle className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
              Note: The fee structure below is standard. Exact final fee confirmation, sibling discounts, or concessions are determined at the academy office during admission.
            </p>
          </div>

          {/* Premium Fee Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl shadow-xl overflow-hidden border border-border mb-16"
          >
            <div className="bg-primary p-6 text-center">
              <h2 className="text-2xl font-serif font-bold text-white">Monthly Tuition Fees</h2>
            </div>
            
            <div className="divide-y divide-border">
              <div className="grid grid-cols-2 p-4 md:p-6 hover:bg-muted/50 transition-colors">
                <div className="font-bold text-lg text-foreground">Primary Level</div>
                <div className="text-right font-semibold text-lg text-accent">PKR 1,500 – 2,000</div>
                <div className="col-span-2 text-sm text-muted-foreground mt-1">Class 1 to 5</div>
              </div>
              
              <div className="grid grid-cols-2 p-4 md:p-6 hover:bg-muted/50 transition-colors">
                <div className="font-bold text-lg text-foreground">Middle Level</div>
                <div className="text-right font-semibold text-lg text-accent">PKR 2,000 – 2,500</div>
                <div className="col-span-2 text-sm text-muted-foreground mt-1">Class 6 to 8</div>
              </div>
              
              <div className="grid grid-cols-2 p-4 md:p-6 hover:bg-muted/50 transition-colors">
                <div className="font-bold text-lg text-foreground">Secondary Level</div>
                <div className="text-right font-semibold text-lg text-accent">PKR 3,500</div>
                <div className="col-span-2 text-sm text-muted-foreground mt-1">Class 9 & 10 (Science/Arts)</div>
              </div>
              
              <div className="grid grid-cols-2 p-4 md:p-6 hover:bg-muted/50 transition-colors">
                <div className="font-bold text-lg text-foreground">Higher Secondary</div>
                <div className="text-right font-semibold text-lg text-accent">PKR 1,500 <span className="text-sm font-normal text-muted-foreground">/ subject</span></div>
                <div className="col-span-2 text-sm text-muted-foreground mt-1">FSc & ICS</div>
              </div>
            </div>
            
            <div className="bg-muted p-6 text-center border-t border-border">
              <a 
                href="https://wa.me/923331962657" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-bold rounded-md hover:bg-primary/90 transition-colors"
              >
                Inquire on WhatsApp
              </a>
            </div>
          </motion.div>

          {/* Official Poster Image */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-serif font-bold text-foreground mb-8">Official Fee Structure Poster</h3>
            <img 
              src={feeStructureImage} 
              alt="Awan Academy Fee Structure" 
              className="w-full max-w-2xl mx-auto rounded-lg shadow-2xl border-4 border-muted"
            />
          </div>

        </div>
      </section>
    </div>
  );
}