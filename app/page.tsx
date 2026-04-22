"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingSchedule, setEditingSchedule] = useState<MealSchedule | null>(
    null,
  );
  const [editingMealTime, setEditingMealTime] = useState<MealTime>("breakfast");
  const [editingMealDate, setEditingMealDate] = useState<string>("");
  const [schedulesByDate, setSchedulesByDate] = useState<
    Record<string, MealSchedule[]>
  >({});

  const weekDays = useMemo(() => getDaysInWeek(currentDate), [currentDate]);

  const weekRange = useMemo(() => {
    if (weekDays.length === 0) return null;
    const sorted = [...weekDays].sort((a, b) => a.getTime() - b.getTime());
    return {
      startDate: dayjs(sorted[0]).format("YYYY-MM-DD"),
      endDate: dayjs(sorted[sorted.length - 1]).format("YYYY-MM-DD"),
    };
  }, [weekDays]);

  useEffect(() => {
    if (!weekRange) {
      setSchedulesByDate({});
      return;
    }

    let isMounted = true;

    const loadSchedules = async () => {
      try {
        const params = new URLSearchParams({
          startDate: weekRange.startDate,
          endDate: weekRange.endDate,
        });
        const response = await fetch(
          `/api/meal-schedules?${params.toString()}`,
          { cache: "no-store" },
        );
        if (!response.ok) {
          throw new Error("Failed to load meal schedules.");
        }
        const data = (await response.json()) as {
          success: boolean;
          schedules?: MealSchedule[];
        };
        if (!isMounted || !data.success) return;

        const grouped: Record<string, MealSchedule[]> = {};
        for (const schedule of data.schedules ?? []) {
          const key = dayjs(schedule.mealDate).format("YYYY-MM-DD");
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(schedule);
        }
        setSchedulesByDate(grouped);
      } catch {
        if (!isMounted) return;
        setSchedulesByDate({});
      }
    };

    void loadSchedules();
    return () => {
      isMounted = false;
    };
  }, [weekRange, refreshKey]);

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

  const handleSaveSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <HeaderBar title="식단" />
      <div className="scrollbar-hide min-h-0 w-full flex-1 overflow-y-auto scroll-smooth bg-[#F8F9F9] p-4">
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
                  schedules={schedulesByDate[formattedDate] ?? []}
                  onEditRequest={openMealEditor}
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
