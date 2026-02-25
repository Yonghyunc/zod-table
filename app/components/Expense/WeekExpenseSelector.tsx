"use client";

import { getWeekDisplay } from "@/app/_utils/getCurrentWeekStatus";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface Props {
  currentDate: Date;
  weekDates: Date[];
  refreshKey: number;
  onDateChange: (date: Date) => void;
  expenses?: MealExpenseAmountItem[];
}

interface MealExpenseAmountItem {
  expenseAmount: number | null;
}

export default function WeekSelector({
  currentDate,
  weekDates,
  refreshKey,
  onDateChange,
  expenses,
}: Props) {
  const [weeklyTotalExpense, setWeeklyTotalExpense] = useState(0);

  const dateRange = useMemo(() => {
    if (weekDates.length === 0) return null;

    const sortedDates = [...weekDates].sort(
      (a, b) => a.getTime() - b.getTime(),
    );

    return {
      startDate: format(sortedDates[0], "yyyy-MM-dd"),
      endDate: format(sortedDates[sortedDates.length - 1], "yyyy-MM-dd"),
    };
  }, [weekDates]);

  useEffect(() => {
    if (expenses) {
      const total = expenses.reduce(
        (sum, expense) => sum + (expense.expenseAmount ?? 0),
        0,
      );
      setWeeklyTotalExpense(total);
      return;
    }

    if (!dateRange) {
      setWeeklyTotalExpense(0);
      return;
    }

    let isMounted = true;

    const loadWeeklyTotalExpense = async () => {
      try {
        const params = new URLSearchParams({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          refreshKey: String(refreshKey),
        });

        const response = await fetch(
          `/api/meal-expenses?${params.toString()}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to load expenses.");
        }

        const data = (await response.json()) as {
          success: boolean;
          expenses?: MealExpenseAmountItem[];
        };

        if (!isMounted || !data.success || !data.expenses) {
          return;
        }

        const total = data.expenses.reduce(
          (sum, expense) => sum + (expense.expenseAmount ?? 0),
          0,
        );

        setWeeklyTotalExpense(total);
      } catch {
        if (!isMounted) return;
        setWeeklyTotalExpense(0);
      }
    };

    void loadWeeklyTotalExpense();

    return () => {
      isMounted = false;
    };
  }, [dateRange, expenses, refreshKey]);

  const moveWeek = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + offset);
    onDateChange(newDate);
  };

  return (
    <div className="shadow-box bg-lime flex h-15 w-full max-w-md items-center justify-between rounded p-4 text-white">
      <div className="flex">
        <button
          onClick={() => moveWeek(-7)}
          className="transition-color cursor-pointer rounded-full p-2 active:scale-95"
        >
          <ChevronLeft className="#3B3B3B" size={20} />
        </button>

        <div className="flex items-center">
          <span className="font-medium tracking-tight">
            {getWeekDisplay(currentDate)}
          </span>
        </div>
        <button
          onClick={() => moveWeek(7)}
          className="cursor-pointer rounded-full p-2 transition-colors active:scale-95"
        >
          <ChevronRight className="#3B3B3B" size={20} />
        </button>
      </div>
      <p className="text-base font-semibold">
        총 지출 {weeklyTotalExpense.toLocaleString()} 원
      </p>
    </div>
  );
}
