import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { ProductType, PriceType, DataSource } from "@prisma/client";

const createPriceSchema = z.object({
  date: z.string().transform((s) => new Date(s)),
  productType: z.enum(["RCN", "KERNEL"]),
  priceType: z.enum(["FARMGATE", "FOB", "CIF"]),
  priceUsd: z.number().positive(),
  priceFcfa: z.number().positive().optional(),
  grade: z.string().optional(),
  origin: z.string().optional(),
  destination: z.string().optional(),
  source: z.enum(["MANUAL", "FAOSTAT", "COMTRADE", "TRIDGE", "COMMODITIES", "CCA"]).default("MANUAL"),
  notes: z.string().optional(),
});

const querySchema = z.object({
  productType: z.enum(["RCN", "KERNEL"]).optional(),
  priceType: z.enum(["FARMGATE", "FOB", "CIF"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().min(1).max(1000).default(100),
  offset: z.coerce.number().min(0).default(0),
});

// GET /api/prices - List prices with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = querySchema.parse(searchParams);

    const where: {
      productType?: ProductType;
      priceType?: PriceType;
      date?: { gte?: Date; lte?: Date };
    } = {};

    if (query.productType) {
      where.productType = query.productType as ProductType;
    }

    if (query.priceType) {
      where.priceType = query.priceType as PriceType;
    }

    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) {
        where.date.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.date.lte = new Date(query.endDate);
      }
    }

    const [prices, total] = await Promise.all([
      prisma.priceEntry.findMany({
        where,
        orderBy: { date: "desc" },
        take: query.limit,
        skip: query.offset,
      }),
      prisma.priceEntry.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: prices,
      pagination: {
        total,
        limit: query.limit,
        offset: query.offset,
        hasMore: query.offset + prices.length < total,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid query parameters", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error fetching prices:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/prices - Create a new price entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createPriceSchema.parse(body);

    const price = await prisma.priceEntry.create({
      data: {
        date: data.date,
        productType: data.productType as ProductType,
        priceType: data.priceType as PriceType,
        priceUsd: data.priceUsd,
        priceFcfa: data.priceFcfa,
        grade: data.grade,
        origin: data.origin,
        destination: data.destination,
        source: data.source as DataSource,
        notes: data.notes,
      },
    });

    return NextResponse.json(
      { success: true, data: price },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid request body", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating price:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/prices?id=xxx - Delete a price entry
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Price ID is required" },
        { status: 400 }
      );
    }

    await prisma.priceEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting price:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
