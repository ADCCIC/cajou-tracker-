import type { FOBCalculation, CIFCalculation, PriceCalculationResult } from "@/types";

// Default values based on market data
export const DEFAULT_VALUES = {
  // Exchange rate USD/FCFA (approximately 600 FCFA = 1 USD)
  EXCHANGE_RATE: 600,

  // DUS (Droit Unique de Sortie) - 5% for RCN, 0% for kernels since Nov 2024
  DUS_RATE_RCN: 0.05,
  DUS_RATE_KERNEL: 0,

  // Transport costs (FCFA/tonne) - from production zones to port
  TRANSPORT_COST_DEFAULT: 25000, // ~$42/tonne

  // Port handling costs (FCFA/tonne)
  HANDLING_COST_DEFAULT: 15000, // ~$25/tonne

  // Insurance rate (% of FOB value)
  INSURANCE_RATE_DEFAULT: 0.005, // 0.5%

  // Freight costs by destination (USD/tonne)
  FREIGHT_COSTS: {
    VN: 85, // Vietnam
    IN: 75, // India
    CN: 90, // China
    EU: 60, // Europe
    US: 95, // USA
    DEFAULT: 80,
  } as Record<string, number>,

  // Conversion ratio RCN to Kernels
  RCN_TO_KERNEL_RATIO: 0.22, // 1 tonne RCN = ~220 kg kernels (20-22%)
  KOR_STANDARD: 47, // Kernel Out-turn Ratio standard (47-48 lbs/80kg bag)
};

/**
 * Calculate FOB price from farmgate price
 */
export function calculateFOB(input: FOBCalculation): PriceCalculationResult {
  const quantityKg = input.quantity * 1000;

  // Farmgate total
  const farmgateTotalFcfa = input.farmgatePrice * quantityKg;

  // Transport (per tonne)
  const transportTotalFcfa = input.transportCost * input.quantity;

  // Handling (per tonne)
  const handlingTotalFcfa = input.handlingCost * input.quantity;

  // Other costs (per tonne)
  const otherTotalFcfa = input.otherCosts * input.quantity;

  // Subtotal before DUS
  const subtotalFcfa = farmgateTotalFcfa + transportTotalFcfa + handlingTotalFcfa + otherTotalFcfa;

  // DUS (calculated on CAF value for exports)
  const dusTotalFcfa = subtotalFcfa * input.dusRate;

  // Total cost in FCFA
  const totalCostFcfa = subtotalFcfa + dusTotalFcfa;

  // Convert to USD
  const fobPriceUsd = totalCostFcfa / input.exchangeRate;
  const fobPricePerTonneUsd = fobPriceUsd / input.quantity;

  return {
    farmgateTotalFcfa,
    transportTotalFcfa,
    handlingTotalFcfa,
    dusTotalFcfa,
    otherTotalFcfa,
    totalCostFcfa,
    fobPriceUsd,
    fobPricePerTonneUsd,
  };
}

/**
 * Calculate CIF price from FOB
 */
export function calculateCIF(input: CIFCalculation): PriceCalculationResult {
  const fobResult = calculateFOB(input);

  // Get freight cost for destination
  const freightPerTonne = DEFAULT_VALUES.FREIGHT_COSTS[input.destination]
    || input.freightCost
    || DEFAULT_VALUES.FREIGHT_COSTS.DEFAULT;

  const freightTotalUsd = freightPerTonne * input.quantity;

  // Insurance (percentage of FOB value)
  const insuranceTotalUsd = fobResult.fobPriceUsd * input.insuranceRate;

  // CIF = FOB + Freight + Insurance
  const cifPriceUsd = fobResult.fobPriceUsd + freightTotalUsd + insuranceTotalUsd;
  const cifPricePerTonneUsd = cifPriceUsd / input.quantity;

  return {
    ...fobResult,
    freightTotalUsd,
    insuranceTotalUsd,
    cifPriceUsd,
    cifPricePerTonneUsd,
  };
}

/**
 * Convert RCN quantity to expected kernel output
 */
export function rcnToKernels(rcnTonnes: number, korRatio?: number): number {
  const ratio = korRatio
    ? korRatio / 80 // Convert KOR (lbs/80kg bag) to percentage
    : DEFAULT_VALUES.RCN_TO_KERNEL_RATIO;
  return rcnTonnes * ratio;
}

/**
 * Convert kernels to equivalent RCN quantity
 */
export function kernelsToRcn(kernelTonnes: number, korRatio?: number): number {
  const ratio = korRatio
    ? korRatio / 80
    : DEFAULT_VALUES.RCN_TO_KERNEL_RATIO;
  return kernelTonnes / ratio;
}

/**
 * Calculate transformation rate (percentage of RCN processed locally)
 */
export function calculateTransformationRate(
  rcnProduction: number,
  rcnExports: number
): number {
  if (rcnProduction === 0) return 0;
  const processed = rcnProduction - rcnExports;
  return Math.max(0, Math.min(100, (processed / rcnProduction) * 100));
}

/**
 * Calculate year-over-year change
 */
export function calculateYoYChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format currency in FCFA
 */
export function formatFCFA(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(value) + " FCFA";
}

/**
 * Format currency in USD
 */
export function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format weight in tonnes
 */
export function formatTonnes(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(value) + " t";
}

/**
 * Convert FCFA to USD
 */
export function fcfaToUsd(fcfa: number, rate?: number): number {
  return fcfa / (rate || DEFAULT_VALUES.EXCHANGE_RATE);
}

/**
 * Convert USD to FCFA
 */
export function usdToFcfa(usd: number, rate?: number): number {
  return usd * (rate || DEFAULT_VALUES.EXCHANGE_RATE);
}
