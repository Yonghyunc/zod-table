"use client";

import WeeklyScheduler from "./components/WeeklyScheduler";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCurrentWeekStatus } from "./_utils/getCurrentWeekStatus";
import { useEffect, useState } from "react";
import WeekSelector from "./components/WeekSelector";
import { getDaysInWeek } from "./_utils/getDaysInWeek";
import DailyMealBox from "./components/DailyMealBox";
import { formatDate } from "./_utils/formatDateToString";

export default function MealPlanPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekDays = getDaysInWeek(currentDate);

  return (
    <div className="h-full">
      <div className="p-4">
        <h1 className="text-center font-bold text-gray-800">식단</h1>
      </div>
      {/* bg-[#F8F9F9] */}
      <div className="scrollbar-hide h-full w-full overflow-y-auto scroll-smooth bg-gray-300 p-4">
        <WeekSelector currentDate={currentDate} onDateChange={setCurrentDate} />
        <div className="mt-10 flex flex-col gap-4">
          {weekDays.map((dayDate, idx) => {
            const isToday =
              dayDate.toDateString() === new Date().toDateString();
            return (
              <div key={idx}>
                <span className="font-medium">{formatDate(dayDate)}</span>
                {isToday && (
                  <span className="text-verde ml-2 font-medium">TODAY</span>
                )}
                <DailyMealBox date={dayDate} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
