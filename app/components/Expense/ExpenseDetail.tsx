"use client";

import { Plus } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useEffect, useMemo, useState } from "react";
import { CircleX } from "lucide-react";
import { CategoryBadge } from "../common/CategoryBadge";

interface Props {
  openEditor: () => void;
  weekDates: Date[];
  refreshKey: number;
  onExpenseDeleted: () => void;
  onExpensesChange?: (expenses: MealExpenseItem[]) => void;
}

interface MealExpenseItem {
  expenseId: string;
  expenseDate: string;
  expenseItem: string;
  expenseAmount: number | null;
  categoryId: string;
  category: {
    categoryName: string;
  };
}

export default function ExpenseDetail({
  openEditor,
  weekDates,
  refreshKey,
  onExpenseDeleted,
  onExpensesChange,
}: Props) {
  const [expenses, setExpenses] = useState<MealExpenseItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingExpenseIds, setDeletingExpenseIds] = useState<string[]>([]);

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
    if (!dateRange) {
      setExpenses([]);
      onExpensesChange?.([]);
      return;
    }

    let isMounted = true;

    const loadExpenses = async () => {
      setIsLoading(true);
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
          expenses?: MealExpenseItem[];
        };

        if (!isMounted || !data.success || !data.expenses) {
          return;
        }

        setExpenses(data.expenses);
        onExpensesChange?.(data.expenses);
      } catch {
        if (!isMounted) return;
        setExpenses([]);
        onExpensesChange?.([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadExpenses();
    return () => {
      isMounted = false;
    };
  }, [dateRange, onExpensesChange, refreshKey]);

  const handleDeleteExpense = async (expenseId: string) => {
    if (deletingExpenseIds.includes(expenseId)) {
      return;
    }

    try {
      setDeletingExpenseIds((prev) => [...prev, expenseId]);

      const response = await fetch("/api/meal-expenses", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expenseId }),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        const message = errorBody?.error ?? "지출 삭제에 실패했습니다.";
        throw new Error(message);
      }

      onExpenseDeleted();
      setExpenses((prev) => {
        const next = prev.filter((expense) => expense.expenseId !== expenseId);
        onExpensesChange?.(next);
        return next;
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "지출 삭제에 실패했습니다.";
      alert(message);
    } finally {
      setDeletingExpenseIds((prev) => prev.filter((id) => id !== expenseId));
    }
  };

  return (
    <div className="h-auto min-h-60 shrink-0 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="font-semibold">상세 지출</h1>
        <Plus size={20} className="cursor-pointer" onClick={openEditor} />
      </div>

      {isLoading ? (
        <p className="text-center text-sm text-gray-500">Loading...</p>
      ) : (
        <>
          {weekDates.map((date) => {
            const dayKey = format(date, "yyyy-MM-dd");
            const dayExpenses = expenses.filter(
              (expense) =>
                format(new Date(expense.expenseDate), "yyyy-MM-dd") === dayKey,
            );
            const totalAmount = dayExpenses.reduce(
              (sum, expense) => sum + (expense.expenseAmount ?? 0),
              0,
            );

            return (
              <div
                hidden={dayExpenses.length === 0}
                key={dayKey}
                className="px-2 py-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">
                    {format(date, "d일(EEE)", { locale: ko })}
                  </h2>
                  <span className="mr-[22px] font-semibold">
                    {totalAmount.toLocaleString()}원
                  </span>
                </div>
                <div className="my-2 space-y-1">
                  {dayExpenses.map((expense) => (
                    <div
                      key={expense.expenseId}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center">
                        <div className="w-16">
                          <CategoryBadge id={expense.categoryId} />
                        </div>
                        <span>{expense.expenseItem}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>
                          {expense.expenseAmount?.toLocaleString() ?? 0}원
                        </span>
                        <CircleX
                          size={13}
                          color="#808080"
                          className="cursor-pointer"
                          onClick={() =>
                            void handleDeleteExpense(expense.expenseId)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
