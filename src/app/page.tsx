import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { Projects } from '@/components/sections/Projects';
import { ExperienceMotion } from '@/components/sections/ExperienceMotion';
import { XimiSections } from '@/components/sections/XimiSections';
import { XimiProof } from '@/components/sections/XimiProof';

export default function Home() {
  return <><Header /><main id="main"><Hero /><XimiProof /><Projects /><ExperienceMotion /><XimiSections /></main><Footer /></>;
}