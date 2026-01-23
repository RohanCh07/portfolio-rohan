'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Github, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const projects = [
  {
    id: 1,
    title: 'Real-Time Flight Delay Predictor',
    description: 'Built a real-time ML prediction system for flight delays using live aviation and weather data APIs. Automated ingestion + preprocessing pipeline merging AviationStack & OpenWeatherMap datasets. Designed an interactive Streamlit dashboard to monitor live flight statuses and display model predictions.',
    tags: ['Python', 'Scikit-learn', 'Streamlit', 'Pandas', 'AviationStack API'],
    link: '#',
    github: '#',
  },
  {
    id: 2,
    title: 'Expense Tracker – Full Stack Web Application',
    description: 'Developed an expense management platform with secure JWT authentication and protected APIs. Implemented CRUD functionalities with categorized analytics and chart-based visual insights. Added downloadable Excel reports and responsive UI for seamless personal finance tracking.',
    tags: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT'],
    link: '#',
    github: '#',
  },
  {
    id: 3,
    title: 'E-commerce Shopping System',
    description: 'Built a scalable backend with product catalogs, shopping carts, and order processing workflows. Implemented secure buyer/seller role-based authentication and end-to-end API testing via Postman. Designed normalized database structure using Django ORM with efficient admin management interface.',
    tags: ['Python', 'Django', 'DRF', 'MySQL', 'Postman'],
    link: '#',
    github: '#',
  },
  {
    id: 4,
    title: 'Next Word Prediction System',
    description: 'Built a stacked Bi-LSTM language model capable of predicting the next word in real-time from partial input text. Engineered a custom NLP training pipeline including tokenization, vocabulary creation, and sequence-based supervised learning. Implemented Top-K & temperature sampling to ensure diverse, context-aware word predictions like smart keyboards.',
    tags: ['Python', 'PyTorch', 'NLP', 'LSTM'],
    link: '#',
    github: '#',
  },
  {
    id: 5,
    title: 'Bug Detection & Fix Suggestion Tool',
    description: 'Developed a proactive AI debugging assistant for VS Code with a TypeScript-based UI and Python/FastAPI backend. Engineered a dual-mode system to automatically capture both static linting errors and runtime exceptions. Designed "Tutor" & "Debugger" modes to provide either step-by-step explanations or executable code fixes.',
    tags: ['VS Code API', 'TypeScript', 'FastAPI', 'Python', 'LLM'],
    link: '#',
    github: '#',
  },
  {
    id: 6,
    title: 'FinSight AI: Financial Insights Assistant',
    description: 'Developed an AI assistant for financial report understanding using RAG with FAISS-based vector search. Integrated document upload, Q&A, and Insights Mode for actionable finance analytics within a Streamlit UI. Used Gemini & HuggingFace LLM models for scalable, context-aware financial responses.',
    tags: ['Streamlit', 'LangChain', 'Gemini API', 'HuggingFace', 'FAISS'],
    link: '#',
    github: '#',
  },
  {
    id: 7,
    title: 'BlockAuth: Decentralized Trust Protocol for IoT',
    description: 'Built a decentralized IoT access control system to eliminate single points of failure and enhance device security. Engineered a Solidity smart contract implementing RBAC for automated and tamper-proof access logging. Prototyped a full-stack interface (React + Node.js) and validated performance across simulated IoT devices.',
    tags: ['Solidity', 'Ethereum', 'Hardhat', 'Node.js', 'React.js'],
    link: '#',
    github: '#',
  },
  {
    id: 8,
    title: 'DisasterNet: Offline P2P Emergency Chat System',
    description: 'Built an offline-first P2P emergency communication system using libp2p\'s decentralized networking stack. Implemented local peer auto-discovery via mDNS and resilient message distribution using GossipSub. Integrated a React-based frontend through an Express API for real-time and seamless communication.',
    tags: ['Node.js', 'libp2p', 'GossipSub', 'React', 'mDNS'],
    link: '#',
    github: '#',
  },
  {
    id: 9,
    title: 'Uncertainty-Aware Plant Disease Classification',
    description: 'Built a deep learning–based plant disease classification model using ResNet-50 and transfer learning. Achieved high classification performance while estimating predictive uncertainty using Monte-Carlo Dropout. Evaluated model robustness using proper train-validation-test splits and performance metrics.',
    tags: ['Python', 'PyTorch', 'NumPy', 'Scikit-learn', 'Matplotlib'],
    link: '#',
    github: '#',
  },
];

export default function ProjectsGrid() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
      return () => {
        container.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      const targetScroll = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-4xl sm:text-5xl font-bold text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Featured <span className="text-electric-blue">Projects</span>
        </motion.h2>
        <motion.p
          className="text-slate-400 text-center mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          A collection of projects showcasing my skills and expertise
        </motion.p>

        <div className="relative">
          {/* Scroll buttons */}
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-slate-900 border border-slate-700 text-electric-blue hover:bg-electric-blue/20 transition-all ${
              canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-slate-900 border border-slate-700 text-electric-blue hover:bg-electric-blue/20 transition-all ${
              canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Horizontal scrolling container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 lg:gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          >
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-slate-900 rounded-xl p-6 border border-slate-700 hover:border-electric-blue/50 transition-all duration-300 overflow-hidden flex-shrink-0 w-full sm:w-[500px] lg:w-[600px]"
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-electric-blue/0 to-electric-blue/0 group-hover:from-electric-blue/5 group-hover:to-transparent transition-all duration-300" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-electric-blue transition-colors pr-2">
                      {project.title}
                    </h3>
                    <div className="flex gap-2 flex-shrink-0">
                      <a
                        href={project.github}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-electric-blue/20 transition-colors"
                        aria-label="GitHub"
                      >
                        <Github className="w-5 h-5 text-slate-400 group-hover:text-electric-blue transition-colors" />
                      </a>
                      <a
                        href={project.link}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-electric-blue/20 transition-colors"
                        aria-label="External Link"
                      >
                        <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-electric-blue transition-colors" />
                      </a>
                    </div>
                  </div>

                  <p className="text-slate-400 mb-4 text-sm sm:text-base leading-relaxed">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-3 py-1 text-xs sm:text-sm bg-slate-800 text-electric-blue rounded-full border border-electric-blue/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
