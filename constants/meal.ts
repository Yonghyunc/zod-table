export const MEAL_TIMES = ["breakfast", "lunch", "dinner", "snack"] as const;

export type MealTime = (typeof MEAL_TIMES)[number];

export const MEAL_TIME: Record<MealTime, string> = {
  breakfast: "🌅 아침",
  lunch: "️🌤️ 점심",
  dinner: "🌙 저녁",
  snack: "🍎 간식",
};
