import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date string from server (UTC) to local time string
 * Parses the date string as UTC and formats it correctly
 */
export function formatDateTime(dateString: string): string {
  // If the string doesn't end with Z, assume it's UTC and append Z
  const utcString = dateString.endsWith("Z") ? dateString : `${dateString}Z`;
  const date = new Date(utcString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    // Fallback: try parsing without Z
    const fallbackDate = new Date(dateString);

    if (isNaN(fallbackDate.getTime())) {
      return dateString; // Return original if both fail
    }

    return fallbackDate.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/**
 * Format date string to time only (HH:mm:ss)
 * Parses the date string as UTC and formats it correctly
 */
export function formatTime(dateString: string): string {
  // If the string doesn't end with Z, assume it's UTC and append Z
  const utcString = dateString.endsWith("Z") ? dateString : `${dateString}Z`;
  const date = new Date(utcString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    // Fallback: try parsing without Z
    const fallbackDate = new Date(dateString);

    if (isNaN(fallbackDate.getTime())) {
      return dateString; // Return original if both fail
    }

    return fallbackDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/**
 * Format date string to compact date and time (MM/DD HH:mm)
 * Parses the date string as UTC and formats it correctly
 * Used for sidebar/list views where space is limited
 */
export function formatDateTimeCompact(dateString: string): string {
  // If the string doesn't end with Z, assume it's UTC and append Z
  const utcString = dateString.endsWith("Z") ? dateString : `${dateString}Z`;
  const date = new Date(utcString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    // Fallback: try parsing without Z
    const fallbackDate = new Date(dateString);

    if (isNaN(fallbackDate.getTime())) {
      return dateString; // Return original if both fail
    }

    return fallbackDate.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  return date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
