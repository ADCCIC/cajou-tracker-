// Re-export Prisma types
export {
  ProductType,
  PriceType,
  FlowType,
  DataSource,
  AlertCondition,
} from "@prisma/client";

// Country codes reference
export const COUNTRY_CODES = {
  CI: { fao: "49", iso3: "CIV", comtrade: "384", name: "Côte d'Ivoire" },
  VN: { fao: "252", iso3: "VNM", comtrade: "704", name: "Vietnam" },
  IN: { fao: "100", iso3: "IND", comtrade: "356", name: "India" },
  NG: { fao: "158", iso3: "NGA", comtrade: "566", name: "Nigeria" },
  GH: { fao: "81", iso3: "GHA", comtrade: "288", name: "Ghana" },
  BJ: { fao: "53", iso3: "BEN", comtrade: "204", name: "Benin" },
  TZ: { fao: "215", iso3: "TZA", comtrade: "834", name: "Tanzania" },
  MZ: { fao: "144", iso3: "MOZ", comtrade: "508", name: "Mozambique" },
} as const;

// HS Codes for cashew products
export const HS_CODES = {
  RCN: "080131", // Raw Cashew Nuts in shell
  KERNEL: "080132", // Cashew kernels (shelled)
} as const;

// Kernel grades
export const KERNEL_GRADES = [
  "WW180", // Whole White 180 count/pound
  "WW210",
  "WW240",
  "WW320",
  "WW450",
  "SW", // Scorched Wholes
  "SS", // Scorched Splits
  "LP", // Large Pieces
  "SP", // Small Pieces
  "BB", // Butts & Brokens
] as const;

export type KernelGrade = (typeof KERNEL_GRADES)[number];

// API Response types
export interface FAOStatResponse {
  data: FAOStatDataItem[];
  metadata?: Record<string, unknown>;
}

export interface FAOStatDataItem {
  Area: string;
  "Area Code": number;
  Item: string;
  "Item Code": number;
  Element: string;
  "Element Code": number;
  Year: number;
  Unit: string;
  Value: number;
  Flag?: string;
}

export interface ComtradeResponse {
  count: number;
  data: ComtradeDataItem[];
  error?: string;
}

export interface ComtradeDataItem {
  typeCode: string;
  freqCode: string;
  refPeriodId: number;
  refYear: number;
  refMonth: number;
  period: string;
  reporterCode: number;
  reporterISO: string;
  reporterDesc: string;
  flowCode: string;
  flowDesc: string;
  partnerCode: number;
  partnerISO: string;
  partnerDesc: string;
  partner2Code?: number;
  partner2ISO?: string;
  partner2Desc?: string;
  cmdCode: string;
  cmdDesc: string;
  aggrLevel: number;
  isLeaf: number;
  customsCode?: string;
  customsDesc?: string;
  mosCode?: string;
  motCode?: string;
  motDesc?: string;
  qtyUnitCode: number;
  qtyUnitAbbr: string;
  qty?: number;
  isQtyEstimated: number;
  altQtyUnitCode?: number;
  altQtyUnitAbbr?: string;
  altQty?: number;
  isAltQtyEstimated?: number;
  netWgt?: number;
  isNetWgtEstimated?: number;
  grossWgt?: number;
  isGrossWgtEstimated?: number;
  cifvalue?: number;
  fobvalue?: number;
  primaryValue: number;
  legacyEstimationFlag?: number;
  isReported: number;
  isAggregate: number;
}

export interface CommoditiesApiResponse {
  success: boolean;
  timestamp: number;
  date: string;
  base: string;
  rates: Record<string, number>;
  unit?: string;
}

// Price calculation types
export interface FOBCalculation {
  farmgatePrice: number; // FCFA/kg
  quantity: number; // tonnes
  transportCost: number; // FCFA/tonne
  handlingCost: number; // FCFA/tonne
  dusRate: number; // 5% for RCN, 0% for kernels
  otherCosts: number; // FCFA/tonne
  exchangeRate: number; // USD/FCFA
}

export interface CIFCalculation extends FOBCalculation {
  destination: string;
  freightCost: number; // USD/tonne
  insuranceRate: number; // % of FOB value
}

export interface PriceCalculationResult {
  farmgateTotalFcfa: number;
  transportTotalFcfa: number;
  handlingTotalFcfa: number;
  dusTotalFcfa: number;
  otherTotalFcfa: number;
  totalCostFcfa: number;
  fobPriceUsd: number;
  fobPricePerTonneUsd: number;
  cifPriceUsd?: number;
  cifPricePerTonneUsd?: number;
  freightTotalUsd?: number;
  insuranceTotalUsd?: number;
}

// Dashboard data types
export interface ExportSummary {
  year: number;
  rcnVolumeTonnes: number;
  rcnValueUsd: number;
  kernelVolumeTonnes: number;
  kernelValueUsd: number;
  transformationRate: number;
}

export interface PriceSummary {
  date: string;
  rcnFarmgateFcfa: number | null;
  rcnFobUsd: number | null;
  kernelFobUsd: number | null;
  change24h: number | null;
}

export interface DestinationData {
  country: string;
  countryCode: string;
  volumeTonnes: number;
  valueUsd: number;
  share: number;
}

// Chart data types
export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface MultiSeriesDataPoint {
  date: string;
  [key: string]: string | number;
}

// Alert types
export interface AlertConfig {
  productType: "RCN" | "KERNEL";
  priceType?: "FARMGATE" | "FOB" | "CIF";
  grade?: string;
  condition: "ABOVE" | "BELOW" | "CHANGE_PERCENT";
  thresholdValue: number;
  notifyEmail: boolean;
  notifySms: boolean;
  phoneNumber?: string;
}

// Upload types
export interface UploadPreview {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  errors: string[];
}

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
}
