import type { FAOStatResponse, FAOStatDataItem } from "@/types";

const BASE_URL = "https://fenixservices.fao.org/faostat/api/v1/en";

// FAO Element codes
export const FAO_ELEMENTS = {
  AREA_HARVESTED: 5312, // Area harvested (ha)
  PRODUCTION: 5510, // Production (tonnes)
  YIELD: 5419, // Yield (hg/ha)
} as const;

// FAO Item codes
export const FAO_ITEMS = {
  CASHEW_IN_SHELL: 217, // Cashew nuts, in shell
  CASHEW_SHELLED: 218, // Cashew nuts, shelled
} as const;

// FAO Area codes for main cashew countries
export const FAO_COUNTRIES = {
  CI: 107, // Côte d'Ivoire
  VN: 237, // Vietnam
  IN: 100, // India
  NG: 159, // Nigeria
  GH: 81, // Ghana
  BJ: 53, // Benin
  TZ: 215, // Tanzania
  MZ: 144, // Mozambique
  WORLD: 5000, // World total
} as const;

interface FAOStatParams {
  area?: number | number[];
  element?: number | number[];
  item?: number | number[];
  year?: string | number; // Can be "2015:2023" for range
}

/**
 * Fetch production data from FAOSTAT API
 */
export async function fetchProduction(params: FAOStatParams): Promise<FAOStatDataItem[]> {
  const {
    area = FAO_COUNTRIES.CI,
    element = FAO_ELEMENTS.PRODUCTION,
    item = FAO_ITEMS.CASHEW_IN_SHELL,
    year = `2015:${new Date().getFullYear()}`,
  } = params;

  const areas = Array.isArray(area) ? area.join(",") : area;
  const elements = Array.isArray(element) ? element.join(",") : element;
  const items = Array.isArray(item) ? item.join(",") : item;

  const url = new URL(`${BASE_URL}/data/QCL`);
  url.searchParams.set("area", String(areas));
  url.searchParams.set("element", String(elements));
  url.searchParams.set("item", String(items));
  url.searchParams.set("year", String(year));
  url.searchParams.set("output_type", "json");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 86400 }, // Cache for 24 hours
  });

  if (!response.ok) {
    throw new Error(`FAOSTAT API error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json() as FAOStatResponse;
  return json.data || [];
}

/**
 * Fetch trade data from FAOSTAT
 */
export async function fetchTrade(params: {
  reporter?: number;
  partner?: number;
  element?: number;
  item?: number;
  year?: string | number;
}): Promise<FAOStatDataItem[]> {
  const {
    reporter = FAO_COUNTRIES.CI,
    partner,
    element = 5910, // Export Quantity
    item = FAO_ITEMS.CASHEW_IN_SHELL,
    year = `2015:${new Date().getFullYear()}`,
  } = params;

  const url = new URL(`${BASE_URL}/data/TCL`);
  url.searchParams.set("area", String(reporter));
  if (partner) url.searchParams.set("partner", String(partner));
  url.searchParams.set("element", String(element));
  url.searchParams.set("item", String(item));
  url.searchParams.set("year", String(year));
  url.searchParams.set("output_type", "json");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error(`FAOSTAT API error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json() as FAOStatResponse;
  return json.data || [];
}

/**
 * Fetch country list from FAOSTAT
 */
export async function fetchCountries(): Promise<{ code: number; name: string }[]> {
  const url = `${BASE_URL}/definitions/types/area`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 604800 }, // Cache for 1 week
  });

  if (!response.ok) {
    throw new Error(`FAOSTAT API error: ${response.status}`);
  }

  const json = await response.json();
  return json.data?.map((item: { code: number; label: string }) => ({
    code: item.code,
    name: item.label,
  })) || [];
}

/**
 * Get Côte d'Ivoire cashew production for a year range
 */
export async function getCIProduction(startYear: number, endYear?: number) {
  const end = endYear || new Date().getFullYear();
  const data = await fetchProduction({
    area: FAO_COUNTRIES.CI,
    element: [FAO_ELEMENTS.PRODUCTION, FAO_ELEMENTS.AREA_HARVESTED, FAO_ELEMENTS.YIELD],
    item: FAO_ITEMS.CASHEW_IN_SHELL,
    year: `${startYear}:${end}`,
  });

  // Group by year
  const byYear = new Map<number, {
    production?: number;
    area?: number;
    yield?: number;
  }>();

  for (const item of data) {
    const yearData = byYear.get(item.Year) || {};

    switch (item["Element Code"]) {
      case FAO_ELEMENTS.PRODUCTION:
        yearData.production = item.Value;
        break;
      case FAO_ELEMENTS.AREA_HARVESTED:
        yearData.area = item.Value;
        break;
      case FAO_ELEMENTS.YIELD:
        yearData.yield = item.Value;
        break;
    }

    byYear.set(item.Year, yearData);
  }

  return Array.from(byYear.entries())
    .map(([year, values]) => ({
      year,
      ...values,
    }))
    .sort((a, b) => a.year - b.year);
}

/**
 * Compare production across main cashew producing countries
 */
export async function compareCountryProduction(
  countries: number[] = [
    FAO_COUNTRIES.CI,
    FAO_COUNTRIES.VN,
    FAO_COUNTRIES.IN,
    FAO_COUNTRIES.NG,
    FAO_COUNTRIES.GH,
  ],
  year?: number
) {
  const targetYear = year || new Date().getFullYear() - 1;

  const data = await fetchProduction({
    area: countries,
    element: FAO_ELEMENTS.PRODUCTION,
    item: FAO_ITEMS.CASHEW_IN_SHELL,
    year: targetYear,
  });

  return data
    .map((item) => ({
      country: item.Area,
      countryCode: item["Area Code"],
      production: item.Value,
      year: item.Year,
      unit: item.Unit,
    }))
    .sort((a, b) => (b.production || 0) - (a.production || 0));
}
