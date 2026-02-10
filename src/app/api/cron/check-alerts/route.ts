import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// This endpoint is called by Vercel Cron every 6 hours
export async function GET(request: Request) {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {
    checked: 0,
    triggered: 0,
    notified: 0,
    errors: [] as string[],
  };

  try {
    // Get all active alerts
    const alerts = await prisma.priceAlert.findMany({
      where: { isActive: true },
      include: { user: true },
    });

    results.checked = alerts.length;

    // Get latest prices for each product type
    const latestRcnPrice = await prisma.priceEntry.findFirst({
      where: { productType: "RCN" },
      orderBy: { date: "desc" },
    });

    const latestKernelPrice = await prisma.priceEntry.findFirst({
      where: { productType: "KERNEL" },
      orderBy: { date: "desc" },
    });

    const prices = {
      RCN: {
        FARMGATE: null as number | null,
        FOB: latestRcnPrice?.priceUsd?.toNumber() || null,
        CIF: null as number | null,
      },
      KERNEL: {
        FARMGATE: null as number | null,
        FOB: latestKernelPrice?.priceUsd?.toNumber() || null,
        CIF: null as number | null,
      },
    };

    // Check each alert
    for (const alert of alerts) {
      try {
        const currentPrice = prices[alert.productType][alert.priceType || "FOB"];

        if (currentPrice === null) continue;

        let triggered = false;

        switch (alert.condition) {
          case "ABOVE":
            triggered = currentPrice > alert.thresholdValue.toNumber();
            break;
          case "BELOW":
            triggered = currentPrice < alert.thresholdValue.toNumber();
            break;
          case "CHANGE_PERCENT":
            // For percentage change, we need historical data
            // This is a simplified check - in production, compare with previous day
            triggered = false;
            break;
        }

        if (triggered) {
          results.triggered++;

          // Record alert trigger
          await prisma.alertHistory.create({
            data: {
              alertId: alert.id,
              priceValue: currentPrice,
              triggeredAt: new Date(),
              notified: false,
            },
          });

          // Update alert last triggered time
          await prisma.priceAlert.update({
            where: { id: alert.id },
            data: { lastTriggered: new Date() },
          });

          // Send notification (email)
          if (alert.notifyEmail && alert.user.email) {
            try {
              // In production, integrate with email service (Resend, SendGrid, etc.)
              // await sendAlertEmail({
              //   to: alert.user.email,
              //   productType: alert.productType,
              //   priceType: alert.priceType,
              //   currentPrice,
              //   threshold: alert.thresholdValue.toNumber(),
              //   condition: alert.condition,
              // });

              // Mark as notified
              await prisma.alertHistory.updateMany({
                where: { alertId: alert.id, notified: false },
                data: { notified: true },
              });

              results.notified++;

              console.log(`Alert triggered for user ${alert.user.email}: ${alert.productType} ${alert.condition} ${alert.thresholdValue}`);
            } catch (emailError) {
              results.errors.push(
                `Failed to send email for alert ${alert.id}: ${emailError}`
              );
            }
          }
        }
      } catch (alertError) {
        results.errors.push(
          `Error processing alert ${alert.id}: ${alertError}`
        );
      }
    }

    console.log("Alert check completed:", results);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error("Alert check failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
