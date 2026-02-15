import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@heroui/button";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    title: "Create a Project",
    description:
      "Start by creating a new project. It takes just a few seconds to set up your workspace.",
  },
  {
    number: "02",
    title: "Define Resources",
    description:
      "Create resources like users, products, or posts. Use Schema Mode for simple fields or Template Mode for complex structures.",
  },
  {
    number: "03",
    title: "Generate Mock Data",
    description:
      "Use our slider to generate realistic mock data. Faker.js integration ensures your data looks real.",
  },
  {
    number: "04",
    title: "Call Your API",
    description:
      "Get instant REST endpoints. Use them in your frontend code with any HTTP client—Axios, Fetch, or TanStack Query.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
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

export function HowItWorksSection() {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-12 sm:py-16 md:py-24 bg-default-50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <motion.div
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-8 sm:mb-12"
          initial="hidden"
          variants={headerVariants}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-4">
            How It Works
          </h2>
          <p className="text-base sm:text-lg text-default-600 max-w-2xl mx-auto px-4">
            Get started in minutes. No complex setup, no backend knowledge
            required.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12"
          initial="hidden"
          variants={containerVariants}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative flex flex-col p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-content1 border border-default-200 hover:border-primary/50 hover:shadow-lg transition-all duration-200"
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -4 }}
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <motion.div
                  className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base sm:text-lg"
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: 1.1, rotate: 360 }}
                >
                  {step.number}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold">
                    {step.title}
                  </h3>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-default-600 leading-relaxed flex-1">
                {step.description}
              </p>
              {index < steps.length - 1 && (
                <motion.div
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0 }}
                  className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2"
                  initial={{ opacity: 0, x: -10 }}
                  transition={{ delay: 0.3 + index * 0.15 }}
                >
                  <ArrowRight className="h-6 w-6 text-default-400" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <div className="text-center px-4">
          <Button
            className="w-full sm:w-auto"
            color="primary"
            endContent={<CheckCircle2 className="h-4 w-4" />}
            size="lg"
            onPress={() => navigate("/login")}
          >
            Get Started Now
          </Button>
        </div>
      </div>
    </section>
  );
}
