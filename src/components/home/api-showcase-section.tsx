import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PrismAsync } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Code2, Database, Zap, ArrowRight } from "lucide-react";
import { Button } from "@heroui/button";
import { motion, useInView } from "framer-motion";

import { FIELD_TYPES } from "@/components/projects/resource/create-resource-modal";

// Type assertion to fix TypeScript compatibility issue with react-syntax-highlighter

const SyntaxHighlighter = PrismAsync as any;

const crudMethods = [
  {
    method: "GET",
    color: "bg-blue-500",
    description: "Retrieve all records or a specific record",
    examples: [
      "GET /api/v1/pilot/:projectId/:resourceName",
      "GET /api/v1/pilot/:projectId/:resourceName/:id",
    ],
  },
  {
    method: "POST",
    color: "bg-green-500",
    description: "Create a new record",
    examples: [
      "POST /api/v1/pilot/:projectId/:resourceName",
      "Body: { ...your data }",
    ],
  },
  {
    method: "PUT",
    color: "bg-yellow-500",
    description: "Update an existing record",
    examples: [
      "PUT /api/v1/pilot/:projectId/:resourceName/:id",
      "Body: { ...updated data }",
    ],
  },
  {
    method: "DELETE",
    color: "bg-red-500",
    description: "Delete a record",
    examples: ["DELETE /api/v1/pilot/:projectId/:resourceName/:id"],
  },
];

export function APIShowcaseSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const navigate = useNavigate();

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
            Full REST API Support
          </h2>
          <p className="text-base sm:text-lg text-default-600 max-w-2xl mx-auto px-4">
            Complete CRUD operations with all data types. Your mock API works
            just like a real backend.
          </p>
        </motion.div>

        <motion.div
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12"
          initial="hidden"
          variants={containerVariants}
        >
          {/* Supported Types */}
          <motion.div
            className="bg-content1 rounded-xl sm:rounded-2xl border border-default-200 p-4 sm:p-6"
            variants={itemVariants}
          >
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Database className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
              <h3 className="text-lg sm:text-xl font-semibold">
                Supported Data Types
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
              {FIELD_TYPES.map((type) => (
                <div
                  key={type.value}
                  className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-default-50 border border-default-200"
                >
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-default-700 truncate">
                    {type.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs text-default-600 leading-relaxed">
                <strong className="text-primary">Faker.js</strong> integration
                for realistic mock data generation with 40+ faker types
              </p>
            </div>
          </motion.div>

          {/* CRUD Methods */}
          <motion.div
            className="bg-content1 rounded-xl sm:rounded-2xl border border-default-200 p-4 sm:p-6"
            variants={itemVariants}
          >
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
              <h3 className="text-lg sm:text-xl font-semibold">
                REST API Methods
              </h3>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {crudMethods.map((method) => (
                <div
                  key={method.method}
                  className="p-3 sm:p-4 rounded-lg border border-default-200 bg-default-50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <span
                      className={`${method.color} text-white px-2 sm:px-3 py-1 rounded text-xs font-bold self-start sm:self-auto`}
                    >
                      {method.method}
                    </span>
                    <span className="text-xs sm:text-sm text-default-600">
                      {method.description}
                    </span>
                  </div>
                  <div className="space-y-1 mt-2">
                    {method.examples.map((example, index) => (
                      <code
                        key={index}
                        className="block text-xs font-mono text-default-600 bg-content1 px-2 py-1 rounded border border-default-200 break-all"
                      >
                        {example}
                      </code>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Code Example */}
        <motion.div
          animate={isInView ? "visible" : "hidden"}
          className="bg-content1 rounded-xl sm:rounded-2xl border border-default-200 p-4 sm:p-6"
          initial="hidden"
          variants={itemVariants}
        >
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Code2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold">
              Example Usage
            </h3>
          </div>
          <div className="rounded-lg overflow-hidden border border-default-200 overflow-x-auto">
            <SyntaxHighlighter
              customStyle={{
                margin: 0,
                borderRadius: "0.5rem",
                padding: "1rem",
                fontSize: "0.75rem",
                minWidth: "100%",
              }}
              language="javascript"
              style={vscDarkPlus}
              wrapLines={true}
              wrapLongLines={true}
            >
              {`// Fetch all users
const users = await fetch(
  'https://yourproject.devmock.dev/users'
).then(r => r.json());

// Create a new user
const newUser = await fetch(
  'https://yourproject.devmock.dev/users',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: "John Doe",
      email: "john@example.com"
    })
  }
).then(r => r.json());

// Update a user
const updated = await fetch(
  'https://yourproject.devmock.dev/users/123',
  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: "Jane Doe" })
  }
).then(r => r.json());

// Delete a user
await fetch(
  'https://yourproject.devmock.dev/users/123',
  { method: 'DELETE' }
);`}
            </SyntaxHighlighter>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          animate={isInView ? "visible" : "hidden"}
          className="text-center mt-6 sm:mt-8 px-4"
          initial="hidden"
          variants={itemVariants}
        >
          <Button
            className="w-full sm:w-auto"
            color="primary"
            endContent={<ArrowRight className="h-4 w-4" />}
            size="lg"
            onPress={() => navigate("/login")}
          >
            Start Building Your API
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
