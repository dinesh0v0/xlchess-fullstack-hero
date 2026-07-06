/**
 * ContactSection — "Contact Us" form section.
 * Fourth section matching xlchess.com.
 */

import { memo, useState } from 'react';
import { motion } from 'framer-motion';

const ContactSection = memo(function ContactSection() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo — no real submission
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setEmail('');
    setMessage('');
  };

  return (
    <section
      id="contact"
      className="relative w-full py-24 overflow-hidden"
      aria-label="Contact us"
      style={{ background: 'linear-gradient(to bottom, var(--color-brand-navy) 0%, #0a1230 50%, var(--color-brand-navy) 100%)' }}
    >
      {/* Background knight silhouette */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04]"
        aria-hidden="true"
      >
        <span className="text-[22rem] text-white">♞</span>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] }}
        >
          <h2 className="text-4xl sm:text-5xl font-black text-white text-center mb-12 tracking-tight">
            Contact Us
          </h2>

          <div
            className="rounded-3xl p-8 sm:p-10 border border-brand-border/60"
            style={{ background: 'rgba(11, 22, 40, 0.7)', backdropFilter: 'blur(16px)' }}
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
              {/* Email */}
              <div className="flex flex-col gap-2">
                <label htmlFor="contact-email" className="text-sm font-semibold text-white">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3.5 rounded-xl bg-brand-navy border border-brand-border text-white placeholder-text-muted text-sm focus:outline-none focus:border-brand-accent/60 transition-colors duration-200"
                />
              </div>

              {/* Message */}
              <div className="flex flex-col gap-2">
                <label htmlFor="contact-message" className="text-sm font-semibold text-white">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can help you."
                  required
                  rows={6}
                  className="w-full px-4 py-3.5 rounded-xl bg-brand-navy border border-brand-border text-white placeholder-text-muted text-sm focus:outline-none focus:border-brand-accent/60 transition-colors duration-200 resize-y"
                />
              </div>

              {/* Submit */}
              <motion.button
                id="contact-submit"
                type="submit"
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-base transition-all duration-300 cursor-pointer"
                style={{
                  background: sent
                    ? 'linear-gradient(to right, #22c55e, #16a34a)'
                    : 'linear-gradient(to right, rgba(255,255,255,0.12), rgba(255,255,255,0.08))',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
                whileHover={{ scale: 1.01, filter: 'brightness(1.1)' }}
                whileTap={{ scale: 0.99 }}
                aria-label="Send message"
              >
                {sent ? (
                  <>✓ Message Sent!</>
                ) : (
                  <>
                    Send Message
                    <span className="text-brand-accent">✈</span>
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

export default ContactSection;
