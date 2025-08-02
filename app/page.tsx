import { HeroSection } from '@/components/sections/HeroSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { ProblemSolutionSection } from '@/components/sections/ProblemSolutionSection';
import { HouseSection } from '@/components/sections/HouseSection';
import { RoomsSection } from '@/components/sections/RoomsSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';


export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <AboutSection />
      <ProblemSolutionSection />
      <HouseSection />
      <RoomsSection />
      <TestimonialsSection />

    </main>
  );
}