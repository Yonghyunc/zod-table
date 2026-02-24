"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getCategories } from "@/lib/api";
import { ItemCategory } from "@/lib/generated/prisma/client";

const CategoryContext = createContext<ItemCategory[]>([]);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<ItemCategory[]>([]);

  useEffect(() => {
    // 앱 실행 시 딱 한 번만 실행됨
    getCategories().then(setCategories);
  }, []);

  return (
    <CategoryContext.Provider value={categories}>
      {children}
    </CategoryContext.Provider>
  );
}

export const useCategory = () => useContext(CategoryContext);
