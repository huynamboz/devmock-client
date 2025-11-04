import { ArrowRight, Code2, Zap } from "lucide-react";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { BackgroundRippleEffect } from "../ui/background-ripple-effect";
import { BackgroundLines } from "../ui/background-lines";

import { title, subtitle } from "@/components/primitives";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <BackgroundLines className="relative min-h-lvh flex flex-col items-center justify-center gap-3 sm:gap-4 md:gap-6 py-8 sm:py-10 md:py-16 lg:py-20 xl:py-32 !md:pt-16 sm:!pt-20 lg:!pt-24 px-3 sm:px-4 md:px-6">
      <BackgroundRippleEffect />
      <motion.div
        animate="visible"
        className="inline-block w-full max-w-4xl text-center relative z-10"
        initial="hidden"
        variants={containerVariants}
      >
        {/* Badge */}
        <motion.div
          className="mb-6 sm:mb-8 md:mb-12 lg:mb-16"
          variants={itemVariants}
        >
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs md:text-sm font-medium">
            <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 flex-shrink-0" />
            <span className="whitespace-nowrap text-[10px] sm:text-xs md:text-sm">
              Mock APIs in seconds, not hours
            </span>
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          className={`${title({ size: "lg" })} text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl px-2 sm:px-4 leading-tight sm:leading-normal`}
          variants={itemVariants}
        >
          Build Better UIs
          <br className="hidden sm:block" />
          <span className="block sm:inline"> </span>
          <span
            className={`${title({ color: "blue", size: "lg" })} block sm:inline`}
          >
            Without Backend Hassle
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className={`${subtitle({ class: "mt-3 sm:mt-4 md:mt-6 max-w-2xl mx-auto px-2 sm:px-4" })} text-xs sm:text-sm md:text-base leading-relaxed`}
          variants={itemVariants}
        >
          A lightweight mock backend + mock database built for Frontend
          Developers. Create data models, generate mock data, and call real REST
          APIs instantly while focusing entirely on UI development.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 md:gap-4 mt-4 sm:mt-6 md:mt-8 px-2 sm:px-4"
          variants={itemVariants}
        >
          <Button
            className="w-full sm:w-auto text-sm sm:text-base"
            color="primary"
            endContent={<ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            size="md"
            onPress={() => navigate("/projects")}
          >
            Get Started Free
          </Button>
          <Button
            as={Link}
            className="w-full sm:w-auto text-sm sm:text-base"
            href="/docs"
            size="md"
            startContent={<Code2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            variant="bordered"
          >
            View Documentation
          </Button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          className="mt-6 sm:mt-8 md:mt-12 text-[10px] sm:text-xs md:text-sm text-default-500 px-2 sm:px-4"
          variants={itemVariants}
        >
          <p className="break-words">
            <span className="block sm:inline">No credit card required</span>
            <span className="hidden sm:inline"> • </span>
            <span className="block sm:inline">Free forever plan available</span>
          </p>
        </motion.div>
      </motion.div>
    </BackgroundLines>
  );
}
