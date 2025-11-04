import { Plus, Trash2, Database, Eye, Code } from "lucide-react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem, SelectSection } from "@heroui/select";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useMemo } from "react";

import { FAKER_TYPES } from "@/components/projects/resource/create-resource-modal";

interface Field {
  id: string;
  name: string;
  type: string;
  fakerType?: string;
}

// Generate UUID v4
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;

    return v.toString(16);
  });
}

// Simple mock data generator based on faker types
function generateMockData(
  fields: Field[],
  count: number = 3,
): Record<string, unknown>[] {
  const data: Record<string, unknown>[] = [];

  // Simple faker-like data generation
  const fakerData: Record<string, () => unknown> = {
    "person.firstName": () =>
      ["John", "Jane", "Bob", "Alice", "Charlie"][
        Math.floor(Math.random() * 5)
      ],
    "person.lastName": () =>
      ["Doe", "Smith", "Johnson", "Williams", "Brown"][
        Math.floor(Math.random() * 5)
      ],
    "person.fullName": () =>
      `${["John", "Jane", "Bob", "Alice", "Charlie"][Math.floor(Math.random() * 5)]} ${["Doe", "Smith", "Johnson", "Williams", "Brown"][Math.floor(Math.random() * 5)]}`,
    "person.gender": () =>
      ["Male", "Female", "Other"][Math.floor(Math.random() * 3)],
    "person.bio": () =>
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "person.jobTitle": () =>
      ["Software Engineer", "Designer", "Manager", "Developer", "Analyst"][
        Math.floor(Math.random() * 5)
      ],
    "internet.email": () =>
      `user${Math.floor(Math.random() * 1000)}@example.com`,
    "internet.userName": () => `user${Math.floor(Math.random() * 1000)}`,
    "internet.url": () =>
      `https://example.com/${Math.random().toString(36).substr(2, 9)}`,
    "internet.avatar": () =>
      `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
    "internet.ip": () =>
      `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    "location.city": () =>
      ["New York", "London", "Tokyo", "Paris", "Sydney"][
        Math.floor(Math.random() * 5)
      ],
    "location.country": () =>
      ["USA", "UK", "Japan", "France", "Australia"][
        Math.floor(Math.random() * 5)
      ],
    "location.streetAddress": () =>
      `${Math.floor(Math.random() * 9999)} Main St`,
    "location.zipCode": () => `${Math.floor(Math.random() * 90000) + 10000}`,
    "finance.amount": () => Math.floor(Math.random() * 10000),
    "finance.currencyName": () =>
      ["USD", "EUR", "GBP", "JPY"][Math.floor(Math.random() * 4)],
    "finance.creditCardNumber": () =>
      `4${Math.random().toString().substr(2, 15).replace(/\D/g, "").padEnd(15, "0")}`,
    "company.name": () =>
      ["Acme Corp", "Tech Solutions", "Global Inc", "Digital Services"][
        Math.floor(Math.random() * 4)
      ],
    "company.catchPhrase": () => "Innovating the future",
    "phone.number": () =>
      `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    "date.past": () =>
      new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    "date.future": () =>
      new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    "date.recent": () =>
      new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    "lorem.word": () =>
      ["lorem", "ipsum", "dolor", "sit", "amet"][Math.floor(Math.random() * 5)],
    "lorem.sentence": () =>
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "lorem.paragraph": () =>
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "image.url": () =>
      `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`,
    "commerce.productName": () =>
      ["Product A", "Product B", "Product C"][Math.floor(Math.random() * 3)],
    "commerce.price": () => Math.floor(Math.random() * 1000) + 10,
    "commerce.department": () =>
      ["Electronics", "Clothing", "Home", "Sports"][
        Math.floor(Math.random() * 4)
      ],
  };

  for (let i = 0; i < count; i++) {
    const record: Record<string, unknown> = {
      id: generateUUID(),
    };

    fields.forEach((field) => {
      if (field.fakerType && fakerData[field.fakerType]) {
        record[field.name] = fakerData[field.fakerType]();
      } else {
        record[field.name] = `Sample ${field.name} ${i + 1}`;
      }
    });

    data.push(record);
  }

  return data;
}

export function DemoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [fields, setFields] = useState<Field[]>([
    { id: "1", name: "name", type: "faker", fakerType: "person.fullName" },
    { id: "2", name: "email", type: "faker", fakerType: "internet.email" },
  ]);
  const [viewMode, setViewMode] = useState<"table" | "json">("table");
  const [recordCount, setRecordCount] = useState(3);

  const mockData = useMemo(
    () => generateMockData(fields, recordCount),
    [fields, recordCount],
  );

  const generateId = () => {
    return `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleAddField = () => {
    const newField: Field = {
      id: generateId(),
      name: "",
      type: "faker",
      fakerType: undefined,
    };

    setFields([...fields, newField]);
  };

  const handleRemoveField = (id: string) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  const handleFieldChange = (id: string, key: keyof Field, value: string) => {
    setFields(
      fields.map((field) => {
        if (field.id === id) {
          const updated = { ...field, [key]: value };

          // If fakerType changed, ensure type is faker
          if (key === "fakerType") {
            updated.type = "faker";
          }

          return updated;
        }

        return field;
      }),
    );
  };

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
            Try It Yourself
          </h2>
          <p className="text-base sm:text-lg text-default-600 max-w-2xl mx-auto px-4">
            Create a schema and see your mock data generated instantly. No
            account required.
          </p>
        </motion.div>

        <motion.div
          animate={isInView ? "visible" : "hidden"}
          className="flex justify-center"
          initial="hidden"
          variants={containerVariants}
        >
          {/* macOS Window Mockup */}
          <div className="w-full max-w-6xl">
            <motion.div
              className="bg-content1 rounded-xl sm:rounded-2xl border border-default-200 shadow-2xl overflow-hidden"
              variants={itemVariants}
            >
              {/* macOS Traffic Lights */}
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-default-100 border-b border-default-200">
                <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 text-center min-w-0">
                  <span className="text-xs text-default-500 font-medium truncate block">
                    DevMock - Schema Builder
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Schema Builder */}
                <div className="p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-default-200 bg-default-50/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold">Schema Fields</h3>
                      <p className="text-xs sm:text-sm text-default-600">
                        Define the properties for your resource
                      </p>
                    </div>
                    <Button
                      className="w-full sm:w-auto self-start sm:self-auto"
                      color="primary"
                      size="sm"
                      startContent={<Plus size={16} />}
                      variant="flat"
                      onPress={handleAddField}
                    >
                      Add Field
                    </Button>
                  </div>

                  <div className="space-y-3 sm:space-y-4 max-h-[300px] sm:max-h-[400px] lg:max-h-[450px] overflow-y-auto pr-2">
                    {fields.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-default-300 rounded-lg">
                        <div className="rounded-full bg-default-100 p-4 mb-3">
                          <Plus className="h-6 w-6 text-default-400" />
                        </div>
                        <p className="text-sm text-default-600 mb-2">
                          No fields added yet
                        </p>
                        <p className="text-xs text-default-500 mb-4">
                          Click &quot;Add Field&quot; to start building your
                          schema
                        </p>
                        <Button
                          color="primary"
                          size="sm"
                          startContent={<Plus size={16} />}
                          variant="flat"
                          onPress={handleAddField}
                        >
                          Add Your First Field
                        </Button>
                      </div>
                    ) : (
                      fields.map((field) => (
                        <div
                          key={field.id}
                          className="p-4 px-0 py-2 pb-4 border-b border-default-200 rounded-lg"
                        >
                          <div className="flex-1 items-center gap-1 flex max-md:flex-col w-full">
                            <div className="max-md:w-full flex-auto grid grid-cols-3 max-md:grid-cols-1 gap-3 sm:gap-4">
                              {/* Field Name */}
                              <Input
                                label="Field Name"
                                placeholder="e.g., name, email, price"
                                size="md"
                                value={field.name}
                                variant="bordered"
                                onChange={(e) =>
                                  handleFieldChange(
                                    field.id,
                                    "name",
                                    e.target.value,
                                  )
                                }
                              />

                              {/* Faker Type */}
                              <Select
                                label="Faker Type"
                                placeholder="Select faker type"
                                selectedKeys={
                                  field.fakerType ? [field.fakerType] : []
                                }
                                size="md"
                                variant="bordered"
                                onSelectionChange={(keys) => {
                                  const selectedKey = Array.from(
                                    keys,
                                  )[0] as string;

                                  if (selectedKey) {
                                    handleFieldChange(
                                      field.id,
                                      "fakerType",
                                      selectedKey,
                                    );
                                  }
                                }}
                              >
                                {Array.from(
                                  new Set(FAKER_TYPES.map((f) => f.category)),
                                ).map((category) => {
                                  const categoryItems = FAKER_TYPES.filter(
                                    (item) => item.category === category,
                                  );

                                  return (
                                    <SelectSection
                                      key={category}
                                      title={category}
                                    >
                                      {categoryItems.map((item) => (
                                        <SelectItem key={item.value}>
                                          {item.label}
                                        </SelectItem>
                                      ))}
                                    </SelectSection>
                                  );
                                })}
                              </Select>

                              {/* Delete Button */}
                              <div className="flex items-end">
                                <Button
                                  isIconOnly
                                  className="w-full"
                                  color="danger"
                                  size="md"
                                  variant="light"
                                  onPress={() => handleRemoveField(field.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Record Count Control */}
                  <div className="mt-6 pt-4 border-t border-default-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-default-600 font-medium">
                        Record Count
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          isIconOnly
                          color="default"
                          size="sm"
                          variant="flat"
                          onPress={() =>
                            setRecordCount(Math.max(1, recordCount - 1))
                          }
                        >
                          -
                        </Button>
                        <span className="w-12 text-center font-semibold">
                          {recordCount}
                        </span>
                        <Button
                          isIconOnly
                          color="default"
                          size="sm"
                          variant="flat"
                          onPress={() =>
                            setRecordCount(Math.min(10, recordCount + 1))
                          }
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Preview */}
                <div className="p-4 sm:p-6 bg-content1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                      <h3 className="text-base sm:text-lg font-semibold">Generated Data</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        isIconOnly
                        color={viewMode === "table" ? "primary" : "default"}
                        size="sm"
                        title="Table View"
                        variant={viewMode === "table" ? "solid" : "flat"}
                        onPress={() => setViewMode("table")}
                      >
                        <Database className="h-4 w-4" />
                      </Button>
                      <Button
                        isIconOnly
                        color={viewMode === "json" ? "primary" : "default"}
                        size="sm"
                        title="JSON View"
                        variant={viewMode === "json" ? "solid" : "flat"}
                        onPress={() => setViewMode("json")}
                      >
                        <Code className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] overflow-auto rounded-lg border border-default-200 bg-default-50">
                    {fields.filter((f) => f.name.trim() && f.fakerType)
                      .length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="rounded-full bg-default-100 p-6 mb-4">
                          <Database className="h-12 w-12 text-default-400" />
                        </div>
                        <p className="text-sm text-default-600">
                          Add fields and select faker types to see generated
                          data
                        </p>
                      </div>
                    ) : viewMode === "table" ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-default-200 bg-default-100">
                              <th className="text-left p-3 font-semibold text-default-700">
                                ID
                              </th>
                              {fields
                                .filter((f) => f.name.trim() && f.fakerType)
                                .map((field) => (
                                  <th
                                    key={field.id}
                                    className="text-left p-3 font-semibold text-default-700"
                                  >
                                    {field.name}
                                  </th>
                                ))}
                            </tr>
                          </thead>
                          <tbody>
                            {mockData.map((record, index) => (
                              <tr
                                key={index}
                                className="border-b border-default-100 hover:bg-default-50 transition-colors"
                              >
                                <td className="p-3 text-default-600 font-mono text-xs">
                                  {record.id as string}
                                </td>
                                {fields
                                  .filter((f) => f.name.trim() && f.fakerType)
                                  .map((field) => (
                                    <td
                                      key={field.id}
                                      className="p-3 text-default-600"
                                    >
                                      {String(record[field.name] ?? "-")}
                                    </td>
                                  ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <pre className="p-4 text-xs overflow-auto font-mono text-default-600">
                        {JSON.stringify(mockData, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.div
              animate={isInView ? "visible" : "hidden"}
              className="mt-8 text-center"
              initial="hidden"
              variants={itemVariants}
            >
              <p className="text-sm text-default-500">
                This is a demo.{" "}
                <a className="text-primary hover:underline" href="/login">
                  Sign up
                </a>{" "}
                to create real projects and generate unlimited mock data.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
