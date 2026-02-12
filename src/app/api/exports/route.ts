import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { ProductType, FlowType, DataSource } from "@prisma/client";

const querySchema = z.object({
  productType: z.enum(["RCN", "KERNEL"]).optional(),
  year: z.coerce.number().optional(),
  startYear: z.coerce.number().optional(),
  endYear: z.coerce.number().optional(),
  reporterCode: z.string().optional(),
  partnerCode: z.string().optional(),
  limit: z.coerce.number().min(1).max(1000).default(100),
  offset: z.coerce.number().min(0).default(0),
  groupBy: z.enum(["year", "partner", "product"]).optional(),
});

// GET /api/exports - List trade data with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = querySchema.parse(searchParams);

    const where: {
      productType?: ProductType;
      flowType?: FlowType;
      year?: number | { gte?: number; lte?: number };
      reporterCode?: string;
      partnerCode?: string;
    } = {
      flowType: "EXPORT",
    };

    if (query.productType) {
      where.productType = query.productType as ProductType;
    }

    if (query.year) {
      where.year = query.year;
    } else if (query.startYear || query.endYear) {
      where.year = {};
      if (query.startYear) {
        (where.year as { gte?: number; lte?: number }).gte = query.startYear;
      }
      if (query.endYear) {
        (where.year as { gte?: number; lte?: number }).lte = query.endYear;
      }
    }

    if (query.reporterCode) {
      where.reporterCode = query.reporterCode;
    }

    if (query.partnerCode) {
      where.partnerCode = query.partnerCode;
    }

    // Handle groupBy queries
    if (query.groupBy) {
      switch (query.groupBy) {
        case "year": {
          const grouped = await prisma.tradeData.groupBy({
            by: ["year", "productType"],
            where,
            _sum: {
              tradeValueUsd: true,
              netWeightKg: true,
            },
            orderBy: { year: "asc" },
          });
          return NextResponse.json({
            success: true,
            data: grouped,
            groupedBy: "year",
          });
        }

        case "partner": {
          const grouped = await prisma.tradeData.groupBy({
            by: ["partnerCode", "partnerName"],
            where,
            _sum: {
              tradeValueUsd: true,
              netWeightKg: true,
            },
            orderBy: {
              _sum: {
                tradeValueUsd: "desc",
              },
            },
          });
          return NextResponse.json({
            success: true,
            data: grouped,
            groupedBy: "partner",
          });
        }

        case "product": {
          const grouped = await prisma.tradeData.groupBy({
            by: ["productType", "hsCode"],
            where,
            _sum: {
              tradeValueUsd: true,
              netWeightKg: true,
            },
          });
          return NextResponse.json({
            success: true,
            data: grouped,
            groupedBy: "product",
          });
        }
      }
    }

    // Standard query
    const [data, total] = await Promise.all([
      prisma.tradeData.findMany({
        where,
        orderBy: [{ year: "desc" }, { tradeValueUsd: "desc" }],
        take: query.limit,
        skip: query.offset,
      }),
      prisma.tradeData.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        limit: query.limit,
        offset: query.offset,
        hasMore: query.offset + data.length < total,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid query parameters", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error fetching exports:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/exports - Create or update trade data (typically from sync)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Expect an array of trade data entries
    const entries = Array.isArray(body) ? body : [body];

    const results = await Promise.all(
      entries.map(async (entry) => {
        return prisma.tradeData.upsert({
          where: {
            year_month_hsCode_flowType_reporterCode_partnerCode_source: {
              year: entry.year,
              month: entry.month || null,
              hsCode: entry.hsCode,
              flowType: entry.flowType || "EXPORT",
              reporterCode: entry.reporterCode,
              partnerCode: entry.partnerCode || null,
              source: entry.source || "MANUAL",
            },
          },
          update: {
            tradeValueUsd: entry.tradeValueUsd,
            netWeightKg: entry.netWeightKg,
            quantity: entry.quantity,
            quantityUnit: entry.quantityUnit,
            rawData: entry.rawData,
            updatedAt: new Date(),
          },
          create: {
            year: entry.year,
            month: entry.month,
            hsCode: entry.hsCode,
            productType: entry.hsCode === "080131" ? "RCN" : "KERNEL",
            flowType: (entry.flowType || "EXPORT") as FlowType,
            reporterCode: entry.reporterCode,
            reporterName: entry.reporterName,
            partnerCode: entry.partnerCode,
            partnerName: entry.partnerName,
            tradeValueUsd: entry.tradeValueUsd,
            netWeightKg: entry.netWeightKg,
            quantity: entry.quantity,
            quantityUnit: entry.quantityUnit,
            source: (entry.source || "MANUAL") as DataSource,
            rawData: entry.rawData,
          },
        });
      })
    );

    return NextResponse.json(
      {
        success: true,
        data: { created: results.length },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating trade data:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
