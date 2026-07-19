/**
 * ContactSection — "Contact Us" form section.
 * Premium redesigned version with glassmorphism, micro-interactions, and enhanced fields.
 */

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';

const SUBJECTS = ['General', 'Support', 'Feedback', 'Partnerships'];

const ContactSection = memo(function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    // Simulated network request
    setTimeout(() => setStatus('sent'), 2000);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setSubject(SUBJECTS[0]);
    setMessage('');
    setStatus('idle');
  };

  // Stagger variants for form fields
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <section
      id="contact"
      className="relative w-full py-16 lg:py-24 overflow-hidden"
      aria-label="Contact us"
    >
      <div className="relative z-10 max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight mb-4"
          >
            Get in Touch
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-text-secondary text-lg max-w-lg mx-auto"
          >
            Have a question, feedback, or want to collaborate? We'd love to hear from you.
          </motion.p>
        </div>

        <div className="relative">
          {/* Subtle gradient border wrapper */}
          <div className="absolute -inset-px bg-gradient-to-br from-white/10 to-transparent rounded-3xl pointer-events-none" />

          <div className="relative rounded-3xl p-6 sm:p-12 border border-white/5 bg-[#0a0a0a]/60 backdrop-blur-2xl shadow-2xl overflow-hidden">
            <AnimatePresence mode="wait">
              {status === 'sent' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="flex flex-col items-center justify-center py-16 text-center h-full"
                >
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/30">
                    <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-3">Message Sent!</h3>
                  <p className="text-text-secondary mb-8 max-w-sm">
                    Thank you for reaching out. Our grandmasters will review your message and respond shortly.
                  </p>
                  <button
                    onClick={resetForm}
                    className="px-8 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, y: -20 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-6"
                  noValidate
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Name */}
                    <motion.div variants={itemVariants} className="flex flex-col gap-2">
                      <label htmlFor="contact-name" className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">
                        Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Magnus Carlsen"
                        required
                        className="w-full px-5 py-4 rounded-xl bg-brand-navy/50 border border-white/10 text-white placeholder-text-muted/50 text-sm focus:outline-none focus:border-brand-accent/70 focus:bg-brand-navy transition-all duration-300 shadow-inner"
                      />
                    </motion.div>

                    {/* Email */}
                    <motion.div variants={itemVariants} className="flex flex-col gap-2">
                      <label htmlFor="contact-email" className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">
                        Email
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="magnus@example.com"
                        required
                        className="w-full px-5 py-4 rounded-xl bg-brand-navy/50 border border-white/10 text-white placeholder-text-muted/50 text-sm focus:outline-none focus:border-brand-accent/70 focus:bg-brand-navy transition-all duration-300 shadow-inner"
                      />
                    </motion.div>
                  </div>

                  {/* Subject Pills */}
                  <motion.div variants={itemVariants} className="flex flex-col gap-3 mt-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">
                      Topic
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SUBJECTS.map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => setSubject(sub)}
                          className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer border ${subject === sub
                              ? 'bg-brand-accent text-white border-brand-accent shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                              : 'bg-white/5 text-text-secondary border-transparent hover:bg-white/10 hover:text-white'
                            }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Message */}
                  <motion.div variants={itemVariants} className="flex flex-col gap-2 mt-2">
                    <label htmlFor="contact-message" className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us how we can improve your chess experience..."
                      required
                      rows={5}
                      className="w-full px-5 py-4 rounded-xl bg-brand-navy/50 border border-white/10 text-white placeholder-text-muted/50 text-sm focus:outline-none focus:border-brand-accent/70 focus:bg-brand-navy transition-all duration-300 resize-y shadow-inner"
                    />
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div variants={itemVariants} className="mt-4">
                    <button
                      id="contact-submit"
                      type="submit"
                      disabled={status === 'sending' || !name || !email || !message}
                      className="group relative w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-base overflow-hidden transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-accent to-[var(--color-brand-accent-dark)] transition-transform duration-300 group-hover:scale-[1.03]" />
                      <div className="relative z-10 flex items-center gap-2 text-white">
                        {status === 'sending' ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message
                            <svg className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          </>
                        )}
                      </div>
                    </button>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
});

export default ContactSection;

