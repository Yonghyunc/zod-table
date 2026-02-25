import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface CreateMealExpenseBody {
  expenseDate?: string;
  expenseItem?: string;
  expenseAmount?: number;
  categoryId?: string;
}

interface DeleteMealExpenseBody {
  expenseId?: string;
}

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

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.payload?.userId) {
    return unauthorizedResponse(auth.reason ?? undefined);
  }

  const startDate = request.nextUrl.searchParams.get("startDate");
  const endDate = request.nextUrl.searchParams.get("endDate");

  if (!startDate || !isValidDateParam(startDate)) {
    return badRequest("startDate is required in YYYY-MM-DD format.");
  }

  if (!endDate || !isValidDateParam(endDate)) {
    return badRequest("endDate is required in YYYY-MM-DD format.");
  }

  const start = toUtcDate(startDate);
  const end = toUtcDate(endDate);
  end.setUTCDate(end.getUTCDate() + 1);

  const expenses = await prisma.mealExpense.findMany({
    where: {
      userId: auth.payload.userId,
      expenseDate: {
        gte: start,
        lt: end,
      },
    },
    select: {
      expenseId: true,
      expenseDate: true,
      expenseItem: true,
      expenseAmount: true,
      categoryId: true,
      category: {
        select: {
          categoryName: true,
        },
      },
    },
    orderBy: [{ expenseDate: "asc" }, { expenseId: "asc" }],
  });

  return NextResponse.json(
    { success: true, expenses },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.payload?.userId) {
    return unauthorizedResponse(auth.reason ?? undefined);
  }

  let body: CreateMealExpenseBody;
  try {
    body = (await request.json()) as CreateMealExpenseBody;
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const expenseItem = body.expenseItem?.trim();
  const categoryId = body.categoryId?.trim();
  const expenseAmount = body.expenseAmount;
  const expenseDateRaw = body.expenseDate?.trim();

  if (!expenseDateRaw) {
    return badRequest("expenseDate is required.");
  }

  const expenseDate = new Date(expenseDateRaw);
  if (Number.isNaN(expenseDate.getTime())) {
    return badRequest("expenseDate must be a valid date string.");
  }

  if (!expenseItem || expenseItem.length === 0) {
    return badRequest("expenseItem is required.");
  }

  if (expenseItem.length > 20) {
    return badRequest("expenseItem must be 20 characters or fewer.");
  }

  if (typeof expenseAmount !== "number" || !Number.isFinite(expenseAmount)) {
    return badRequest("expenseAmount must be a valid number.");
  }

  if (!Number.isInteger(expenseAmount)) {
    return badRequest("expenseAmount must be an integer.");
  }

  if (!categoryId) {
    return badRequest("categoryId is required.");
  }

  const category = await prisma.itemCategory.findUnique({
    where: { categoryId },
    select: { categoryId: true },
  });

  if (!category) {
    return badRequest("categoryId must exist in item_categories.");
  }

  const created = await prisma.mealExpense.create({
    data: {
      expenseDate,
      expenseItem,
      expenseAmount,
      categoryId: category.categoryId,
      userId: auth.payload.userId,
    },
    select: {
      expenseId: true,
      expenseDate: true,
      expenseItem: true,
      expenseAmount: true,
      categoryId: true,
      userId: true,
    },
  });

  return NextResponse.json(
    { success: true, expense: created },
    {
      status: 201,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.payload?.userId) {
    return unauthorizedResponse(auth.reason ?? undefined);
  }

  let body: DeleteMealExpenseBody;
  try {
    body = (await request.json()) as DeleteMealExpenseBody;
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const expenseId = body.expenseId?.trim();
  if (!expenseId) {
    return badRequest("expenseId is required.");
  }

  const existing = await prisma.mealExpense.findFirst({
    where: {
      expenseId,
      userId: auth.payload.userId,
    },
    select: { expenseId: true },
  });

  if (!existing) {
    return NextResponse.json(
      { success: false, error: "Meal expense not found." },
      { status: 404 },
    );
  }

  await prisma.mealExpense.delete({
    where: {
      expenseId,
    },
  });

  return NextResponse.json(
    { success: true, expenseId },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
