import { brands, Brand } from './mockData';

/**
 * Converts a brand name to a URL-friendly slug
 * @param name - The brand name to slugify
 * @returns URL-friendly slug (lowercase, spaces to hyphens, special chars removed)
 */
export function slugifyBrandName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
}

/**
 * Retrieves a brand by its ID from the mock data
 * @param id - The UUID string identifier of the brand
 * @returns The brand object if found, null otherwise
 */
export function getBrandById(id: string): Brand | null {
  const brand = brands.find((b) => b.id === id);
  return brand || null;
}

/**
 * Retrieves a brand by its slugified name from the mock data
 * @param slug - The slugified brand name (e.g., "gong-cha")
 * @returns The brand object if found, null otherwise
 */
export function getBrandByName(slug: string): Brand | null {
  const brand = brands.find((b) => slugifyBrandName(b.name) === slug);
  return brand || null;
}

/**
 * Retrieves all brands from the mock data
 * @returns Array of all brand objects
 */
export function getAllBrands(): Brand[] {
  return brands;
}

