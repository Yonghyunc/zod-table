"use client";

import { useState, useRef, useEffect } from "react";
export type MealType = "breakfast" | "lunch" | "dinner";

const mealLabels: Record<MealType, string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
};

interface Props {
  date: Date;
}

export default function DailyMealBox({ date }: Props) {
  return <div className="shadow-box rounded bg-white p-4">깔깔</div>;
}
