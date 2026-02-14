import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, unauthorizedResponse } from '@/lib/auth'

function isValidDateParam(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function toDateRange(dateParam: string): { start: Date; end: Date } {
  const [year, month, day] = dateParam.split('-').map(Number)
  const start = new Date(Date.UTC(year, month - 1, day))
  const end = new Date(Date.UTC(year, month - 1, day + 1))
  return { start, end }
}

interface CreateMealScheduleBody {
  mealDate?: string
  mealTime?: string
  mealType?: string | null
  mealMemo?: string | null
  menuNames?: string[]
}

function badRequest(message: string) {
  return NextResponse.json({ success: false, error: message }, { status: 400 })
}

export async function GET(request: NextRequest) {
  const dateParam = request.nextUrl.searchParams.get('date')
  if (!dateParam || !isValidDateParam(dateParam)) {
    return NextResponse.json(
      { success: false, error: 'Invalid date format. Use YYYY-MM-DD.' },
      { status: 400 }
    )
  }

  const auth = await requireAuth(request)
  if (!auth.payload?.userId) {
    return unauthorizedResponse(auth.reason ?? undefined)
  }

  const { start, end } = toDateRange(dateParam)
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
      mealTime: 'asc',
    },
  })

  return NextResponse.json(
    { success: true, schedules },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.payload?.userId) {
    return unauthorizedResponse(auth.reason ?? undefined)
  }

  let body: CreateMealScheduleBody
  try {
    body = (await request.json()) as CreateMealScheduleBody
  } catch {
    return badRequest('Invalid JSON body.')
  }

  const mealDate = body.mealDate?.trim()
  const mealTime = body.mealTime?.trim()
  const mealType = body.mealType?.trim() || null
  const mealMemo = body.mealMemo?.trim() || null
  const menuNames = Array.isArray(body.menuNames)
    ? body.menuNames.map((name) => name.trim()).filter((name) => name.length > 0)
    : []

  if (!mealDate || !isValidDateParam(mealDate)) {
    return badRequest('Invalid mealDate format. Use YYYY-MM-DD.')
  }

  if (!mealTime) {
    return badRequest('mealTime is required.')
  }

  const [year, month, day] = mealDate.split('-').map(Number)
  const schedule = await prisma.mealSchedule.create({
    data: {
      userId: auth.payload.userId,
      mealDate: new Date(Date.UTC(year, month - 1, day)),
      mealTime,
      mealType,
      mealMemo,
      logs: menuNames.length
        ? {
            create: menuNames.map((menuName) => ({ menuName })),
          }
        : undefined,
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
  })

  return NextResponse.json(
    { success: true, schedule },
    {
      status: 201,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}
