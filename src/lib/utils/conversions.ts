import { COUNTRY_CODES, HS_CODES } from "@/types";

/**
 * Get country info by any code type
 */
export function getCountryByCode(code: string): typeof COUNTRY_CODES[keyof typeof COUNTRY_CODES] | undefined {
  for (const key of Object.keys(COUNTRY_CODES) as (keyof typeof COUNTRY_CODES)[]) {
    const country = COUNTRY_CODES[key];
    if (
      country.fao === code ||
      country.iso3 === code ||
      country.comtrade === code ||
      key === code
    ) {
      return country;
    }
  }
  return undefined;
}

/**
 * Convert FAO country code to Comtrade code
 */
export function faoToComtrade(faoCode: string): string | undefined {
  const country = getCountryByCode(faoCode);
  return country?.comtrade;
}

/**
 * Convert Comtrade code to FAO country code
 */
export function comtradeToFao(comtradeCode: string): string | undefined {
  const country = getCountryByCode(comtradeCode);
  return country?.fao;
}

/**
 * Get product type from HS code
 */
export function getProductTypeFromHsCode(hsCode: string): "RCN" | "KERNEL" | undefined {
  const normalizedCode = hsCode.replace(/\./g, "").substring(0, 6);
  if (normalizedCode === HS_CODES.RCN) return "RCN";
  if (normalizedCode === HS_CODES.KERNEL) return "KERNEL";
  return undefined;
}

/**
 * Get HS code from product type
 */
export function getHsCodeFromProductType(productType: "RCN" | "KERNEL"): string {
  return productType === "RCN" ? HS_CODES.RCN : HS_CODES.KERNEL;
}

/**
 * Format HS code with dot separator
 */
export function formatHsCode(hsCode: string): string {
  const clean = hsCode.replace(/\./g, "");
  if (clean.length >= 6) {
    return `${clean.slice(0, 4)}.${clean.slice(4, 6)}`;
  }
  return clean;
}

/**
 * Parse date from various formats
 */
export function parseDate(dateStr: string): Date | null {
  // Try ISO format
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) return date;

  // Try DD/MM/YYYY format
  const ddmmyyyy = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyy) {
    date = new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`);
    if (!isNaN(date.getTime())) return date;
  }

  // Try YYYY format (year only)
  const yearOnly = dateStr.match(/^(\d{4})$/);
  if (yearOnly) {
    return new Date(`${yearOnly[1]}-01-01`);
  }

  return null;
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string, format: "short" | "long" | "year" = "short"): string {
  const d = typeof date === "string" ? new Date(date) : date;

  switch (format) {
    case "year":
      return d.getFullYear().toString();
    case "long":
      return d.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    case "short":
    default:
      return d.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
  }
}

/**
 * Get year range for API queries
 */
export function getYearRange(startYear: number, endYear?: number): string {
  const end = endYear || new Date().getFullYear();
  return `${startYear}:${end}`;
}

/**
 * Convert kg to tonnes
 */
export function kgToTonnes(kg: number): number {
  return kg / 1000;
}

/**
 * Convert tonnes to kg
 */
export function tonnesToKg(tonnes: number): number {
  return tonnes * 1000;
}

/**
 * Normalize decimal value from various formats
 */
export function normalizeDecimal(value: string | number): number {
  if (typeof value === "number") return value;

  // Remove thousands separators and handle decimal separators
  const normalized = value
    .replace(/\s/g, "") // Remove spaces
    .replace(/,(?=\d{3})/g, "") // Remove comma thousands separator
    .replace(/\.(?=\d{3})/g, "") // Remove dot thousands separator
    .replace(",", "."); // Convert comma decimal to dot

  return parseFloat(normalized) || 0;
}

/**
 * Generate cache key for API requests
 */
export function generateCacheKey(
  source: string,
  params: Record<string, string | number | undefined>
): string {
  const sortedParams = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  return `${source}:${sortedParams}`;
}
