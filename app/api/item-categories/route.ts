import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContextFromHeaders, unauthorizedResponse } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = getAuthContextFromHeaders(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  const categories = await prisma.itemCategory.findMany({
    select: {
      categoryId: true,
      categoryName: true,
    },
    orderBy: {
      categoryId: "asc",
    },
  });

  return NextResponse.json(
    { success: true, categories },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
