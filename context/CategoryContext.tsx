"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getCategories } from "@/lib/api";
import { ItemCategory } from "@/lib/generated/prisma/client";

const CategoryContext = createContext<ItemCategory[]>([]);

const AUTH_PATHS = new Set(["/login", "/signup"]);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    if (AUTH_PATHS.has(pathname)) return;
    if (categories.length > 0) return;

    let isMounted = true;
    getCategories()
      .then((data) => {
        if (isMounted) setCategories(data);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [pathname, categories.length]);

  return (
    <CategoryContext.Provider value={categories}>
      {children}
    </CategoryContext.Provider>
  );
}

export const useCategory = () => useContext(CategoryContext);
