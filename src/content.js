/**
 * content.js — ALL site content lives here (single source of truth).
 * Schema follows README §5. Placeholder data marked with [PLACEHOLDER].
 */

export const content = {
  about: {
    name:         '[PLACEHOLDER] Your Name',
    title:        '[PLACEHOLDER] Full-Stack Developer',
    tagline:      '[PLACEHOLDER] I build polished web experiences for startups and agencies.',
    bio:          '[PLACEHOLDER] A passionate developer with experience across the stack. I love turning complex problems into clean, intuitive interfaces.\n\nWhen I\'m not coding I\'m probably sketching UI ideas or exploring new creative tools.',
    location:     '[PLACEHOLDER] City, Country',
    availability: 'Open to work',
  },

  skills: [
    { name: 'JavaScript',  category: 'Frontend',  level: 4 },
    { name: 'React',       category: 'Frontend',  level: 4 },
    { name: 'Three.js',    category: 'Frontend',  level: 3 },
    { name: 'Node.js',     category: 'Backend',   level: 3 },
    { name: 'Python',      category: 'Backend',   level: 3 },
    { name: 'CSS / SCSS',  category: 'Frontend',  level: 4 },
    { name: 'Git',         category: 'Tools',     level: 4 },
    { name: 'Figma',       category: 'Design',    level: 3 },
  ],

  projects: [
    {
      id:          'project-alpha',
      title:       '[PLACEHOLDER] Project Alpha',
      summary:     'A real-time dashboard for monitoring IoT sensors.',
      description: '[PLACEHOLDER] Built a live dashboard that streams sensor data over WebSockets. Led the frontend, designed the chart system, reduced initial load by 40%.',
      tech:        ['React', 'D3.js', 'Node.js', 'WebSocket'],
      links:       { live: 'https://example.com', repo: 'https://github.com/example/alpha' },
      image:       '/public/projects/project-alpha.png',
      featured:    true,
      date:        '2026-06',
    },
    {
      id:          'project-beta',
      title:       '[PLACEHOLDER] Project Beta',
      summary:     'An AI-powered recipe generator with voice input.',
      description: '[PLACEHOLDER] Full-stack app using OpenAI API and Web Speech API. Handled auth, prompt engineering, and a responsive card layout.',
      tech:        ['Next.js', 'OpenAI', 'Tailwind', 'Supabase'],
      links:       { live: 'https://example.com', repo: 'https://github.com/example/beta' },
      image:       '/public/projects/project-beta.png',
      featured:    true,
      date:        '2026-03',
    },
    {
      id:          'project-gamma',
      title:       '[PLACEHOLDER] Project Gamma',
      summary:     'A 3D product configurator for an e-commerce store.',
      description: '[PLACEHOLDER] Interactive 3D viewer letting users customize colors and materials. Built with Three.js and integrated into a Shopify storefront.',
      tech:        ['Three.js', 'JavaScript', 'Shopify'],
      links:       { live: '', repo: 'https://github.com/example/gamma' },
      image:       '/public/projects/project-gamma.png',
      featured:    false,
      date:        '2025-11',
    },
  ],

  contact: {
    email:    '[PLACEHOLDER] hello@example.com',
    github:   '[PLACEHOLDER] https://github.com/example',
    linkedin: '[PLACEHOLDER] https://linkedin.com/in/example',
  },

  resume: '/public/resume.pdf',
};
