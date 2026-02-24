"use client";

import { Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useMemo } from "react";
import { useCategory } from "@/context/CategoryContext";
import { getCategoryChartColor } from "@/app/_utils/colors";

interface PieCategoryData {
  categoryId: string;
  categoryName: string;
  ratio: number;
  totalAmount: number;
}

interface Props {
  data: PieCategoryData[];
}

export function CustomPieChart({ data }: Props) {
  const categories = useCategory();

  const chartData = useMemo(() => {
    return data.map((item, index) => {
      const categoryIndex = categories.findIndex(
        (category) => category.categoryId === item.categoryId,
      );
      const colorIndex = categoryIndex >= 0 ? categoryIndex : index;

      return {
        ...item,
        fill: getCategoryChartColor(colorIndex),
      };
    });
  }, [categories, data]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      ratio: {
        label: "비율",
      },
    };

    chartData.forEach((item) => {
      config[item.categoryName] = {
        label: item.categoryName,
        color: item.fill,
      };
    });

    return config;
  }, [chartData]);

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[250px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, name, item) => (
                <div className="flex w-full items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-[2px]"
                      style={{
                        backgroundColor: String(
                          item.payload.fill ?? item.color,
                        ),
                      }}
                    />
                    <span>{String(name)}</span>
                  </span>
                  <span className="font-mono">
                    {Number(value).toFixed(1)}% (
                    {(item.payload.totalAmount as number).toLocaleString()}원)
                  </span>
                </div>
              )}
            />
          }
        />
        <Pie data={chartData} dataKey="ratio" nameKey="categoryName" />
        <ChartLegend
          content={({ payload }) => (
            <div className="flex w-full flex-wrap justify-center gap-x-3 gap-y-1 pt-3">
              {(payload ?? []).map((item) => (
                <div
                  key={String(item.value)}
                  className="flex shrink-0 items-center gap-1.5 whitespace-nowrap"
                >
                  <span
                    className="inline-block h-2 w-2 rounded-[2px]"
                    style={{ backgroundColor: String(item.color) }}
                  />
                  <span className="text-xs">{String(item.value)}</span>
                </div>
              ))}
            </div>
          )}
          className="-translate-y-2"
        />
      </PieChart>
    </ChartContainer>
  );
}
