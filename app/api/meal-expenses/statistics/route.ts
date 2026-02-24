import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";

function badRequest(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 400 });
}

function isValidDateParam(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function toUtcDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function parseMonth(value: string): { year: number; month: number } | null {
  if (!/^\d{4}-\d{2}$/.test(value)) {
    return null;
  }

  const [yearText, monthText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);

  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    return null;
  }

  if (month < 1 || month > 12) {
    return null;
  }

  return { year, month };
}

function toMonthRange(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return { start, end };
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.payload?.userId) {
    return unauthorizedResponse(auth.reason ?? undefined);
  }

  const startDateParam = request.nextUrl.searchParams.get("startDate");
  const endDateParam = request.nextUrl.searchParams.get("endDate");
  const monthParam = request.nextUrl.searchParams.get("month");

  let start: Date;
  let end: Date;
  let period: string;

  if (startDateParam || endDateParam) {
    if (!startDateParam || !isValidDateParam(startDateParam)) {
      return badRequest("startDate is required in YYYY-MM-DD format.");
    }
    if (!endDateParam || !isValidDateParam(endDateParam)) {
      return badRequest("endDate is required in YYYY-MM-DD format.");
    }

    start = toUtcDate(startDateParam);
    end = toUtcDate(endDateParam);
    end.setUTCDate(end.getUTCDate() + 1);
    period = `${startDateParam}~${endDateParam}`;
  } else {
    const parsedMonth = monthParam ? parseMonth(monthParam) : null;
    if (monthParam && !parsedMonth) {
      return badRequest("month must be in YYYY-MM format.");
    }

    const now = new Date();
    const year = parsedMonth?.year ?? now.getFullYear();
    const month = parsedMonth?.month ?? now.getMonth() + 1;
    const monthRange = toMonthRange(year, month);
    start = monthRange.start;
    end = monthRange.end;
    period = `${year}-${String(month).padStart(2, "0")}`;
  }

  const [categoryGroups, itemGroups] = await Promise.all([
    prisma.mealExpense.groupBy({
      by: ["categoryId"],
      where: {
        userId: auth.payload.userId,
        expenseDate: {
          gte: start,
          lt: end,
        },
      },
      _sum: {
        expenseAmount: true,
      },
      orderBy: {
        _sum: {
          expenseAmount: "desc",
        },
      },
    }),
    prisma.mealExpense.groupBy({
      by: ["expenseItem"],
      where: {
        userId: auth.payload.userId,
        expenseDate: {
          gte: start,
          lt: end,
        },
      },
      _sum: {
        expenseAmount: true,
      },
      orderBy: {
        _sum: {
          expenseAmount: "desc",
        },
      },
      take: 5,
    }),
  ]);

  const categoryIds = categoryGroups.map((group) => group.categoryId);
  const categories = await prisma.itemCategory.findMany({
    where: {
      categoryId: {
        in: categoryIds,
      },
    },
    select: {
      categoryId: true,
      categoryName: true,
    },
  });

  const categoryNameMap = new Map(
    categories.map((category) => [category.categoryId, category.categoryName]),
  );

  const categoryTotal = categoryGroups.reduce(
    (sum, group) => sum + (group._sum.expenseAmount ?? 0),
    0,
  );

  const categoryRatioByAmount = categoryGroups.map((group) => {
    const amount = group._sum.expenseAmount ?? 0;
    const ratio = categoryTotal === 0 ? 0 : (amount / categoryTotal) * 100;

    return {
      categoryId: group.categoryId,
      categoryName:
        categoryNameMap.get(group.categoryId) ?? group.categoryId,
      totalAmount: amount,
      ratio,
    };
  });

  const topExpenseItems = itemGroups.map((group, index) => ({
    rank: index + 1,
    expenseItem: group.expenseItem,
    totalAmount: group._sum.expenseAmount ?? 0,
  }));

  return NextResponse.json(
    {
      success: true,
      period,
      categoryRatioByAmount,
      topExpenseItems,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
