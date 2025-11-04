import {
  Database,
  Zap,
  Code,
  Layers,
  Rocket,
  Shield,
  ArrowRight,
} from "lucide-react";
import { Button } from "@heroui/button";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Database className="h-6 w-6" />,
    title: "Mock Database",
    description:
      "Create resources and define schemas with ease. Generate realistic data with Faker.js integration.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Instant REST APIs",
    description:
      "Get real REST endpoints automatically. No backend code required. Just define your data structure.",
  },
  {
    icon: <Code className="h-6 w-6" />,
    title: "JSON Template Mode",
    description:
      "Support complex nested structures with JSON templates. Perfect for realistic mock data.",
  },
  {
    icon: <Layers className="h-6 w-6" />,
    title: "Schema Mode",
    description:
      "Simple field-based schema definition. Perfect for quick prototypes and learning projects.",
  },
  {
    icon: <Rocket className="h-6 w-6" />,
    title: "Export to Supabase",
    description:
      "One-click export to Supabase. Convert your mock data to real database tables instantly.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "API Keys & Security",
    description:
      "Secure API access with keys. Rate limiting and access control for your projects.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const headerVariants = {
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

export function FeaturesSection() {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-12 sm:py-16 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <motion.div
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-8 sm:mb-12"
          initial="hidden"
          variants={headerVariants}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-4">
            Everything You Need to Build Fast
          </h2>
          <p className="text-base sm:text-lg text-default-600 max-w-2xl mx-auto px-4">
            Focus on what matters—your UI. We handle the backend complexity so
            you can ship faster.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
          initial="hidden"
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-default-200 bg-content1 hover:border-primary/50 hover:shadow-lg transition-all duration-200"
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <motion.div
                  className="flex-shrink-0 p-2 sm:p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors"
                  transition={{ duration: 0.5 }}
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                >
                  {feature.icon}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-default-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <div className="text-center mt-8 sm:mt-12 px-4">
          <Button
            className="w-full sm:w-auto"
            color="primary"
            endContent={<ArrowRight className="h-4 w-4" />}
            size="lg"
            variant="flat"
            onPress={() => navigate("/login")}
          >
            Explore All Features
          </Button>
        </div>
      </div>
    </section>
  );
}
