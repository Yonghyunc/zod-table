import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.payload?.userId) {
    return unauthorizedResponse(auth.reason ?? undefined);
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
        "Cache-Control": "no-store",
      },
    },
  );
}
