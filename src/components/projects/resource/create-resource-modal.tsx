import type { Resource } from "@/types/project";

import { useState } from "react";
// import Editor from "@monaco-editor/react";
import { Plus, Trash2 } from "lucide-react";
// import { Code } from "lucide-react"; // For Template Mode
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Select, SelectItem, SelectSection } from "@heroui/select";
// import { Tabs, Tab } from "@heroui/tabs"; // Temporarily disabled - Template Mode removed
import { addToast } from "@heroui/toast";

import { resourcesService } from "@/services/resources.service";
import { validateResourceName } from "@/utils/resource-name-validation";

export interface ResourceField {
  id: string;
  name: string;
  type: string;
  defaultValue: string;
  fakerType?: string;
  required: boolean;
}

/**
 * Field types compatible with Supabase (PostgreSQL)
 * Mapping to Supabase column types:
 * - text -> text or varchar
 * - integer -> integer, bigint, smallint
 * - decimal -> numeric, real, double precision
 * - boolean -> boolean
 * - date -> date
 * - timestamp -> timestamp or timestamptz
 * - uuid -> uuid
 * - json -> jsonb (preferred for performance)
 * - email -> text with email validation
 * - url -> text with url validation
 * - faker -> uses fakerType to determine actual type
 */
export const FIELD_TYPES = [
  { label: "Text", value: "string" },
  { label: "Number", value: "number" },
  { label: "Boolean", value: "boolean" },
  { label: "Date", value: "date" },
  { label: "Timestamp", value: "timestamp" },
  { label: "JSON Object", value: "json" },
  { label: "Faker.js", value: "faker" },
  { label: "UUID", value: "uuid" },
];

/**
 * Helper function to map field type to Supabase column type
 * This will be used for one-click to Supabase feature
 */
export const mapFieldTypeToSupabaseType = (fieldType: string): string => {
  const typeMap: Record<string, string> = {
    string: "text",
    number: "number",
    boolean: "boolean",
    date: "date",
    timestamp: "timestamptz",
    uuid: "uuid",
    json: "jsonb",
  };

  return typeMap[fieldType] || "text";
};

export const FAKER_TYPES = [
  // Person
  { label: "First Name", value: "person.firstName", category: "Person" },
  { label: "Last Name", value: "person.lastName", category: "Person" },
  { label: "Full Name", value: "person.fullName", category: "Person" },
  { label: "Gender", value: "person.gender", category: "Person" },
  { label: "Bio", value: "person.bio", category: "Person" },
  { label: "Job Title", value: "person.jobTitle", category: "Person" },
  // Internet
  { label: "Email", value: "internet.email", category: "Internet" },
  { label: "Username", value: "internet.userName", category: "Internet" },
  { label: "URL", value: "internet.url", category: "Internet" },
  { label: "Avatar", value: "internet.avatar", category: "Internet" },
  { label: "IP Address", value: "internet.ip", category: "Internet" },
  // Location
  { label: "City", value: "location.city", category: "Location" },
  { label: "Country", value: "location.country", category: "Location" },
  { label: "Address", value: "location.streetAddress", category: "Location" },
  { label: "Zip Code", value: "location.zipCode", category: "Location" },
  // Finance
  { label: "Amount", value: "finance.amount", category: "Finance" },
  { label: "Currency", value: "finance.currencyName", category: "Finance" },
  {
    label: "Credit Card",
    value: "finance.creditCardNumber",
    category: "Finance",
  },
  // Company
  { label: "Company Name", value: "company.name", category: "Company" },
  { label: "Catch Phrase", value: "company.catchPhrase", category: "Company" },
  // Phone
  { label: "Phone Number", value: "phone.number", category: "Phone" },
  // Date
  { label: "Past Date", value: "date.past", category: "Date" },
  { label: "Future Date", value: "date.future", category: "Date" },
  { label: "Recent Date", value: "date.recent", category: "Date" },
  // Lorem
  { label: "Word", value: "lorem.word", category: "Lorem" },
  { label: "Sentence", value: "lorem.sentence", category: "Lorem" },
  { label: "Paragraph", value: "lorem.paragraph", category: "Lorem" },
  // Image
  { label: "Image URL", value: "image.url", category: "Image" },
  // Commerce
  {
    label: "Product Name",
    value: "commerce.productName",
    category: "Commerce",
  },
  { label: "Price", value: "commerce.price", category: "Commerce" },
  {
    label: "Department",
    value: "commerce.department",
    category: "Commerce",
  },
];

interface CreateResourceModalProps {
  isOpen: boolean;
  projectId: string;
  onClose: () => void;
  onSuccess?: (resource: Resource) => void;
}

export function CreateResourceModal({
  isOpen,
  projectId,
  onClose,
  onSuccess,
}: CreateResourceModalProps) {
  const [resourceName, setResourceName] = useState("");
  const [mode, setMode] = useState<"schema" | "template">("schema");
  const [fields, setFields] = useState<ResourceField[]>([
    {
      id: "system-id-field",
      name: "id",
      type: "uuid",
      defaultValue: "{{uuid}}",
      required: true,
    },
  ]);
  const [jsonTemplate, setJsonTemplate] = useState<string>(`{
  "id": "{{uuid}}",
  "name": "{{person.fullName}}",
  "email": "{{internet.email}}",
  "age": "{{number}}",
  "isActive": "{{boolean}}",
  "posts": [
    {
      "id": "{{uuid}}",
      "title": "{{lorem.sentence}}",
      "content": "{{lorem.paragraph}}",
      "createdAt": "{{date.recent}}"
    }
  ],
  "comments": [
    {
      "id": "{{uuid}}",
      "content": "{{lorem.paragraph}}",
      "createdAt": "{{date.recent}}"
    }
  ],
  "tags": [
    "{{lorem.word}}",
    "{{lorem.word}}",
    "{{lorem.word}}"
  ],
  "createdAt": "{{date.recent}}"
}`);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const generateId = () => {
    return `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleAddField = () => {
    const newField: ResourceField = {
      id: generateId(),
      name: "",
      type: "faker",
      defaultValue: "",
      required: false,
    };

    setFields([...fields, newField]);
  };

  const handleRemoveField = (id: string) => {
    // Don't allow removing "id" field
    const field = fields.find((f) => f.id === id);

    if (field?.name === "id") {
      return;
    }

    setFields(fields.filter((field) => field.id !== id));
  };

  const handleFieldChange = (
    id: string,
    key: keyof ResourceField,
    value: string | boolean,
  ) => {
    // Don't allow changing "id" field
    const field = fields.find((f) => f.id === id);

    if (field?.name === "id") {
      return;
    }

    setFields(
      fields.map((field) => {
        if (field.id === id) {
          const updated = { ...field, [key]: value };

          // If type changed to faker, clear defaultValue
          if (key === "type" && value === "faker") {
            updated.defaultValue = "";
          }

          // If type changed from faker to something else, clear fakerType
          if (key === "type" && value !== "faker" && field.type === "faker") {
            updated.fakerType = undefined;
          }

          return updated;
        }

        return field;
      }),
    );
  };

  const handleCreate = async () => {
    // Validate resource name format
    const nameValidation = validateResourceName(resourceName);

    if (!nameValidation.isValid) {
      setError(nameValidation.error || "Resource name is invalid");

      return;
    }

    const trimmedName = resourceName.trim();

    // Validate based on mode
    if (mode === "schema") {
      // Validate field names (if fields are added)
      if (fields.length > 0) {
        const emptyFields = fields.filter((field) => !field.name.trim());

        if (emptyFields.length > 0) {
          setError("All fields must have a name");

          return;
        }

        // Check for duplicate field names
        const fieldNames = fields.map((field) =>
          field.name.trim().toLowerCase(),
        );
        const duplicates = fieldNames.filter(
          (name, index) => fieldNames.indexOf(name) !== index,
        );

        if (duplicates.length > 0) {
          setError("Field names must be unique");

          return;
        }

        // Validate faker types
        const fakerFieldsWithoutType = fields.filter(
          (field) => field.type === "faker" && !field.fakerType,
        );

        if (fakerFieldsWithoutType.length > 0) {
          setError("Please select a faker type for all faker fields");

          return;
        }
      }
    } else {
      // Validate JSON template
      try {
        const parsed = JSON.parse(jsonTemplate);

        if (
          typeof parsed !== "object" ||
          parsed === null ||
          Array.isArray(parsed)
        ) {
          setError("JSON template must be a valid object");

          return;
        }
      } catch {
        setError("Invalid JSON template. Please check your syntax.");

        return;
      }
    }

    try {
      setIsCreating(true);
      setError("");

      // Check name availability before creating
      const nameCheck = await resourcesService.checkNameAvailability(
        projectId,
        trimmedName,
      );

      if (!nameCheck.available) {
        setError(
          nameCheck.message ||
            `Resource name "${trimmedName}" already exists in this project`,
        );

        return;
      }

      // Build payload based on mode
      const payload: {
        name: string;
        mode?: "schema" | "template";
        fields?: Array<{
          name: string;
          type: string;
          fakerType?: string | null;
        }>;
        jsonTemplate?: string;
      } = {
        name: trimmedName,
        mode,
      };

      if (mode === "schema") {
        // Build fields array for API (exclude "id" field - backend doesn't need it)
        const userFields = fields.filter((field) => field.name !== "id");
        const fieldsPayload =
          userFields.length > 0
            ? userFields.map((field) => ({
                name: field.name.trim(),
                type: field.type,
                fakerType:
                  field.type === "faker" ? field.fakerType || null : null,
              }))
            : undefined;

        if (fieldsPayload && fieldsPayload.length > 0) {
          payload.fields = fieldsPayload;
        }
      } else {
        payload.jsonTemplate = jsonTemplate;
      }

      // Call API to create resource
      const createdResource = await resourcesService.create(projectId, payload);

      addToast({
        title: "Resource created successfully",
        description: `Resource "${createdResource.name}" has been created.`,
        color: "success",
        variant: "flat",
      });

      onSuccess?.(createdResource);
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create resource. Please try again.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setResourceName("");
    setMode("schema");
    setFields([
      {
        id: "system-id-field",
        name: "id",
        type: "uuid",
        defaultValue: "{{uuid}}",
        required: true,
      },
    ]);
    setJsonTemplate(`{
  "id": "{{uuid}}",
  "name": "{{person.fullName}}",
  "email": "{{internet.email}}",
  "age": "{{number}}",
  "isActive": "{{boolean}}",
  "posts": [
    {
      "id": "{{uuid}}",
      "title": "{{lorem.sentence}}",
      "content": "{{lorem.paragraph}}",
      "createdAt": "{{date.recent}}"
    }
  ],
  "comments": [
    {
      "id": "{{uuid}}",
      "content": "{{lorem.paragraph}}",
      "createdAt": "{{date.recent}}"
    }
  ],
  "tags": [
    "{{lorem.word}}",
    "{{lorem.word}}",
    "{{lorem.word}}"
  ],
  "createdAt": "{{date.recent}}"
}`);
    setError("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      placement="center"
      scrollBehavior="outside"
      size="3xl"
      onClose={handleClose}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold">Create New Resource</h2>
        </ModalHeader>
        <ModalBody className="">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Resource Name */}
          <div className="">
            <Input
              description="Examples: users, user-posts, order_items"
              label="Resource Name"
              placeholder="e.g., users, products, posts"
              size="lg"
              value={resourceName}
              variant="bordered"
              onChange={(e) => {
                // Convert to lowercase automatically
                const value = e.target.value.toLowerCase();

                setResourceName(value);
                setError("");
              }}
            />
          </div>

          {/* Schema Fields */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Schema Fields</h3>
                <p className="text-sm text-default-600">
                  Define the properties for your resource
                </p>
              </div>
              <Button
                color="primary"
                size="sm"
                startContent={<Plus size={16} />}
                variant="flat"
                onPress={handleAddField}
              >
                Add Field
              </Button>
            </div>

            {fields.length === 0 ||
            (fields.length === 1 && fields[0]?.name === "id") ? (
              <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-default-300 rounded-lg">
                <div className="rounded-full bg-default-100 p-4 mb-3">
                  <Plus className="h-6 w-6 text-default-400" />
                </div>
                <p className="text-sm text-default-600 mb-2">
                  No fields added yet
                </p>
                <p className="text-xs text-default-500 mb-4">
                  Click &quot;Add Field&quot; to start building your schema
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
              <div className="space-y-4">
                {fields.map((field) => {
                  const isIdField = field.name === "id";

                  return (
                    <div
                      key={field.id}
                      className="p-4 px-0 py-2 pb-4 border-b border-default-200 rounded-lg"
                    >
                      <div className="flex-1 items-center gap-1 flex max-md:flex-col w-full">
                        <div className="max-md:w-full flex-auto grid grid-cols-3 max-md:grid-cols-1 gap-4">
                          {/* Field Name */}
                          <Input
                            isDisabled={isIdField}
                            label="Field Name"
                            placeholder="e.g., name, email, price"
                            size="md"
                            value={field.name}
                            variant="bordered"
                            onChange={(e) => {
                              if (!isIdField) {
                                handleFieldChange(
                                  field.id,
                                  "name",
                                  e.target.value,
                                );
                              }
                            }}
                          />

                          {/* Field Type */}
                          <Select
                            isDisabled={isIdField}
                            label="Field Type"
                            placeholder="Select field type"
                            selectedKeys={[field.type]}
                            size="md"
                            variant="bordered"
                            onSelectionChange={(keys) => {
                              if (!isIdField) {
                                const selectedKey = Array.from(
                                  keys,
                                )[0] as string;

                                if (selectedKey) {
                                  handleFieldChange(
                                    field.id,
                                    "type",
                                    selectedKey,
                                  );
                                }
                              }
                            }}
                          >
                            {FIELD_TYPES.map((type) => (
                              <SelectItem key={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </Select>

                          {/* Default Value or Faker Type */}
                          {field.type === "faker" ? (
                            <Select
                              isDisabled={isIdField}
                              label="Faker Type"
                              placeholder="Select faker type"
                              selectedKeys={
                                field.fakerType ? [field.fakerType] : []
                              }
                              size="md"
                              variant="bordered"
                              onSelectionChange={(keys) => {
                                if (!isIdField) {
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
                          ) : (
                            <Input
                              description="Default value for this field"
                              isDisabled={isIdField}
                              label="Default Value (Optional)"
                              placeholder="e.g., John Doe, 0, true"
                              size="md"
                              value={field.defaultValue}
                              variant="bordered"
                              onChange={(e) => {
                                if (!isIdField) {
                                  handleFieldChange(
                                    field.id,
                                    "defaultValue",
                                    e.target.value,
                                  );
                                }
                              }}
                            />
                          )}
                        </div>
                        {!isIdField && (
                          <Button
                            isIconOnly
                            color="danger"
                            size="sm"
                            variant="light"
                            onPress={() => handleRemoveField(field.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
                <Button
                  color="primary"
                  size="sm"
                  startContent={<Plus size={16} />}
                  variant="flat"
                  onPress={handleAddField}
                >
                  Add Field
                </Button>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter className="sticky bottom-0 bg-background z-10 rounded-b-2xl">
          <Button color="danger" variant="light" onPress={handleClose}>
            Cancel
          </Button>
          <Button color="primary" isLoading={isCreating} onPress={handleCreate}>
            Create Resource
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
