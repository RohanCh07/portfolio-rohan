'use client';

import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

export default function Hero() {
  return (
    <section id="hero" className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-electric-blue/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-electric-blue/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-electric-blue to-white bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Building Digital
          <br />
          <span className="bg-gradient-to-r from-electric-blue to-electric-blue-dark bg-clip-text text-transparent">
            Experiences
          </span>
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Crafting modern web applications with cutting-edge technology
          and attention to detail.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.a
            href="#projects"
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById('projects');
              if (element) {
                const offset = 80;
                const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - offset;
                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth',
                });
              }
            }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-electric-blue text-slate-900 font-semibold rounded-lg hover:bg-electric-blue-dark transition-colors shadow-lg shadow-electric-blue/50 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View My Work
            <ArrowDown className="w-5 h-5" />
          </motion.a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowDown className="w-6 h-6 text-electric-blue" />
        </motion.div>
      </motion.div>
    </section>
  );
}
