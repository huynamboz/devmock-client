import { useRef } from "react";
import { useInView } from "framer-motion";

import DefaultLayout from "@/layouts/default";
import {
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  BenefitsSection,
  DemoSection,
  APIShowcaseSection,
  CTASection,
} from "@/components/home";
import SplashCursor from "@/components/SplashCursor";

export default function IndexPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, {
    once: false,
    margin: "-100px",
  });

  return (
    <DefaultLayout>
      <div className="flex flex-col">
        {isHeroInView && <SplashCursor />}
        <div ref={heroRef}>
          <HeroSection />
        </div>
        <APIShowcaseSection />
        <DemoSection />
        <FeaturesSection />
        <HowItWorksSection />
        <BenefitsSection />
        <CTASection />
      </div>
    </DefaultLayout>
  );
}
