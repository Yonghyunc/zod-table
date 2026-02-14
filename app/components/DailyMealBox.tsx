"use client";

import { useEffect, useState } from "react";

interface MealLog {
  logId: string;
  menuName: string;
}

interface MealSchedule {
  scheduleId: string;
  mealDate: string;
  mealTime: string;
  mealType: string | null;
  mealMemo: string | null;
  logs: MealLog[];
}

interface Props {
  date: string;
}

export default function DailyMealBox({ date }: Props) {
  const [schedules, setSchedules] = useState<MealSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/meal-schedules?date=${date}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load meal schedules");
        }

        const data = (await response.json()) as { schedules: MealSchedule[] };
        setSchedules(data.schedules ?? []);
      } catch {
        setError("Failed to load meal schedules.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchSchedules();
  }, [date]);

  if (isLoading) {
    return <div className="shadow-box rounded bg-white p-4 text-sm text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="shadow-box rounded bg-white p-4 text-sm text-red-500">{error}</div>;
  }

  if (schedules.length === 0) {
    return <div className="shadow-box rounded bg-white p-4 text-sm text-gray-500">No meals for this date.</div>;
  }

  return (
    <div className="shadow-box rounded bg-white p-4">
      
      <ul className="flex flex-col gap-2">
        {schedules.map((schedule) => (
        
          <li key={schedule.scheduleId} className="rounded border border-gray-100 p-3">
            <p className="text-sm font-semibold text-gray-800">{schedule.mealTime}</p>
            {schedule.mealType && <p className="text-xs text-gray-600">{schedule.mealType}</p>}
            {schedule.mealMemo && <p className="mt-1 text-sm text-gray-700">{schedule.mealMemo}</p>}
            {schedule.logs.length > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                {schedule.logs.map((log) => log.menuName).join(", ")}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
