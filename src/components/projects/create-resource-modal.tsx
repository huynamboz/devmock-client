import type { Resource } from "@/types/project";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Select, SelectItem, SelectSection } from "@heroui/select";
import { addToast } from "@heroui/toast";

import { resourcesService } from "@/services/resources.service";
import { validateResourceName } from "@/utils/resource-name-validation";

interface ResourceField {
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
const FIELD_TYPES = [
  { label: "Faker.js", value: "faker" },
  { label: "Text", value: "text" },
  { label: "Integer", value: "integer" },
  { label: "Decimal", value: "decimal" },
  { label: "Boolean", value: "boolean" },
  { label: "Date", value: "date" },
  { label: "Timestamp", value: "timestamp" },
  { label: "UUID", value: "uuid" },
  { label: "JSON", value: "json" },
  { label: "Email", value: "email" },
  { label: "URL", value: "url" },
];

/**
 * Helper function to map field type to Supabase column type
 * This will be used for one-click to Supabase feature
 */
export const mapFieldTypeToSupabaseType = (fieldType: string): string => {
  const typeMap: Record<string, string> = {
    text: "text",
    integer: "integer",
    decimal: "numeric",
    boolean: "boolean",
    date: "date",
    timestamp: "timestamptz",
    uuid: "uuid",
    json: "jsonb",
    email: "text",
    url: "text",
  };

  return typeMap[fieldType] || "text";
};

const FAKER_TYPES = [
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
  const [fields, setFields] = useState<ResourceField[]>([]);
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
    setFields(fields.filter((field) => field.id !== id));
  };

  const handleFieldChange = (
    id: string,
    key: keyof ResourceField,
    value: string | boolean,
  ) => {
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

    // Validate field names (if fields are added)
    if (fields.length > 0) {
      const emptyFields = fields.filter((field) => !field.name.trim());

      if (emptyFields.length > 0) {
        setError("All fields must have a name");

        return;
      }

      // Check for duplicate field names
      const fieldNames = fields.map((field) => field.name.trim().toLowerCase());
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

    try {
      setIsCreating(true);
      setError("");

      // Build fields array for API
      const fieldsPayload =
        fields.length > 0
          ? fields.map((field) => ({
              name: field.name.trim(),
              type: field.type,
              fakerType:
                field.type === "faker" ? field.fakerType || null : null,
            }))
          : undefined;

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

      // Call API to create resource with fields
      const createdResource = await resourcesService.create(projectId, {
        name: trimmedName,
        ...(fieldsPayload && { fields: fieldsPayload }),
      });

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
    setFields([]);
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
          <p className="text-sm text-default-600 font-normal">
            Define your resource schema and properties
          </p>
        </ModalHeader>
        <ModalBody className="">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

                {/* Resource Name */}
                <div className="mb-6">
                  <Input
                    description="Lowercase letters, numbers, hyphens (-) or underscores (_). Must start and end with alphanumeric. Max 50 characters. Examples: users, user-posts, order_items"
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

            {fields.length === 0 ? (
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
                {fields.map((field) => (
                  <div
                    key={field.id}
                    className="p-4 py-2 border-b border-default-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-4">
                      {/* Required */}
                      <Checkbox
                        isSelected={field.required}
                        size="md"
                        onValueChange={(checked) => {
                          handleFieldChange(field.id, "required", checked);
                        }}
                      >
                        <span className="text-sm font-medium text-default-700 cursor-pointer">
                          Required Field
                        </span>
                      </Checkbox>
                      <Button
                        isIconOnly
                        color="danger"
                        size="sm"
                        variant="light"
                        onPress={() => handleRemoveField(field.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 max-md:grid-cols-1 gap-4">
                      {/* Field Name */}
                      <Input
                        description="Property name (camelCase recommended)"
                        label="Field Name"
                        placeholder="e.g., name, email, price"
                        size="md"
                        value={field.name}
                        variant="bordered"
                        onChange={(e) => {
                          handleFieldChange(field.id, "name", e.target.value);
                        }}
                      />

                      {/* Field Type */}
                      <Select
                        label="Field Type"
                        placeholder="Select field type"
                        selectedKeys={[field.type]}
                        size="md"
                        variant="bordered"
                        onSelectionChange={(keys) => {
                          const selectedKey = Array.from(keys)[0] as string;

                          if (selectedKey) {
                            handleFieldChange(field.id, "type", selectedKey);
                          }
                        }}
                      >
                        {FIELD_TYPES.map((type) => (
                          <SelectItem key={type.value}>{type.label}</SelectItem>
                        ))}
                      </Select>

                      {/* Default Value or Faker Type */}
                      {field.type === "faker" ? (
                        <Select
                          description="Select the type of fake data to generate"
                          label="Faker Type"
                          placeholder="Select faker type"
                          selectedKeys={
                            field.fakerType ? [field.fakerType] : []
                          }
                          size="md"
                          variant="bordered"
                          onSelectionChange={(keys) => {
                            const selectedKey = Array.from(keys)[0] as string;

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
                              <SelectSection key={category} title={category}>
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
                          label="Default Value (Optional)"
                          placeholder="e.g., John Doe, 0, true"
                          size="md"
                          value={field.defaultValue}
                          variant="bordered"
                          onChange={(e) => {
                            handleFieldChange(
                              field.id,
                              "defaultValue",
                              e.target.value,
                            );
                          }}
                        />
                      )}
                    </div>
                  </div>
                ))}
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
