import { type NextRequest, NextResponse } from "next/server";

import { getTrendingContent } from "@/lib/engine";

export async function GET(request: NextRequest) {
  const rawQuery = request.nextUrl.searchParams.get("q")?.trim() ?? "trending";

  // Sanitize at the system boundary
  const query = rawQuery.slice(0, 100).replace(/[<>"']/g, "");

  try {
    const result = await getTrendingContent(query);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch trends. Please try again." },
      { status: 500 },
    );
  }
}

