"use client";

import { Badge } from "@/components/ui/badge";

const COLORS: Record<string, string> = {
  집밥: "bg-amber-200 text-amber-900 dark:bg-amber-950 dark:text-amber-300",
  도시락: "bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-300",
  외식: "bg-sky-200 text-sky-900 dark:bg-sky-950 dark:text-sky-300",
  배달: "bg-purple-200 text-purple-900 dark:bg-purple-950 dark:text-purple-300",
  기타: "bg-red-200 text-red-900 dark:bg-red-950 dark:text-red-300",
};

const MEAL_TYPE: Record<string, string> = {
  0: "집밥",
  1: "도시락",
  2: "외식",
  3: "배달",
  4: "기타",
};

interface Props {
  type: keyof typeof MEAL_TYPE;
}

export function MealTypeBadge({ type }: Props) {
  return (
    <Badge
      className={`rounded ${
        COLORS[MEAL_TYPE[type]] ||
        "bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300"
      } `}
    >
      {MEAL_TYPE[type]}
    </Badge>
  );
}
