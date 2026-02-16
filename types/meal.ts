import { MealTime } from "@/constants/meal";

export interface MealSchedule {
  scheduleId: string;
  mealDate: string;
  mealTime: MealTime;
  mealType: string | null;
  mealMemo: string | null;
  logs: MealLog[];
}

export interface MealLog {
  logId: string;
  menuName: string;
}
