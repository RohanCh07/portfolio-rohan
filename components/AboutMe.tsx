'use client';

import { motion } from 'framer-motion';

const techStack = [
  { name: 'Python', icon: '🐍' },
  { name: 'PyTorch', icon: '🔥' },
  { name: 'Scikit-learn', icon: '🤖' },
  { name: 'LangChain', icon: '🔗' },
  { name: 'HuggingFace', icon: '🤗' },
  { name: 'React', icon: '⚛️' },
  { name: 'Node.js', icon: '🟢' },
  { name: 'TypeScript', icon: '📘' },
  { name: 'Django', icon: '🎯' },
  { name: 'FastAPI', icon: '⚡' },
  { name: 'Express', icon: '🚀' },
  { name: 'MongoDB', icon: '🍃' },
  { name: 'MySQL', icon: '🗄️' },
  { name: 'Streamlit', icon: '📊' },
  { name: 'JWT', icon: '🔐' },
  { name: 'libp2p', icon: '🌐' },
  { name: 'Solidity', icon: '⛓️' },
  { name: 'Ethereum', icon: '💎' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
    },
  },
};

export default function AboutMe() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-4xl sm:text-5xl font-bold text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          About <span className="text-electric-blue">Me</span>
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
          {/* Bio Section */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-semibold text-electric-blue mb-4">
              Who I Am
            </h3>
            <p className="text-slate-300 leading-relaxed">
              I'm a full-stack developer and ML engineer passionate about building
              intelligent systems and scalable web applications. My expertise spans
              machine learning, deep learning, blockchain technology, and modern web
              development. I specialize in creating end-to-end solutions from data
              pipelines to production-ready applications.
            </p>
            <p className="text-slate-300 leading-relaxed">
              From building real-time ML prediction systems and AI-powered tools to
              developing decentralized applications and full-stack web platforms, I
              enjoy tackling complex challenges across multiple domains. I'm
              constantly exploring cutting-edge technologies and applying them to
              solve real-world problems.
            </p>
          </motion.div>

          {/* Tech Stack */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-semibold text-electric-blue mb-6">
              Tech Stack
            </h3>
            <motion.div
              className="flex flex-wrap gap-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {techStack.map((tech, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="flex flex-col items-center justify-center p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-electric-blue/50 transition-all cursor-default min-w-[100px]"
                >
                  <span className="text-3xl mb-2">{tech.icon}</span>
                  <span className="text-sm text-slate-300 font-medium">
                    {tech.name}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
