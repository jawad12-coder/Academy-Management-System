import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSubmitAdmissionInquiry } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, MapPin, Send } from 'lucide-react';

const formSchema = z.object({
  studentName: z.string().min(2, "Name is too short"),
  guardianName: z.string().min(2, "Guardian name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  desiredClass: z.string().min(1, "Please select a class"),
  currentSchool: z.string().optional(),
  message: z.string().optional(),
});

export function Admissions() {
  const { toast } = useToast();
  const submitInquiry = useSubmitAdmissionInquiry();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: "",
      guardianName: "",
      phone: "",
      desiredClass: "",
      currentSchool: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    submitInquiry.mutate(
      { data: values },
      {
        onSuccess: () => {
          toast({
            title: "Inquiry Submitted!",
            description: "We will contact you shortly regarding the admission.",
          });
          form.reset();
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to submit inquiry. Please try WhatsApp instead.",
          });
        }
      }
    );
  }

  return (
    <div className="w-full bg-background pt-20">
      {/* Banner */}
      <div className="bg-primary text-white py-16 text-center border-b-[6px] border-accent">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-accent/20 border border-accent text-accent font-semibold text-sm tracking-wider uppercase"
          >
            Session 2026-27
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold mb-4"
          >
            Admissions Open
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-primary-foreground/80 max-w-2xl mx-auto"
          >
            Secure your child's future at The Awan Academy. Limited seats available.
          </motion.p>
        </div>
      </div>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-5 gap-12">
            
            {/* Admission Process Info */}
            <div className="md:col-span-2 space-y-8">
              <div>
                <h2 className="text-3xl font-serif font-bold text-foreground mb-4">How to Apply</h2>
                <div className="w-12 h-1 bg-accent mb-6"></div>
                <p className="text-muted-foreground mb-8">
                  The admission process at The Awan Academy is straightforward. You can apply via WhatsApp, visit our campus, or fill out the inquiry form.
                </p>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">1</div>
                    <div>
                      <h4 className="font-bold text-foreground">Submit Inquiry</h4>
                      <p className="text-sm text-muted-foreground">Fill the form or contact via WhatsApp with student details.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">2</div>
                    <div>
                      <h4 className="font-bold text-foreground">Visit Campus</h4>
                      <p className="text-sm text-muted-foreground">Visit during 4:00 PM - 7:30 PM for formal registration.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">3</div>
                    <div>
                      <h4 className="font-bold text-foreground">Confirmation</h4>
                      <p className="text-sm text-muted-foreground">Submit documents, pay the fee, and get the admission number.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-6 rounded-xl border border-border">
                <h4 className="font-bold text-foreground mb-4">Quick Contact</h4>
                <a 
                  href="https://wa.me/923331962657" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full p-4 bg-[#25D366] text-white rounded-lg font-bold hover:bg-[#20b858] transition-colors mb-4"
                >
                  <Phone size={20} /> Chat on WhatsApp
                </a>
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                  <span>Visit us between 4:00 PM and 7:30 PM to complete the admission process.</span>
                </div>
              </div>
            </div>

            {/* Inquiry Form */}
            <div className="md:col-span-3">
              <div className="bg-card p-8 rounded-2xl shadow-xl border border-border">
                <h3 className="text-2xl font-serif font-bold text-foreground mb-6">Online Inquiry Form</h3>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="studentName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Student Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter student name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="guardianName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Guardian / Father Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter guardian name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WhatsApp / Phone Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="03XX-XXXXXXX" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="desiredClass"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Desired Class *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Class 1">Class 1</SelectItem>
                                <SelectItem value="Class 2">Class 2</SelectItem>
                                <SelectItem value="Class 3">Class 3</SelectItem>
                                <SelectItem value="Class 4">Class 4</SelectItem>
                                <SelectItem value="Class 5">Class 5</SelectItem>
                                <SelectItem value="Class 6">Class 6</SelectItem>
                                <SelectItem value="Class 7">Class 7</SelectItem>
                                <SelectItem value="Class 8">Class 8</SelectItem>
                                <SelectItem value="Class 9 (Science)">Class 9 (Science)</SelectItem>
                                <SelectItem value="Class 9 (Arts)">Class 9 (Arts)</SelectItem>
                                <SelectItem value="Class 10 (Science)">Class 10 (Science)</SelectItem>
                                <SelectItem value="Class 10 (Arts)">Class 10 (Arts)</SelectItem>
                                <SelectItem value="FSc Pre-Medical">FSc Pre-Medical</SelectItem>
                                <SelectItem value="FSc Pre-Engineering">FSc Pre-Engineering</SelectItem>
                                <SelectItem value="ICS">ICS</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="currentSchool"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current School (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Where is the student currently studying?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Any specific requirements or questions?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full py-6 text-lg font-bold" 
                      disabled={submitInquiry.isPending}
                    >
                      {submitInquiry.isPending ? "Submitting..." : (
                        <><Send className="mr-2" size={20} /> Submit Inquiry</>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}