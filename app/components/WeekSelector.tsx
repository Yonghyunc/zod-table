"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface Props {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export default function WeekSelector({ currentDate, onDateChange }: Props) {
  // 주차 계산 로직 (내부 함수)
  const getWeekInfo = (date: Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    // 1일이 속한 주를 1주차로 계산
    const weekNum = Math.ceil((day + firstDayOfMonth) / 7);
    return { month: month + 1, weekNum };
  };

  const getWeekDisplay = (baseDate: Date) => {
    const today = new Date(baseDate);
    const currentDay = today.getDay(); // 0(일)~6(토)

    // 이번 주의 월요일과 일요일 구하기
    const diffToMon = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMon);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const start = getWeekInfo(monday);
    // const end = getWeekInfo(sunday);

    // if (start.month !== end.month) {
    //   return `${start.month}월 ${start.weekNum}주 ~ ${end.month}월 ${end.weekNum}주차`;
    // }
    return `${start.month}월 ${start.weekNum}주차`;
  };

  // 주 단위 이동 핸들러 (부모의 상태를 변경)
  const moveWeek = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + offset);
    onDateChange(newDate); // 부모에게 알려줌!
  };

  // // 3. 주 단위 이동 핸들러
  // const handlePrevWeek = () => {
  //   const newDate = new Date(currentDate);
  //   newDate.setDate(currentDate.getDate() - 7);
  //   setCurrentDate(newDate);
  // };

  // const handleNextWeek = () => {
  //   const newDate = new Date(currentDate);
  //   newDate.setDate(currentDate.getDate() + 7);
  //   setCurrentDate(newDate);
  // };

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
      <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-1">
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
