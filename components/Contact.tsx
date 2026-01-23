'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Github, Linkedin, Mail, Twitter, Send } from 'lucide-react';

const socialLinks = [
  { name: 'GitHub', icon: Github, href: '#', color: 'hover:text-gray-400' },
  {
    name: 'LinkedIn',
    icon: Linkedin,
    href: '#',
    color: 'hover:text-blue-400',
  },
  {
    name: 'Twitter',
    icon: Twitter,
    href: '#',
    color: 'hover:text-blue-400',
  },
  {
    name: 'Email',
    icon: Mail,
    href: 'mailto:your.email@example.com',
    color: 'hover:text-electric-blue',
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          className="text-4xl sm:text-5xl font-bold text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Get In <span className="text-electric-blue">Touch</span>
        </motion.h2>
        <motion.p
          className="text-slate-400 text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Have a project in mind? Let's work together to bring it to life.
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20 text-white placeholder-slate-500 transition-all"
                placeholder="Your name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20 text-white placeholder-slate-500 transition-all"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/20 text-white placeholder-slate-500 transition-all resize-none"
                placeholder="Your message..."
              />
            </div>

            <motion.button
              type="submit"
              className="w-full px-6 py-3 bg-electric-blue text-slate-900 font-semibold rounded-lg hover:bg-electric-blue-dark transition-colors flex items-center justify-center gap-2 shadow-lg shadow-electric-blue/50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Send Message
              <Send className="w-5 h-5" />
            </motion.button>
          </motion.form>

          {/* Social Links */}
          <motion.div
            className="flex flex-col justify-center"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-semibold text-electric-blue mb-6">
              Connect With Me
            </h3>
            <div className="space-y-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    className="flex items-center gap-4 p-4 bg-slate-900 rounded-lg border border-slate-700 hover:border-electric-blue/50 transition-all group"
                    whileHover={{ x: 5 }}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Icon
                      className={`w-6 h-6 text-slate-400 ${social.color} transition-colors`}
                    />
                    <span className="text-slate-300 group-hover:text-white transition-colors">
                      {social.name}
                    </span>
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          className="mt-16 pt-8 border-t border-slate-700 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-slate-400">
            © {new Date().getFullYear()} Portfolio. Built with Next.js and
            Tailwind CSS.
          </p>
        </motion.footer>
      </div>
    </section>
  );
}
