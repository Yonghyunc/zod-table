"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { getWeekDisplay } from "@/app/_utils/getCurrentWeekStatus";

interface Props {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export default function WeekSelector({ currentDate, onDateChange }: Props) {
  // 주 단위 이동 핸들러 (부모의 상태를 변경)
  const moveWeek = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + offset);
    onDateChange(newDate); // 부모에게 알려줌!
  };

  return (
    <div className="shadow-box flex h-12 w-full max-w-md items-center justify-between rounded bg-white p-4">
      {/* 왼쪽 버튼 */}
      <button
        onClick={() => moveWeek(-7)}
        className="cursor-pointer rounded-full p-2 transition-colors hover:bg-gray-100 active:scale-95"
      >
        <ChevronLeft className="#3B3B3B" size={20} />
      </button>

      {/* 중앙 주차 표시 */}
      <div>
        <span className="font-medium tracking-tight">
          {getWeekDisplay(currentDate)}
        </span>
      </div>

      {/* 오른쪽 버튼 */}
      <button
        onClick={() => moveWeek(7)}
        className="cursor-pointer rounded-full p-2 transition-colors hover:bg-gray-100 active:scale-95"
      >
        <ChevronRight className="#3B3B3B" size={20} />
      </button>
    </div>
  );
}
