"use client";

import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { CustomPieChart } from "../common/CustomPieChart";

interface CategoryRatioItem {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  ratio: number;
}

interface TopExpenseItem {
  rank: number;
  expenseItem: string;
  totalAmount: number;
}

interface Props {
  weekDates: Date[];
  refreshKey: number;
  expenses?: ExpenseStatsSourceItem[];
}

interface ExpenseStatsSourceItem {
  expenseItem: string;
  expenseAmount: number | null;
  categoryId: string;
  category: {
    categoryName: string;
  };
}

export default function ExpenseStatistic({
  weekDates,
  refreshKey,
  expenses,
}: Props) {
  const [categoryStats, setCategoryStats] = useState<CategoryRatioItem[]>([]);
  const [topExpenses, setTopExpenses] = useState<TopExpenseItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const dateRange = useMemo(() => {
    if (weekDates.length === 0) return null;

    const sortedDates = [...weekDates].sort(
      (a, b) => a.getTime() - b.getTime(),
    );

    return {
      startDate: format(sortedDates[0], "yyyy-MM-dd"),
      endDate: format(sortedDates[sortedDates.length - 1], "yyyy-MM-dd"),
      label: `${format(sortedDates[0], "M/d")} ~ ${format(sortedDates[sortedDates.length - 1], "M/d")}`,
    };
  }, [weekDates]);

  useEffect(() => {
    if (expenses) {
      const categoryAmountById = new Map<
        string,
        { categoryName: string; totalAmount: number }
      >();
      const itemAmountByName = new Map<string, number>();

      expenses.forEach((expense) => {
        const amount = expense.expenseAmount ?? 0;
        const prevCategory = categoryAmountById.get(expense.categoryId);
        categoryAmountById.set(expense.categoryId, {
          categoryName: expense.category.categoryName,
          totalAmount: (prevCategory?.totalAmount ?? 0) + amount,
        });

        itemAmountByName.set(
          expense.expenseItem,
          (itemAmountByName.get(expense.expenseItem) ?? 0) + amount,
        );
      });

      const categoryTotal = Array.from(categoryAmountById.values()).reduce(
        (sum, category) => sum + category.totalAmount,
        0,
      );

      const nextCategoryStats = Array.from(categoryAmountById.entries())
        .map(([categoryId, category]) => ({
          categoryId,
          categoryName: category.categoryName,
          totalAmount: category.totalAmount,
          ratio:
            categoryTotal === 0
              ? 0
              : (category.totalAmount / categoryTotal) * 100,
        }))
        .sort((a, b) => b.totalAmount - a.totalAmount);

      const nextTopExpenses = Array.from(itemAmountByName.entries())
        .map(([expenseItem, totalAmount]) => ({ expenseItem, totalAmount }))
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 5)
        .map((item, index) => ({
          rank: index + 1,
          expenseItem: item.expenseItem,
          totalAmount: item.totalAmount,
        }));

      setCategoryStats(nextCategoryStats);
      setTopExpenses(nextTopExpenses);
      return;
    }

    if (!dateRange) {
      setCategoryStats([]);
      setTopExpenses([]);
      return;
    }

    let isMounted = true;

    const loadStatistics = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          refreshKey: String(refreshKey),
        });

        const response = await fetch(
          `/api/meal-expenses/statistics?${params.toString()}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to load expense statistics.");
        }

        const data = (await response.json()) as {
          success: boolean;
          period?: string;
          categoryRatioByAmount?: CategoryRatioItem[];
          topExpenseItems?: TopExpenseItem[];
        };

        if (!isMounted || !data.success) {
          return;
        }

        setCategoryStats(data.categoryRatioByAmount ?? []);
        setTopExpenses(data.topExpenseItems ?? []);
      } catch {
        if (!isMounted) return;
        setCategoryStats([]);
        setTopExpenses([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadStatistics();

    return () => {
      isMounted = false;
    };
  }, [dateRange, expenses, refreshKey]);

  return (
    <div className="min-h-75 bg-white p-4">
      <h1 className="mb-4 font-semibold">통계 </h1>

      {isLoading ? (
        <p className="mt-20 text-center text-sm text-gray-500">Loading...</p>
      ) : topExpenses.length === 0 ? (
        <div className="mt-20 text-center text-sm text-gray-500">
          지출 내역이 없습니다.
        </div>
      ) : (
        <div className="flex gap-6">
          <div className="flex-1">
            <h2 className="text-center font-semibold">카테고리별 지출 비율</h2>

            <CustomPieChart data={categoryStats} />
          </div>
          <div className="flex-1">
            <h2 className="mb-5 text-center font-semibold">지출 순위 TOP5</h2>
            <div className="space-y-1">
              {topExpenses.map((item) => (
                <div
                  key={`${item.rank}-${item.expenseItem}`}
                  className="mx-2 flex items-center justify-between"
                >
                  <span className="text-[13px] font-medium">
                    {item.rank}. {item.expenseItem}
                  </span>
                  <span className="text-xs">
                    {item.totalAmount.toLocaleString()}원
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
