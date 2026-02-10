import type { CommoditiesApiResponse } from "@/types";

const BASE_URL = "https://www.commodities-api.com/api";

interface CommoditiesApiParams {
  symbols?: string | string[];
  base?: string;
  date?: string;
  start_date?: string;
  end_date?: string;
}

/**
 * Get API key from environment
 */
function getApiKey(): string {
  const apiKey = process.env.COMMODITIES_API_KEY;
  if (!apiKey) {
    throw new Error("COMMODITIES_API_KEY is not configured");
  }
  return apiKey;
}

/**
 * Fetch latest commodity prices
 */
export async function fetchLatestPrices(
  symbols: string[] = ["CASHEW"],
  base: string = "USD"
): Promise<CommoditiesApiResponse> {
  const apiKey = getApiKey();

  const url = new URL(`${BASE_URL}/latest`);
  url.searchParams.set("access_key", apiKey);
  url.searchParams.set("base", base);
  url.searchParams.set("symbols", symbols.join(","));

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!response.ok) {
    throw new Error(`Commodities API error: ${response.status}`);
  }

  const json = await response.json();

  if (!json.success) {
    throw new Error(`Commodities API error: ${json.error?.info || "Unknown error"}`);
  }

  return json;
}

/**
 * Fetch historical price for a specific date
 */
export async function fetchHistoricalPrice(
  date: string, // YYYY-MM-DD format
  symbols: string[] = ["CASHEW"],
  base: string = "USD"
): Promise<CommoditiesApiResponse> {
  const apiKey = getApiKey();

  const url = new URL(`${BASE_URL}/${date}`);
  url.searchParams.set("access_key", apiKey);
  url.searchParams.set("base", base);
  url.searchParams.set("symbols", symbols.join(","));

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 86400 }, // Cache for 24 hours (historical data doesn't change)
  });

  if (!response.ok) {
    throw new Error(`Commodities API error: ${response.status}`);
  }

  const json = await response.json();

  if (!json.success) {
    throw new Error(`Commodities API error: ${json.error?.info || "Unknown error"}`);
  }

  return json;
}

/**
 * Fetch time series data
 */
export async function fetchTimeSeries(params: {
  startDate: string;
  endDate: string;
  symbols?: string[];
  base?: string;
}): Promise<{
  success: boolean;
  timeseries: boolean;
  start_date: string;
  end_date: string;
  base: string;
  rates: Record<string, Record<string, number>>;
}> {
  const apiKey = getApiKey();
  const { startDate, endDate, symbols = ["CASHEW"], base = "USD" } = params;

  const url = new URL(`${BASE_URL}/timeseries`);
  url.searchParams.set("access_key", apiKey);
  url.searchParams.set("start_date", startDate);
  url.searchParams.set("end_date", endDate);
  url.searchParams.set("base", base);
  url.searchParams.set("symbols", symbols.join(","));

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(`Commodities API error: ${response.status}`);
  }

  const json = await response.json();

  if (!json.success) {
    throw new Error(`Commodities API error: ${json.error?.info || "Unknown error"}`);
  }

  return json;
}

/**
 * Fetch price fluctuation between two dates
 */
export async function fetchFluctuation(params: {
  startDate: string;
  endDate: string;
  symbols?: string[];
  base?: string;
}): Promise<{
  success: boolean;
  fluctuation: boolean;
  start_date: string;
  end_date: string;
  base: string;
  rates: Record<string, {
    start_rate: number;
    end_rate: number;
    change: number;
    change_pct: number;
  }>;
}> {
  const apiKey = getApiKey();
  const { startDate, endDate, symbols = ["CASHEW"], base = "USD" } = params;

  const url = new URL(`${BASE_URL}/fluctuation`);
  url.searchParams.set("access_key", apiKey);
  url.searchParams.set("start_date", startDate);
  url.searchParams.set("end_date", endDate);
  url.searchParams.set("base", base);
  url.searchParams.set("symbols", symbols.join(","));

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Commodities API error: ${response.status}`);
  }

  const json = await response.json();

  if (!json.success) {
    throw new Error(`Commodities API error: ${json.error?.info || "Unknown error"}`);
  }

  return json;
}

/**
 * Get OHLC (Open, High, Low, Close) data
 */
export async function fetchOHLC(params: {
  startDate: string;
  endDate: string;
  symbols?: string[];
  base?: string;
}): Promise<{
  success: boolean;
  rates: Record<string, {
    open: number;
    high: number;
    low: number;
    close: number;
  }>;
}> {
  const apiKey = getApiKey();
  const { startDate, endDate, symbols = ["CASHEW"], base = "USD" } = params;

  const url = new URL(`${BASE_URL}/ohlc`);
  url.searchParams.set("access_key", apiKey);
  url.searchParams.set("start_date", startDate);
  url.searchParams.set("end_date", endDate);
  url.searchParams.set("base", base);
  url.searchParams.set("symbols", symbols.join(","));

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Commodities API error: ${response.status}`);
  }

  const json = await response.json();

  if (!json.success) {
    throw new Error(`Commodities API error: ${json.error?.info || "Unknown error"}`);
  }

  return json;
}

/**
 * Get current cashew price in USD per tonne
 * Note: This is a convenience wrapper that converts the API response to a more usable format
 */
export async function getCurrentCashewPrice(): Promise<{
  pricePerTonne: number;
  date: string;
  timestamp: number;
}> {
  try {
    const response = await fetchLatestPrices(["CASHEW"], "USD");

    // The API returns prices per unit (usually per lb or kg)
    // We need to convert to per tonne
    const pricePerUnit = response.rates["CASHEW"];

    // Assuming the unit is per lb, convert to per tonne (1 tonne = 2204.62 lbs)
    const pricePerTonne = pricePerUnit * 2204.62;

    return {
      pricePerTonne,
      date: response.date,
      timestamp: response.timestamp,
    };
  } catch {
    // Return mock data if API is not configured
    return {
      pricePerTonne: 1500, // Approximate market price
      date: new Date().toISOString().split("T")[0],
      timestamp: Date.now(),
    };
  }
}

/**
 * Check if API is available and configured
 */
export function isApiConfigured(): boolean {
  return !!process.env.COMMODITIES_API_KEY;
}
