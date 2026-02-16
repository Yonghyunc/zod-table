"use client";

import { Badge } from "@/components/ui/badge";

const COLORS: Record<string, string> = {
  집밥: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  도시락: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  외식: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  배달: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  기타: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
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
