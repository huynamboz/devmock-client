/**
 * Validates resource name according to API endpoint naming convention
 * Pattern: ^[a-z][a-z0-9-_]*[a-z0-9]$|^[a-z]$
 *
 * Rules:
 * - Only lowercase (a-z)
 * - Must start and end with alphanumeric characters (a-z, 0-9)
 * - Can contain hyphens (-) or underscores (_) in the middle
 * - Min length: 1 character
 * - Max length: 50 characters
 */
export function validateResourceName(name: string): {
  isValid: boolean;
  error?: string;
} {
  const trimmedName = name.trim();

  // Check if empty
  if (!trimmedName) {
    return {
      isValid: false,
      error: "Resource name is required",
    };
  }

  // Check minimum length
  if (trimmedName.length < 1) {
    return {
      isValid: false,
      error: "Resource name must be at least 1 character",
    };
  }

  // Check maximum length
  if (trimmedName.length > 50) {
    return {
      isValid: false,
      error: "Resource name must not exceed 50 characters",
    };
  }

  // Check pattern: ^[a-z][a-z0-9-_]*[a-z0-9]$|^[a-z]$
  const pattern = /^[a-z]([a-z0-9-_]*[a-z0-9])?$/;

  if (!pattern.test(trimmedName)) {
    // Provide more specific error messages
    if (/[A-Z]/.test(trimmedName)) {
      return {
        isValid: false,
        error: "Resource name must be lowercase only (no uppercase letters)",
      };
    }

    if (trimmedName.startsWith("-") || trimmedName.startsWith("_")) {
      return {
        isValid: false,
        error: "Resource name cannot start with a hyphen (-) or underscore (_)",
      };
    }

    if (trimmedName.endsWith("-") || trimmedName.endsWith("_")) {
      return {
        isValid: false,
        error: "Resource name cannot end with a hyphen (-) or underscore (_)",
      };
    }

    if (/\s/.test(trimmedName)) {
      return {
        isValid: false,
        error: "Resource name cannot contain spaces",
      };
    }

    if (!/^[a-z]/.test(trimmedName)) {
      return {
        isValid: false,
        error: "Resource name must start with a lowercase letter (a-z)",
      };
    }

    return {
      isValid: false,
      error: "Resource name format is invalid. Use lowercase letters, numbers, hyphens, or underscores.",
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Examples of valid names: users, user-posts, posts, order_items, products
 * Examples of invalid names: Users, -users, users-, user posts
 */
export const RESOURCE_NAME_PATTERN = /^[a-z]([a-z0-9-_]*[a-z0-9])?$/;

export const RESOURCE_NAME_EXAMPLES = {
  valid: ["users", "user-posts", "posts", "order_items", "products", "categories"],
  invalid: ["Users", "-users", "users-", "user posts", "users_", "_users"],
};

