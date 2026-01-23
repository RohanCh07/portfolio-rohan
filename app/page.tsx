import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import ProjectsGrid from '@/components/ProjectsGrid';
import AboutMe from '@/components/AboutMe';
import Contact from '@/components/Contact';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <ProjectsGrid />
      <AboutMe />
      <Contact />
    </main>
  );
}
