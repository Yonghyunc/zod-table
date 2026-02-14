"use client";

import { useState } from "react";
import WeekSelector from "./components/WeekSelector";
import { getDaysInWeek } from "./_utils/getDaysInWeek";
import DailyMealBox from "./components/DailyMealBox";
import { formatDate } from "./_utils/formatDateToString";
import HeaderBar from "./components/HeaderBar";
import dayjs from 'dayjs'

export default function MealPlanPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekDays = getDaysInWeek(currentDate);

  return (
    <div className="h-full">
      <HeaderBar title="식단" />
      {/* bg-[#F8F9F9] */}
      <div className="scrollbar-hide h-full w-full overflow-y-auto scroll-smooth bg-[#F8F9F9] p-4">
        <WeekSelector currentDate={currentDate} onDateChange={setCurrentDate} />
        <div className="mt-10 flex flex-col gap-4">
          {weekDays.map((dayDate, idx) => {
            const isToday =
              dayDate.toDateString() === new Date().toDateString();
            return (
              <div key={idx} className="flex flex-col gap-1">
                <div>
                  <span className="font-medium">{formatDate(dayDate)}</span>
                  {isToday && (
                    <span className="text-verde ml-2 font-medium">TODAY</span>
                  )}
                </div>
                <DailyMealBox date={dayjs(dayDate).format('YYYY-MM-DD')} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
