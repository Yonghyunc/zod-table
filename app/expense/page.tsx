"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import HeaderBar from "../components/HeaderBar";
import WeekExpenseSelector from "../components/Expense/WeekExpenseSelector";
import ExpenseDetail from "../components/Expense/ExpenseDetail";
import ExpenseStatistic from "../components/Expense/ExpenseStatistic";
import Modal from "../components/common/Modal";
import ExpenseDetailEditor, {
  type ExpenseEditorValues,
} from "../components/Expense/ExpenseDetailEditor";

export default function ExpensePage() {
  interface WeeklyExpenseItem {
    expenseItem: string;
    expenseAmount: number | null;
    categoryId: string;
    category: {
      categoryName: string;
    };
  }

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSavingExpense, setIsSavingExpense] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [weeklyExpenses, setWeeklyExpenses] = useState<WeeklyExpenseItem[]>([]);
  const handleWeeklyExpensesChange = useCallback(
    (expenses: WeeklyExpenseItem[]) => {
      setWeeklyExpenses(expenses);
    },
    [],
  );

  const monday = useMemo(() => {
    const currentDay = currentDate.getDay();
    const diffToMon = currentDay === 0 ? -6 : 1 - currentDay;
    const nextMonday = new Date(currentDate);
    nextMonday.setDate(currentDate.getDate() + diffToMon);
    return nextMonday;
  }, [currentDate]);

  const weekDates = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const day = new Date(monday);
        day.setDate(monday.getDate() + index);
        return day;
      }),
    [monday],
  );

  const weekDateRange = useMemo(() => {
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
    if (!weekDateRange) {
      setWeeklyExpenses([]);
      return;
    }

    let isMounted = true;

    const loadWeeklyExpenses = async () => {
      try {
        const params = new URLSearchParams({
          startDate: weekDateRange.startDate,
          endDate: weekDateRange.endDate,
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
          expenses?: WeeklyExpenseItem[];
        };

        if (!isMounted || !data.success) {
          return;
        }

        setWeeklyExpenses(data.expenses ?? []);
      } catch {
        if (!isMounted) return;
        setWeeklyExpenses([]);
      }
    };

    void loadWeeklyExpenses();

    return () => {
      isMounted = false;
    };
  }, [refreshKey, weekDateRange]);

  const handleSaveExpense = async (values: ExpenseEditorValues) => {
    try {
      setIsSavingExpense(true);

      const response = await fetch("/api/meal-expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expenseDate: format(values.expenseDate, "yyyy-MM-dd"),
          expenseItem: values.expenseItem,
          expenseAmount: values.expenseAmount,
          categoryId: values.categoryId,
        }),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        const message = errorBody?.error ?? "지출 저장에 실패했습니다.";
        throw new Error(message);
      }

      setRefreshKey((prev) => prev + 1);
      setIsEditorOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "지출 저장에 실패했습니다.";
      alert(message);
    } finally {
      setIsSavingExpense(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <HeaderBar title="식비" />
      <div className="scrollbar-hide flex min-h-0 w-full flex-1 flex-col gap-4 overflow-y-auto scroll-smooth bg-[#F8F9F9] py-4">
        <div className="mx-4">
          <WeekExpenseSelector
            currentDate={currentDate}
            weekDates={weekDates}
            refreshKey={refreshKey}
            onDateChange={setCurrentDate}
            expenses={weeklyExpenses}
          />
        </div>
        <ExpenseDetail
          openEditor={() => setIsEditorOpen(true)}
          weekDates={weekDates}
          refreshKey={refreshKey}
          onExpenseDeleted={() => setRefreshKey((prev) => prev + 1)}
          onExpensesChange={handleWeeklyExpensesChange}
        />
        <ExpenseStatistic
          weekDates={weekDates}
          refreshKey={refreshKey}
          expenses={weeklyExpenses}
        />
      </div>
      <Modal isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)}>
        <ExpenseDetailEditor
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveExpense}
          isSaving={isSavingExpense}
        />
      </Modal>
    </div>
  );
}
