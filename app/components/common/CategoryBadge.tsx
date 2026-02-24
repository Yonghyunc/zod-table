"use client";

import { getCategoryColor } from "@/app/_utils/colors";
import { Badge } from "@/components/ui/badge";
import { useCategory } from "@/context/CategoryContext";

export function CategoryBadge({ id }: { id: string }) {
  const categories = useCategory(); // 전역 상태에서 바로 꺼냄

  // 전달받은 id와 일치하는 카테고리의 인덱스를 찾음
  const index = categories.findIndex((cat) => cat.categoryId === id);
  const category = categories[index];

  if (!category) return null; // 데이터 로딩 전 처리

  return (
    <Badge className={`rounded text-[10.5px] ${getCategoryColor(index)}`}>
      {category.categoryName}
    </Badge>
  );
}
