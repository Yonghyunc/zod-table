// tailwind 클래스 모음
export const CATEGORY_COLORS = [
  "bg-blue-200 text-blue-900 dark:bg-blue-950 dark:text-blue-300",
  "bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-300",
  "bg-sky-200 text-sky-900 dark:bg-sky-950 dark:text-sky-300",
  "bg-amber-200 text-amber-900 dark:bg-amber-950 dark:text-amber-300",
  "bg-red-200 text-red-900 dark:bg-red-950 dark:text-red-300",
  "bg-indigo-200 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300",
  "bg-purple-200 text-purple-900 dark:bg-purple-950 dark:text-purple-300",
];

export const CATEGORY_CHART_COLORS = [
  "#93c5fd", // blue-300
  "#86efac", // green-300
  "#7dd3fc", // sky-300
  "#fcd34d", // amber-300
  "#fca5a5", // red-300
  "#a5b4fc", // indigo-300
  "#d8b4fe", // purple-300
];

export const getCategoryColor = (index: number) => {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
};

export const getCategoryChartColor = (index: number) => {
  return CATEGORY_CHART_COLORS[index % CATEGORY_CHART_COLORS.length];
};
