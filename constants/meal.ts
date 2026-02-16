export const MEAL_TIME: Record<string, string> = {
  breakfast: "🌅 아침",
  lunch: "️🌤️ 점심",
  dinner: "🌙 저녁",
};

export type MealTime = keyof typeof MEAL_TIME;
