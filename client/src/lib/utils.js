import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Get initials from a name string
 * @param {string} name - Full name (e.g., "John Doe")
 * @returns {string} Initials (e.g., "JD"), max 2 characters
 */
export function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
