"use client";

import { useState } from "react";
import WeekSelector from "./components/Meal/WeekSelector";
import { getDaysInWeek } from "./_utils/getDaysInWeek";
import DailyMealBox from "./components/Meal/DailyMealBox";
import { formatDate } from "./_utils/formatDateToString";
import HeaderBar from "./components/HeaderBar";
import dayjs from "dayjs";
import { MealSchedule } from "@/types/meal";
import Modal from "./components/common/Modal";
import MealItemEditor from "./components/Meal/MealItemEditor";
import { MealTime } from "@/constants/meal";

export default function MealPlanPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [refreshKeysByDate, setRefreshKeysByDate] = useState<
    Record<string, number>
  >({});
  const [editingSchedule, setEditingSchedule] = useState<MealSchedule | null>(
    null,
  );
  const [editingMealTime, setEditingMealTime] = useState<MealTime>("breakfast");
  const [editingMealDate, setEditingMealDate] = useState<string>("");
  const weekDays = getDaysInWeek(currentDate);

  const openMealEditor = (
    schedule: MealSchedule | null,
    mealTime: MealTime,
    mealDate: string,
  ) => {
    setEditingSchedule(schedule);
    setEditingMealTime(mealTime);
    setEditingMealDate(mealDate);
    setIsEditorOpen(true);
  };

  const closeMealEditor = () => {
    setIsEditorOpen(false);
    setEditingSchedule(null);
  };

  const handleSaveSuccess = (mealDate: string) => {
    setRefreshKeysByDate((prev) => ({
      ...prev,
      [mealDate]: (prev[mealDate] ?? 0) + 1,
    }));
  };

  return (
    <div className="h-full">
      <HeaderBar title="식단" />
      <div className="scrollbar-hide w-full overflow-y-auto scroll-smooth bg-[#F8F9F9] p-4">
        <WeekSelector currentDate={currentDate} onDateChange={setCurrentDate} />
        <div className="mt-10 flex flex-col gap-4">
          {weekDays.map((dayDate, idx) => {
            const isToday =
              dayDate.toDateString() === new Date().toDateString();
            const formattedDate = dayjs(dayDate).format("YYYY-MM-DD");
            return (
              <div key={idx} className="flex flex-col gap-1">
                <div>
                  <span className="font-medium">{formatDate(dayDate)}</span>
                  {isToday && (
                    <span className="text-verde ml-2 font-medium">TODAY</span>
                  )}
                </div>
                <DailyMealBox
                  date={formattedDate}
                  onEditRequest={openMealEditor}
                  refreshKey={refreshKeysByDate[formattedDate] ?? 0}
                />
              </div>
            );
          })}
        </div>
      </div>
      <Modal isOpen={isEditorOpen} onClose={closeMealEditor}>
        <MealItemEditor
          key={editingSchedule?.scheduleId ?? editingMealTime}
          mealDate={editingMealDate}
          mealTime={editingMealTime}
          schedule={editingSchedule}
          onSaved={handleSaveSuccess}
          onClose={closeMealEditor}
        />
      </Modal>
    </div>
  );
}
