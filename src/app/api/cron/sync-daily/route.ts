import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { fetchTradeData, COMTRADE_COUNTRIES } from "@/lib/api/comtrade";
import { getCIProduction } from "@/lib/api/faostat";
import { HS_CODES } from "@/types";

// This endpoint is called by Vercel Cron at 2 AM daily
export async function GET(request: Request) {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {
    comtrade: { success: false, records: 0, error: null as string | null },
    faostat: { success: false, records: 0, error: null as string | null },
  };

  try {
    // Sync Comtrade data
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    const comtradeData = await fetchTradeData({
      reporterCode: COMTRADE_COUNTRIES.CI,
      cmdCode: [HS_CODES.RCN, HS_CODES.KERNEL],
      flowCode: "X",
      period: lastYear,
    });

    // Insert or update trade data
    let comtradeRecords = 0;
    for (const item of comtradeData) {
      // Check if record exists
      const existing = await prisma.tradeData.findFirst({
        where: {
          year: item.refYear,
          hsCode: item.cmdCode,
          flowType: "EXPORT",
          reporterCode: String(item.reporterCode),
          partnerCode: item.partnerCode ? String(item.partnerCode) : null,
          source: "COMTRADE",
        },
      });

      if (existing) {
        await prisma.tradeData.update({
          where: { id: existing.id },
          data: {
            tradeValueUsd: item.primaryValue || 0,
            netWeightKg: item.netWgt || null,
            rawData: item as object,
            updatedAt: new Date(),
          },
        });
      } else {
        await prisma.tradeData.create({
          data: {
            year: item.refYear,
            month: item.refMonth || null,
            hsCode: item.cmdCode,
            productType: item.cmdCode === HS_CODES.RCN ? "RCN" : "KERNEL",
            flowType: "EXPORT",
            reporterCode: String(item.reporterCode),
            reporterName: item.reporterDesc,
            partnerCode: item.partnerCode ? String(item.partnerCode) : null,
            partnerName: item.partnerDesc || null,
            tradeValueUsd: item.primaryValue || 0,
            netWeightKg: item.netWgt || null,
            source: "COMTRADE",
            rawData: item as object,
          },
        });
      }
      comtradeRecords++;
    }

    results.comtrade = { success: true, records: comtradeRecords, error: null };
  } catch (error) {
    results.comtrade.error = error instanceof Error ? error.message : "Unknown error";
  }

  try {
    // Sync FAOSTAT production data
    const productionData = await getCIProduction(2015);

    let faoRecords = 0;
    for (const item of productionData) {
      // Check if record exists
      const existing = await prisma.productionData.findFirst({
        where: {
          year: item.year,
          countryCode: "107",
          productType: "RCN",
          source: "FAOSTAT",
        },
      });

      if (existing) {
        await prisma.productionData.update({
          where: { id: existing.id },
          data: {
            production: item.production || null,
            area: item.area || null,
            yield: item.yield || null,
            rawData: item as object,
            updatedAt: new Date(),
          },
        });
      } else {
        await prisma.productionData.create({
          data: {
            year: item.year,
            countryCode: "107",
            countryName: "Côte d'Ivoire",
            productType: "RCN",
            production: item.production || null,
            area: item.area || null,
            yield: item.yield || null,
            source: "FAOSTAT",
            rawData: item as object,
          },
        });
      }
      faoRecords++;
    }

    results.faostat = { success: true, records: faoRecords, error: null };
  } catch (error) {
    results.faostat.error = error instanceof Error ? error.message : "Unknown error";
  }

  // Log sync results
  console.log("Daily sync completed:", results);

  return NextResponse.json({
    success: results.comtrade.success || results.faostat.success,
    timestamp: new Date().toISOString(),
    results,
  });
}
