import { ItemCategory } from "@/types/category";

export async function getCategories() {
  // 서버 컴포넌트에서 호출할 때는 전체 URL이 필요할 수 있습니다.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/item-categories`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error("카테고리를 불러오지 못했습니다.");
  }

  const data = (await res.json()) as {
    success: boolean;
    categories?: ItemCategory[];
  };

  return data.categories || [];
}
