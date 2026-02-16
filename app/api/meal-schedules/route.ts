import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";

const VALID_MEAL_TIMES = ["breakfast", "lunch", "dinner"] as const;
type ApiMealTime = (typeof VALID_MEAL_TIMES)[number];

function isValidDateParam(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function toDateRange(dateParam: string): { start: Date; end: Date } {
  const [year, month, day] = dateParam.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, day));
  const end = new Date(Date.UTC(year, month - 1, day + 1));
  return { start, end };
}

interface CreateMealScheduleBody {
  mealDate?: string;
  mealTime?: ApiMealTime | string;
  mealType?: string | null;
  mealMemo?: string | null;
  menuNames?: string[];
}

interface UpdateMealScheduleBody {
  scheduleId?: string;
  mealType?: string | null;
  mealMemo?: string | null;
  menuNames?: string[];
}

function badRequest(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 400 });
}

function isApiMealTime(value: string): value is ApiMealTime {
  return VALID_MEAL_TIMES.includes(value as ApiMealTime);
}

export async function GET(request: NextRequest) {
  const dateParam = request.nextUrl.searchParams.get("date");
  if (!dateParam || !isValidDateParam(dateParam)) {
    return NextResponse.json(
      { success: false, error: "Invalid date format. Use YYYY-MM-DD." },
      { status: 400 },
    );
  }

  const auth = await requireAuth(request);
  if (!auth.payload?.userId) {
    return unauthorizedResponse(auth.reason ?? undefined);
  }

  const { start, end } = toDateRange(dateParam);
  const schedules = await prisma.mealSchedule.findMany({
    where: {
      userId: auth.payload.userId,
      mealDate: {
        gte: start,
        lt: end,
      },
    },
    select: {
      scheduleId: true,
      mealDate: true,
      mealTime: true,
      mealType: true,
      mealMemo: true,
      logs: {
        select: {
          logId: true,
          menuName: true,
        },
      },
    },
    orderBy: {
      mealTime: "asc",
    },
  });

  return NextResponse.json(
    { success: true, schedules },
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

  let body: CreateMealScheduleBody;
  try {
    body = (await request.json()) as CreateMealScheduleBody;
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const mealDate = body.mealDate?.trim();
  const mealTime = body.mealTime?.trim();
  const mealType = body.mealType?.trim() || null;
  const mealMemo = body.mealMemo?.trim() || null;
  const menuNames = Array.isArray(body.menuNames)
    ? body.menuNames
        .map((name) => name.trim())
        .filter((name) => name.length > 0)
    : [];

  if (!mealDate || !isValidDateParam(mealDate)) {
    return badRequest("Invalid mealDate format. Use YYYY-MM-DD.");
  }

  if (!mealTime || !isApiMealTime(mealTime)) {
    return badRequest("mealTime must be one of breakfast, lunch, dinner.");
  }

  const [year, month, day] = mealDate.split("-").map(Number);
  const schedule = await prisma.$transaction(async (tx) => {
    const createdSchedule = await tx.mealSchedule.create({
      data: {
        userId: auth.payload.userId,
        mealDate: new Date(Date.UTC(year, month - 1, day)),
        mealTime,
        mealType,
        mealMemo,
      },
      select: {
        scheduleId: true,
      },
    });

    if (menuNames.length > 0) {
      await tx.mealLog.createMany({
        data: menuNames.map((menuName) => ({
          scheduleId: createdSchedule.scheduleId,
          menuName,
        })),
      });
    }

    const scheduleWithLogs = await tx.mealSchedule.findUnique({
      where: { scheduleId: createdSchedule.scheduleId },
      select: {
        scheduleId: true,
        mealDate: true,
        mealTime: true,
        mealType: true,
        mealMemo: true,
        logs: {
          select: {
            logId: true,
            menuName: true,
          },
        },
      },
    });

    if (!scheduleWithLogs) {
      throw new Error("Failed to load created schedule.");
    }

    return scheduleWithLogs;
  });
  return NextResponse.json(
    { success: true, schedule },
    {
      status: 201,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.payload?.userId) {
    return unauthorizedResponse(auth.reason ?? undefined);
  }

  let body: UpdateMealScheduleBody;
  try {
    body = (await request.json()) as UpdateMealScheduleBody;
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const scheduleId = body.scheduleId?.trim();
  const mealType = body.mealType?.trim() || null;
  const mealMemo = body.mealMemo?.trim() || null;
  const menuNames = Array.isArray(body.menuNames)
    ? body.menuNames
        .map((name) => name.trim())
        .filter((name) => name.length > 0)
    : [];

  if (!scheduleId) {
    return badRequest("scheduleId is required.");
  }

  const existing = await prisma.mealSchedule.findFirst({
    where: {
      scheduleId,
      userId: auth.payload.userId,
    },
    select: { scheduleId: true },
  });

  if (!existing) {
    return NextResponse.json(
      { success: false, error: "Meal schedule not found." },
      { status: 404 },
    );
  }

  const updated = await prisma.mealSchedule.update({
    where: { scheduleId },
    data: {
      mealType,
      mealMemo,
      logs: {
        deleteMany: {},
        create: menuNames.map((menuName) => ({ menuName })),
      },
    },
    select: {
      scheduleId: true,
      mealDate: true,
      mealTime: true,
      mealType: true,
      mealMemo: true,
      logs: {
        select: {
          logId: true,
          menuName: true,
        },
      },
    },
  });

  return NextResponse.json(
    { success: true, schedule: updated },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
