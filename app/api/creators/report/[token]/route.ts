/**
 * Creator Report API Route
 *
 * Provides sales data, revenue, and performance metrics for creators
 * via secure, expiring token-based access.
 *
 * Requirements: 4.4, 4.5 - Creator report generation and analytics
 */

import { type NextRequest, NextResponse } from "next/server";
import { validateReportToken } from "@/lib/creators/reports";
import { sql } from "@/lib/db/client";
import { CREATOR_REVENUE_SHARE } from "@/lib/revenue/calculator";

/**
 * Sales summary for a creator
 */
interface SalesSummary {
  totalSales: number;
  totalRevenue: number;
  creatorEarnings: number;
  averageOrderValue: number;
}

/**
 * Product performance metrics
 */
interface ProductPerformance {
  sanityId: string;
  title: string;
  unitsSold: number;
  revenue: number;
  creatorEarnings: number;
}

/**
 * Monthly sales data
 */
interface MonthlySales {
  month: string;
  sales: number;
  revenue: number;
  creatorEarnings: number;
}

/**
 * Creator report response
 */
interface CreatorReportResponse {
  creatorSanityId: string;
  generatedAt: string;
  summary: SalesSummary;
  productPerformance: ProductPerformance[];
  monthlySales: MonthlySales[];
  recentSales: RecentSale[];
}

/**
 * Recent sale record
 */
interface RecentSale {
  orderId: number;
  title: string;
  price: number;
  creatorEarnings: number;
  createdAt: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Validate token
    const validation = await validateReportToken(token);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || "Invalid or expired token" },
        { status: 401 }
      );
    }

    const creatorSanityId = validation.creatorSanityId!;

    // Fetch all creator data in parallel
    const [summaryResult, productPerformanceResult, monthlySalesResult, recentSalesResult] =
      await Promise.all([
        getSalesSummary(creatorSanityId),
        getProductPerformance(creatorSanityId),
        getMonthlySales(creatorSanityId),
        getRecentSales(creatorSanityId),
      ]);

    const response: CreatorReportResponse = {
      creatorSanityId,
      generatedAt: new Date().toISOString(),
      summary: summaryResult,
      productPerformance: productPerformanceResult,
      monthlySales: monthlySalesResult,
      recentSales: recentSalesResult,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Creator report error:", error);
    return NextResponse.json(
      { error: "An error occurred while generating the report" },
      { status: 500 }
    );
  }
}

/**
 * Get sales summary for a creator
 */
async function getSalesSummary(creatorSanityId: string): Promise<SalesSummary> {
  const result = await sql`
    SELECT 
      COUNT(*)::int as total_sales,
      COALESCE(SUM(price), 0)::int as total_revenue
    FROM order_items
    WHERE creator_sanity_id = ${creatorSanityId}
  `;

  const row = result[0];
  const totalSales = (row?.total_sales as number) || 0;
  const totalRevenue = (row?.total_revenue as number) || 0;
  const creatorEarnings = Math.floor(totalRevenue * CREATOR_REVENUE_SHARE);
  const averageOrderValue = totalSales > 0 ? Math.round(totalRevenue / totalSales) : 0;

  return {
    totalSales,
    totalRevenue,
    creatorEarnings,
    averageOrderValue,
  };
}

/**
 * Get product performance metrics for a creator
 */
async function getProductPerformance(creatorSanityId: string): Promise<ProductPerformance[]> {
  const result = await sql`
    SELECT 
      sanity_id,
      title,
      COUNT(*)::int as units_sold,
      SUM(price)::int as revenue
    FROM order_items
    WHERE creator_sanity_id = ${creatorSanityId}
    GROUP BY sanity_id, title
    ORDER BY revenue DESC
    LIMIT 20
  `;

  return result.map((row) => ({
    sanityId: row.sanity_id as string,
    title: row.title as string,
    unitsSold: row.units_sold as number,
    revenue: row.revenue as number,
    creatorEarnings: Math.floor((row.revenue as number) * CREATOR_REVENUE_SHARE),
  }));
}

/**
 * Get monthly sales data for a creator (last 12 months)
 */
async function getMonthlySales(creatorSanityId: string): Promise<MonthlySales[]> {
  const result = await sql`
    SELECT 
      TO_CHAR(created_at, 'YYYY-MM') as month,
      COUNT(*)::int as sales,
      COALESCE(SUM(price), 0)::int as revenue
    FROM order_items
    WHERE creator_sanity_id = ${creatorSanityId}
      AND created_at >= NOW() - INTERVAL '12 months'
    GROUP BY TO_CHAR(created_at, 'YYYY-MM')
    ORDER BY month DESC
  `;

  return result.map((row) => ({
    month: row.month as string,
    sales: row.sales as number,
    revenue: row.revenue as number,
    creatorEarnings: Math.floor((row.revenue as number) * CREATOR_REVENUE_SHARE),
  }));
}

/**
 * Get recent sales for a creator (last 10)
 */
async function getRecentSales(creatorSanityId: string): Promise<RecentSale[]> {
  const result = await sql`
    SELECT 
      order_id,
      title,
      price,
      created_at
    FROM order_items
    WHERE creator_sanity_id = ${creatorSanityId}
    ORDER BY created_at DESC
    LIMIT 10
  `;

  return result.map((row) => ({
    orderId: row.order_id as number,
    title: row.title as string,
    price: row.price as number,
    creatorEarnings: Math.floor((row.price as number) * CREATOR_REVENUE_SHARE),
    createdAt: (row.created_at as Date).toISOString(),
  }));
}
