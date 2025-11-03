import type { Resource } from "@/types/project";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
import { addToast } from "@heroui/toast";

import {
  FIELD_TYPES,
  FAKER_TYPES,
  ResourceField,
} from "./create-resource-modal";

import { resourcesService } from "@/services/resources.service";
import { validateResourceName } from "@/utils/resource-name-validation";

interface EditResourceModalProps {
  isOpen: boolean;
  resourceId: string | null;
  onClose: () => void;
  onSuccess?: (resource: Resource) => void;
}

export function EditResourceModal({
  isOpen,
  resourceId,
  onClose,
  onSuccess,
}: EditResourceModalProps) {
  const [resource, setResource] = useState<Resource | null>(null);
  const [resourceName, setResourceName] = useState("");
  const [fields, setFields] = useState<ResourceField[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isOpen && resourceId) {
      loadResource();
    } else {
      // Reset when modal closes
      setResource(null);
      setResourceName("");
      setFields([]);
      setError("");
    }
  }, [isOpen, resourceId]);

  const loadResource = async () => {
    if (!resourceId) {
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const data = await resourcesService.getById(resourceId);

      setResource(data);
      setResourceName(data.name || "");

      // Parse fields from API response (fields array)
      if (data.fields && Array.isArray(data.fields)) {
        const parsedFields: ResourceField[] = data.fields.map((field) => ({
          id: field.id,
          name: field.name,
          type: field.type,
          defaultValue: field.type === "faker" ? "" : "",
          fakerType: field.fakerType || undefined,
          required: false, // API doesn't return required field yet
        }));

        setFields([
          {
            id: "system-id-field",
            name: "id",
            type: "uuid",
            defaultValue: "{{uuid}}",
            required: true,
          },
          ...parsedFields,
        ]);
      } else if (data.data && typeof data.data === "object") {
        // Fallback: Parse from legacy data object format
        const schema = data.data as Record<string, unknown>;
        const parsedFields: ResourceField[] = [];

        Object.entries(schema).forEach(([fieldName, fieldConfig]) => {
          if (typeof fieldConfig === "object" && fieldConfig !== null) {
            const config = fieldConfig as Record<string, unknown>;

            parsedFields.push({
              id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: fieldName,
              type: (config.type as string) || "text",
              defaultValue:
                config.type === "faker"
                  ? ""
                  : (config.defaultValue as string) || "",
              fakerType:
                config.type === "faker"
                  ? (config.fakerType as string)
                  : undefined,
              required: (config.required as boolean) || false,
            });
          }
        });

        setFields([
          {
            id: "system-id-field",
            name: "id",
            type: "uuid",
            defaultValue: "{{uuid}}",
            required: true,
          },
          ...parsedFields,
        ]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load resource. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleUpdate = async () => {
    if (!resourceId) {
      return;
    }

    // Validate resource name format
    const nameValidation = validateResourceName(resourceName);

    if (!nameValidation.isValid) {
      setError(nameValidation.error || "Resource name is invalid");

      return;
    }

    const trimmedName = resourceName.trim();

    // Check if name changed and check availability
    const originalName = resource?.name || "";

    if (trimmedName !== originalName) {
      // Name changed, need to check availability
      if (!resource?.projectId) {
        setError("Cannot check name availability: project ID is missing");

        return;
      }

      try {
        const nameCheck = await resourcesService.checkNameAvailability(
          resource.projectId,
          trimmedName,
        );

        if (!nameCheck.available) {
          setError(
            nameCheck.message ||
              `Resource name "${trimmedName}" already exists in this project`,
          );

          return;
        }
      } catch (err) {
        // If check fails, still try to update (might be a network error)
        // eslint-disable-next-line no-console
        console.warn("Failed to check name availability:", err);
      }
    }

    // Validate field names (if fields are added)
    // remove the id field from the fields array
    const fieldsWithoutId = fields.filter((field) => field.name !== "id");

    if (fieldsWithoutId.length > 0) {
      const emptyFields = fieldsWithoutId.filter((field) => !field.name.trim());

      if (emptyFields.length > 0) {
        setError("All fields must have a name");

        return;
      }

      // Check for duplicate field names
      const fieldNames = fieldsWithoutId.map((field) =>
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
      const fakerFieldsWithoutType = fieldsWithoutId.filter(
        (field) => field.type === "faker" && !field.fakerType,
      );

      if (fakerFieldsWithoutType.length > 0) {
        setError("Please select a faker type for all faker fields");

        return;
      }
    }

    try {
      setIsUpdating(true);
      setError("");

      const fieldsPayload = fieldsWithoutId.map((field) => ({
        name: field.name.trim(),
        type: field.type,
        fakerType: field.type === "faker" ? field.fakerType || null : null,
      }));

      // Call API to update resource
      const updatedResource = await resourcesService.update(resourceId, {
        name: trimmedName,
        fields: fieldsPayload,
      });

      addToast({
        title: "Resource updated successfully",
        description: `Resource "${updatedResource.name}" has been updated.`,
        color: "success",
        variant: "flat",
      });

      onSuccess?.(updatedResource);
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update resource. Please try again.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setResource(null);
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
          <h2 className="text-2xl font-semibold">Edit Resource</h2>
        </ModalHeader>
        <ModalBody className="">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-default-600">Loading resource...</p>
            </div>
          ) : error ? (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          ) : (
            <>
              {/* Resource Name */}
              <div className="">
                <Input
                  description="Examples: users, user-posts, order_items"
                  label="Resource Name"
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
                      Manage the properties for your resource
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
            </>
          )}
        </ModalBody>
        <ModalFooter className="sticky bottom-0 bg-background z-10 rounded-b-2xl">
          <Button color="danger" variant="light" onPress={handleClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            isDisabled={isLoading}
            isLoading={isUpdating}
            onPress={handleUpdate}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
