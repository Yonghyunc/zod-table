import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContextFromHeaders, unauthorizedResponse } from "@/lib/auth";

const VALID_MEAL_TIMES = ["breakfast", "lunch", "dinner"] as const;
type ApiMealTime = (typeof VALID_MEAL_TIMES)[number];

function isValidDateParam(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function toUtcDate(dateParam: string): Date {
  const [year, month, day] = dateParam.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
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
  const auth = getAuthContextFromHeaders(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  const startDateParam = request.nextUrl.searchParams.get("startDate");
  const endDateParam = request.nextUrl.searchParams.get("endDate");

  if (!startDateParam || !isValidDateParam(startDateParam)) {
    return badRequest("startDate is required in YYYY-MM-DD format.");
  }
  if (!endDateParam || !isValidDateParam(endDateParam)) {
    return badRequest("endDate is required in YYYY-MM-DD format.");
  }

  const start = toUtcDate(startDateParam);
  const end = toUtcDate(endDateParam);
  end.setUTCDate(end.getUTCDate() + 1);

  const schedules = await prisma.mealSchedule.findMany({
    where: {
      userId: auth.userId,
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
    orderBy: [{ mealDate: "asc" }, { mealTime: "asc" }],
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
  const auth = getAuthContextFromHeaders(request);
  if (!auth) {
    return unauthorizedResponse();
  }
  const userId = auth.userId;

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
  const scheduleId = await prisma.$transaction(async (tx) => {
    const createdSchedule = await tx.mealSchedule.create({
      data: {
        userId,
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

    return createdSchedule.scheduleId;
  });

  const schedule = await prisma.mealSchedule.findUnique({
    where: { scheduleId },
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
  const auth = getAuthContextFromHeaders(request);
  if (!auth) {
    return unauthorizedResponse();
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

  const ownerCheck = await prisma.$transaction(async (tx) => {
    const { count } = await tx.mealSchedule.updateMany({
      where: { scheduleId, userId: auth.userId },
      data: { mealType, mealMemo },
    });

    if (count === 0) {
      return false;
    }

    await tx.mealLog.deleteMany({ where: { scheduleId } });

    if (menuNames.length > 0) {
      await tx.mealLog.createMany({
        data: menuNames.map((menuName) => ({ scheduleId, menuName })),
      });
    }

    return true;
  });

  if (!ownerCheck) {
    return NextResponse.json(
      { success: false, error: "Meal schedule not found." },
      { status: 404 },
    );
  }

  const updated = await prisma.mealSchedule.findUnique({
    where: { scheduleId },
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
