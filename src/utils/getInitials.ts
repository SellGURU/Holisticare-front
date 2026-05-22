/**
 * Returns up to 2 uppercase initials from a person's name.
 * Empty/invalid input returns an empty string.
 */
export const getInitials = (name?: string | null): string => {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

export default getInitials;
