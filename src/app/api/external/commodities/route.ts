import { NextRequest, NextResponse } from "next/server";
import {
  fetchLatestPrices,
  fetchHistoricalPrice,
  fetchTimeSeries,
  fetchFluctuation,
  getCurrentCashewPrice,
  isApiConfigured,
} from "@/lib/api/commodities-api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action") || "latest";
  const symbols = searchParams.get("symbols")?.split(",") || ["CASHEW"];
  const base = searchParams.get("base") || "USD";
  const date = searchParams.get("date");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  // Check if API is configured
  if (!isApiConfigured()) {
    // Return mock data for development
    return NextResponse.json({
      success: true,
      data: {
        pricePerTonne: 1500,
        date: new Date().toISOString().split("T")[0],
        source: "mock",
        message: "COMMODITIES_API_KEY not configured - returning mock data",
      },
    });
  }

  try {
    switch (action) {
      case "current-cashew": {
        const data = await getCurrentCashewPrice();
        return NextResponse.json({
          success: true,
          data,
          source: "Commodities-API",
        });
      }

      case "historical": {
        if (!date) {
          return NextResponse.json(
            {
              success: false,
              error: "date parameter is required for historical data",
            },
            { status: 400 }
          );
        }
        const data = await fetchHistoricalPrice(date, symbols, base);
        return NextResponse.json({
          success: true,
          data,
          source: "Commodities-API",
        });
      }

      case "timeseries": {
        if (!startDate || !endDate) {
          return NextResponse.json(
            {
              success: false,
              error: "startDate and endDate parameters are required for timeseries",
            },
            { status: 400 }
          );
        }
        const data = await fetchTimeSeries({
          startDate,
          endDate,
          symbols,
          base,
        });
        return NextResponse.json({
          success: true,
          data,
          source: "Commodities-API",
        });
      }

      case "fluctuation": {
        if (!startDate || !endDate) {
          return NextResponse.json(
            {
              success: false,
              error: "startDate and endDate parameters are required for fluctuation",
            },
            { status: 400 }
          );
        }
        const data = await fetchFluctuation({
          startDate,
          endDate,
          symbols,
          base,
        });
        return NextResponse.json({
          success: true,
          data,
          source: "Commodities-API",
        });
      }

      case "latest":
      default: {
        const data = await fetchLatestPrices(symbols, base);
        return NextResponse.json({
          success: true,
          data,
          source: "Commodities-API",
        });
      }
    }
  } catch (error) {
    console.error("Commodities API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
