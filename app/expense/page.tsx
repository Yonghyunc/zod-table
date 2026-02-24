"use client";

import { useMemo, useState } from "react";
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSavingExpense, setIsSavingExpense] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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
          />
        </div>
        <ExpenseDetail
          openEditor={() => setIsEditorOpen(true)}
          weekDates={weekDates}
          refreshKey={refreshKey}
        />
        <ExpenseStatistic weekDates={weekDates} refreshKey={refreshKey} />
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
