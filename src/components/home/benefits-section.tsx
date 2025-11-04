import { Clock, Target, Code2, Heart } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const benefits = [
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Save Time",
    description:
      "Skip backend setup. Focus on UI development and ship faster than ever.",
  },
  {
    icon: <Target className="h-6 w-6" />,
    title: "Perfect for Learning",
    description:
      "Ideal for frontend developers learning React, Vue, Svelte, or Next.js.",
  },
  {
    icon: <Code2 className="h-6 w-6" />,
    title: "Real REST APIs",
    description:
      "Get actual REST endpoints. Use with Axios, Fetch, or any HTTP client.",
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: "Realistic Data",
    description:
      "Faker.js integration ensures your mock data looks and feels real.",
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
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
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

export function BenefitsSection() {
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
            Why Choose DevMock?
          </h2>
          <p className="text-base sm:text-lg text-default-600 max-w-2xl mx-auto px-4">
            Built specifically for frontend developers who want to focus on what
            they do best—building beautiful UIs.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8"
          initial="hidden"
          variants={containerVariants}
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-default-50 border border-default-200 hover:border-primary/50 hover:shadow-md transition-all duration-200"
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -4 }}
            >
              <motion.div
                className="flex justify-center mb-3 sm:mb-4"
                whileHover={{ scale: 1.1 }}
              >
                <div className="p-2 sm:p-3 rounded-full bg-primary/10 text-primary">
                  {benefit.icon}
                </div>
              </motion.div>
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">{benefit.title}</h3>
              <p className="text-xs sm:text-sm text-default-600 leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
