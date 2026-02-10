import { NextRequest, NextResponse } from "next/server";
import {
  fetchProduction,
  getCIProduction,
  compareCountryProduction,
  FAO_COUNTRIES,
  FAO_ELEMENTS,
  FAO_ITEMS,
} from "@/lib/api/faostat";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action") || "production";
  const startYear = parseInt(searchParams.get("startYear") || "2015");
  const endYear = parseInt(searchParams.get("endYear") || String(new Date().getFullYear()));
  const country = searchParams.get("country") || "CI";

  try {
    switch (action) {
      case "ci-production": {
        const data = await getCIProduction(startYear, endYear);
        return NextResponse.json({
          success: true,
          data,
          source: "FAOSTAT",
        });
      }

      case "compare-production": {
        const countriesParam = searchParams.get("countries");
        const countries = countriesParam
          ? countriesParam.split(",").map((c) => {
              const key = c.toUpperCase() as keyof typeof FAO_COUNTRIES;
              return FAO_COUNTRIES[key] || parseInt(c);
            })
          : undefined;
        const year = parseInt(searchParams.get("year") || String(endYear));
        const data = await compareCountryProduction(countries, year);
        return NextResponse.json({
          success: true,
          data,
          source: "FAOSTAT",
        });
      }

      case "production":
      default: {
        const countryKey = country.toUpperCase() as keyof typeof FAO_COUNTRIES;
        const countryCode = FAO_COUNTRIES[countryKey] || parseInt(country);

        const data = await fetchProduction({
          area: countryCode,
          element: [FAO_ELEMENTS.PRODUCTION, FAO_ELEMENTS.AREA_HARVESTED],
          item: FAO_ITEMS.CASHEW_IN_SHELL,
          year: `${startYear}:${endYear}`,
        });

        return NextResponse.json({
          success: true,
          data,
          source: "FAOSTAT",
        });
      }
    }
  } catch (error) {
    console.error("FAOSTAT API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
