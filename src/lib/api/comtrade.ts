import type { ComtradeResponse, ComtradeDataItem } from "@/types";
import { HS_CODES } from "@/types";

const BASE_URL = "https://comtradeapi.un.org/data/v1/get";
const PREVIEW_URL = "https://comtradeapi.un.org/public/v1/preview";

// Comtrade country codes (UN M49)
export const COMTRADE_COUNTRIES = {
  CI: 384, // Côte d'Ivoire
  VN: 704, // Vietnam
  IN: 356, // India
  NG: 566, // Nigeria
  GH: 288, // Ghana
  BJ: 204, // Benin
  TZ: 834, // Tanzania
  MZ: 508, // Mozambique
  CN: 156, // China
  US: 842, // USA
  NL: 528, // Netherlands
  WORLD: 0, // World (all partners)
} as const;

export const COMTRADE_FLOWS = {
  EXPORT: "X",
  IMPORT: "M",
  RE_EXPORT: "RX",
  RE_IMPORT: "RM",
} as const;

interface ComtradeParams {
  reporterCode?: number | number[];
  partnerCode?: number | null;
  cmdCode?: string | string[];
  flowCode?: string;
  period?: string | number;
  freqCode?: "A" | "M"; // Annual or Monthly
  maxRecords?: number;
}

/**
 * Fetch trade data from UN Comtrade API (public preview)
 * No API key required for preview endpoint
 */
export async function fetchTradeData(params: ComtradeParams): Promise<ComtradeDataItem[]> {
  const {
    reporterCode = COMTRADE_COUNTRIES.CI,
    partnerCode = null,
    cmdCode = [HS_CODES.RCN, HS_CODES.KERNEL],
    flowCode = COMTRADE_FLOWS.EXPORT,
    period,
    freqCode = "A",
    maxRecords = 5000,
  } = params;

  const reporters = Array.isArray(reporterCode) ? reporterCode.join(",") : reporterCode;
  const cmdCodes = Array.isArray(cmdCode) ? cmdCode.join(",") : cmdCode;

  const url = new URL(PREVIEW_URL);
  url.searchParams.set("typeCode", "C"); // Commodities
  url.searchParams.set("freqCode", freqCode);
  url.searchParams.set("clCode", "HS");
  url.searchParams.set("reporterCode", String(reporters));

  if (partnerCode !== null) {
    url.searchParams.set("partnerCode", String(partnerCode));
  }

  url.searchParams.set("cmdCode", cmdCodes);
  url.searchParams.set("flowCode", flowCode);

  if (period) {
    url.searchParams.set("period", String(period));
  }

  url.searchParams.set("maxRecords", String(maxRecords));

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Comtrade API error: ${response.status} - ${errorText}`);
  }

  const json = await response.json() as ComtradeResponse;

  if (json.error) {
    throw new Error(`Comtrade API error: ${json.error}`);
  }

  return json.data || [];
}

/**
 * Fetch with API key (for higher limits)
 */
export async function fetchTradeDataAuthenticated(
  params: ComtradeParams,
  apiKey: string
): Promise<ComtradeDataItem[]> {
  const {
    reporterCode = COMTRADE_COUNTRIES.CI,
    partnerCode = null,
    cmdCode = [HS_CODES.RCN, HS_CODES.KERNEL],
    flowCode = COMTRADE_FLOWS.EXPORT,
    period,
    freqCode = "A",
    maxRecords = 100000,
  } = params;

  const reporters = Array.isArray(reporterCode) ? reporterCode.join(",") : reporterCode;
  const cmdCodes = Array.isArray(cmdCode) ? cmdCode.join(",") : cmdCode;

  const url = new URL(BASE_URL);
  url.searchParams.set("typeCode", "C");
  url.searchParams.set("freqCode", freqCode);
  url.searchParams.set("clCode", "HS");
  url.searchParams.set("reporterCode", String(reporters));

  if (partnerCode !== null) {
    url.searchParams.set("partnerCode", String(partnerCode));
  }

  url.searchParams.set("cmdCode", cmdCodes);
  url.searchParams.set("flowCode", flowCode);

  if (period) {
    url.searchParams.set("period", String(period));
  }

  url.searchParams.set("maxRecords", String(maxRecords));

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "Ocp-Apim-Subscription-Key": apiKey,
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Comtrade API error: ${response.status}`);
  }

  const json = await response.json() as ComtradeResponse;
  return json.data || [];
}

/**
 * Get CI exports data grouped by destination
 */
export async function getCIExportsByDestination(
  year?: number,
  productType?: "RCN" | "KERNEL"
): Promise<{
  partner: string;
  partnerCode: number;
  volumeKg: number;
  valueUsd: number;
  productType: string;
}[]> {
  const period = year || new Date().getFullYear() - 1;
  const cmdCode = productType
    ? productType === "RCN" ? HS_CODES.RCN : HS_CODES.KERNEL
    : [HS_CODES.RCN, HS_CODES.KERNEL];

  const data = await fetchTradeData({
    reporterCode: COMTRADE_COUNTRIES.CI,
    cmdCode,
    flowCode: COMTRADE_FLOWS.EXPORT,
    period,
  });

  // Group by partner
  const byPartner = new Map<number, {
    partner: string;
    partnerCode: number;
    volumeKg: number;
    valueUsd: number;
    productType: string;
  }>();

  for (const item of data) {
    const key = item.partnerCode;
    const existing = byPartner.get(key) || {
      partner: item.partnerDesc,
      partnerCode: item.partnerCode,
      volumeKg: 0,
      valueUsd: 0,
      productType: item.cmdCode === HS_CODES.RCN ? "RCN" : "KERNEL",
    };

    existing.volumeKg += item.netWgt || 0;
    existing.valueUsd += item.primaryValue || 0;

    byPartner.set(key, existing);
  }

  return Array.from(byPartner.values())
    .sort((a, b) => b.valueUsd - a.valueUsd);
}

/**
 * Get CI exports time series
 */
export async function getCIExportsTimeSeries(
  startYear: number,
  endYear?: number
): Promise<{
  year: number;
  rcnVolumeKg: number;
  rcnValueUsd: number;
  kernelVolumeKg: number;
  kernelValueUsd: number;
}[]> {
  const end = endYear || new Date().getFullYear() - 1;
  const years = [];
  for (let y = startYear; y <= end; y++) {
    years.push(y);
  }

  const results = [];

  for (const year of years) {
    try {
      const data = await fetchTradeData({
        reporterCode: COMTRADE_COUNTRIES.CI,
        cmdCode: [HS_CODES.RCN, HS_CODES.KERNEL],
        flowCode: COMTRADE_FLOWS.EXPORT,
        period: year,
      });

      let rcnVolumeKg = 0;
      let rcnValueUsd = 0;
      let kernelVolumeKg = 0;
      let kernelValueUsd = 0;

      for (const item of data) {
        if (item.cmdCode === HS_CODES.RCN) {
          rcnVolumeKg += item.netWgt || 0;
          rcnValueUsd += item.primaryValue || 0;
        } else if (item.cmdCode === HS_CODES.KERNEL) {
          kernelVolumeKg += item.netWgt || 0;
          kernelValueUsd += item.primaryValue || 0;
        }
      }

      results.push({
        year,
        rcnVolumeKg,
        rcnValueUsd,
        kernelVolumeKg,
        kernelValueUsd,
      });
    } catch {
      // Skip years with errors
      console.warn(`Failed to fetch data for year ${year}`);
    }
  }

  return results.sort((a, b) => a.year - b.year);
}

/**
 * Compare exports across producing countries
 */
export async function compareCountryExports(
  countries: number[] = [
    COMTRADE_COUNTRIES.CI,
    COMTRADE_COUNTRIES.VN,
    COMTRADE_COUNTRIES.IN,
    COMTRADE_COUNTRIES.NG,
    COMTRADE_COUNTRIES.GH,
  ],
  year?: number
): Promise<{
  country: string;
  countryCode: number;
  rcnValueUsd: number;
  kernelValueUsd: number;
  totalValueUsd: number;
}[]> {
  const period = year || new Date().getFullYear() - 1;

  const data = await fetchTradeData({
    reporterCode: countries,
    cmdCode: [HS_CODES.RCN, HS_CODES.KERNEL],
    flowCode: COMTRADE_FLOWS.EXPORT,
    period,
  });

  // Group by reporter
  const byCountry = new Map<number, {
    country: string;
    countryCode: number;
    rcnValueUsd: number;
    kernelValueUsd: number;
  }>();

  for (const item of data) {
    const key = item.reporterCode;
    const existing = byCountry.get(key) || {
      country: item.reporterDesc,
      countryCode: item.reporterCode,
      rcnValueUsd: 0,
      kernelValueUsd: 0,
    };

    if (item.cmdCode === HS_CODES.RCN) {
      existing.rcnValueUsd += item.primaryValue || 0;
    } else {
      existing.kernelValueUsd += item.primaryValue || 0;
    }

    byCountry.set(key, existing);
  }

  return Array.from(byCountry.values())
    .map((c) => ({
      ...c,
      totalValueUsd: c.rcnValueUsd + c.kernelValueUsd,
    }))
    .sort((a, b) => b.totalValueUsd - a.totalValueUsd);
}
