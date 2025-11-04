import { ArrowRight, Rocket } from "lucide-react";
import { Button } from "@heroui/button";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

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

export function CTASection() {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-12 sm:py-16 md:py-24">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        <motion.div
          animate={isInView ? "visible" : "hidden"}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-default-50 border border-primary/20 p-6 sm:p-8 md:p-12 text-center"
          initial="hidden"
          variants={containerVariants}
        >
          {/* Background decoration */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.7, 0.5],
            }}
            className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.7, 0.5],
            }}
            className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            <motion.div
              className="flex justify-center mb-6"
              variants={itemVariants}
            >
              <motion.div
                className="p-4 rounded-full bg-primary/10"
                transition={{ duration: 0.6 }}
                whileHover={{ rotate: 360, scale: 1.1 }}
              >
                <Rocket className="h-8 w-8 text-primary" />
              </motion.div>
            </motion.div>
            <motion.h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-4"
              variants={itemVariants}
            >
              Ready to Build Faster?
            </motion.h2>
            <motion.p
              className="text-base sm:text-lg text-default-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4"
              variants={itemVariants}
            >
              Start creating mock APIs in seconds. No credit card required, free
              forever plan available.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 px-4"
              variants={itemVariants}
            >
              <Button
                className="w-full sm:w-auto"
                color="primary"
                endContent={<ArrowRight className="h-4 w-4" />}
                size="lg"
                onPress={() => navigate("/login")}
              >
                Get Started Free
              </Button>
              <Button className="w-full sm:w-auto" as="a" href="/pricing" size="lg" variant="bordered">
                View Pricing
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
