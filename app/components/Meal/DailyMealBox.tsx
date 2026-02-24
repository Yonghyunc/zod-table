"use client";

import { MEAL_TIME, MealTime } from "@/constants/meal";
import { MealSchedule } from "@/types/meal";
import { useEffect, useState } from "react";
import { MealTypeBadge } from "../common/MealTypeBadge";

interface Props {
  date: string;
  onEditRequest: (
    schedule: MealSchedule | null,
    mealTime: MealTime,
    mealDate: string,
  ) => void;
  refreshKey?: number;
}

export default function DailyMealBox({
  date,
  onEditRequest,
  refreshKey = 0,
}: Props) {
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
  }, [date, refreshKey]);

  if (isLoading) {
    return (
      <div className="shadow-box rounded bg-white p-4 text-sm text-gray-500">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="shadow-box rounded bg-white p-4 text-sm text-red-500">
        {error}
      </div>
    );
  }

  const mealTimeOrder: MealTime[] = ["breakfast", "lunch", "dinner"];
  const scheduleByMealTime = new Map(
    schedules.map((schedule) => [schedule.mealTime, schedule]),
  );

  return (
    <>
      <div className="shadow-box rounded bg-white p-4">
        <ul className="flex flex-col gap-3">
          {mealTimeOrder.map((mealTime, index) => {
            const schedule = scheduleByMealTime.get(mealTime);
            const isLast = index === mealTimeOrder.length - 1;

            return (
              <div
                className={`flex ${!isLast ? "border-border-gray border-b pb-3" : ""}`}
                key={schedule?.scheduleId ?? mealTime}
              >
                <div className="flex w-1/4 items-center">
                  <span
                    className="cursor-pointer text-sm font-medium text-gray-800"
                    onClick={() =>
                      onEditRequest(schedule || null, mealTime, date)
                    }
                  >
                    {MEAL_TIME[mealTime]}
                  </span>
                </div>
                <div className="flex w-3/4 flex-col">
                  <div className="flex items-center justify-between">
                    <div>
                      {schedule && schedule.logs.length > 0 && (
                        <p className="text-[13px] text-gray-800">
                          {schedule.logs.map((log) => log.menuName).join(", ")}
                        </p>
                      )}
                      {schedule && schedule.mealMemo && (
                        <p className="text-[11px] text-gray-500">
                          {schedule.mealMemo}
                        </p>
                      )}
                    </div>
                    {schedule && schedule.mealType && (
                      <MealTypeBadge type={schedule.mealType} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </ul>
      </div>
    </>
  );
}
