'use client';

import WeeklyScheduler from './components/WeeklyScheduler';
import {ChevronLeft, ChevronRight } from 'lucide-react';
import { getCurrentWeekStatus } from './utils/getCurrentWeekStatus';
import { useEffect, useState } from 'react';
import WeekSelector from './components/WeekSelector';
import { getDaysInWeek } from './utils/getDaysInWeek';

export default function MealPlanPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekDays = getDaysInWeek(currentDate);

  return (
      <div className="h-full">
        <div className="p-4">
          <h1 className="text-center font-bold text-gray-800">식단</h1>
        </div>
        {/* bg-[#F8F9F9] */}
        <div className="bg-gray-300 p-4 h-full w-full overflow-y-auto scroll-smooth scrollbar-hide">
          <WeekSelector currentDate={currentDate} onDateChange={setCurrentDate} />
          <div className="">
            {weekDays.map((dayDate, idx) => {
              const isToday = dayDate.toDateString() === new Date().toDateString();
              return (
                <div 
                  key={idx} 
                >
                  {dayDate.toDateString()}
                </div>
              );
          })}
        </div>
        </div>
      </div>
  ); 
}
