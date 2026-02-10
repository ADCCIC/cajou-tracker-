import { NextRequest, NextResponse } from "next/server";
import {
  fetchTradeData,
  getCIExportsByDestination,
  getCIExportsTimeSeries,
  compareCountryExports,
  COMTRADE_COUNTRIES,
  COMTRADE_FLOWS,
} from "@/lib/api/comtrade";
import { HS_CODES } from "@/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action") || "exports";
  const year = searchParams.get("year")
    ? parseInt(searchParams.get("year")!)
    : undefined;
  const startYear = parseInt(searchParams.get("startYear") || "2015");
  const endYear = parseInt(
    searchParams.get("endYear") || String(new Date().getFullYear() - 1)
  );
  const productType = searchParams.get("productType") as "RCN" | "KERNEL" | null;

  try {
    switch (action) {
      case "ci-destinations": {
        const data = await getCIExportsByDestination(
          year,
          productType || undefined
        );
        return NextResponse.json({
          success: true,
          data,
          source: "UN Comtrade",
          year: year || new Date().getFullYear() - 1,
        });
      }

      case "ci-timeseries": {
        const data = await getCIExportsTimeSeries(startYear, endYear);
        return NextResponse.json({
          success: true,
          data,
          source: "UN Comtrade",
        });
      }

      case "compare-exports": {
        const countriesParam = searchParams.get("countries");
        const countries = countriesParam
          ? countriesParam.split(",").map((c) => {
              const key = c.toUpperCase() as keyof typeof COMTRADE_COUNTRIES;
              return COMTRADE_COUNTRIES[key] || parseInt(c);
            })
          : undefined;
        const data = await compareCountryExports(countries, year);
        return NextResponse.json({
          success: true,
          data,
          source: "UN Comtrade",
          year: year || new Date().getFullYear() - 1,
        });
      }

      case "exports":
      default: {
        const countryParam = searchParams.get("country") || "CI";
        const countryKey =
          countryParam.toUpperCase() as keyof typeof COMTRADE_COUNTRIES;
        const countryCode =
          COMTRADE_COUNTRIES[countryKey] || parseInt(countryParam);

        const cmdCode = productType
          ? productType === "RCN"
            ? HS_CODES.RCN
            : HS_CODES.KERNEL
          : [HS_CODES.RCN, HS_CODES.KERNEL];

        const data = await fetchTradeData({
          reporterCode: countryCode,
          cmdCode,
          flowCode: COMTRADE_FLOWS.EXPORT,
          period: year,
        });

        return NextResponse.json({
          success: true,
          data,
          source: "UN Comtrade",
          count: data.length,
        });
      }
    }
  } catch (error) {
    console.error("Comtrade API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
