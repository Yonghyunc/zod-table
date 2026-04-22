"use client";

import { MEAL_TIME, MealTime } from "@/constants/meal";
import { MealSchedule } from "@/types/meal";
import { MealTypeBadge } from "../common/MealTypeBadge";

interface Props {
  date: string;
  schedules: MealSchedule[];
  onEditRequest: (
    schedule: MealSchedule | null,
    mealTime: MealTime,
    mealDate: string,
  ) => void;
}

export default function DailyMealBox({
  date,
  schedules,
  onEditRequest,
}: Props) {
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
                        <p className="text-[11px] whitespace-pre-line text-gray-500">
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
