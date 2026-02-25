"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UtensilsCrossed, Calendar, Wallet } from "lucide-react";

const navigationItems = [
  {
    name: "식비",
    href: "/expense",
    icon: Wallet,
  },
  {
    name: "식단",
    href: "/",
    icon: Calendar,
  },
  {
    name: "레시피",
    href: "/recipes",
    icon: UtensilsCrossed,
  },
];

const emptySubscribe = () => () => {};
const getSnapshot = () => true; // 클라이언트에서는 무조건 true
const getServerSnapshot = () => false; // 서버에서는 무조건 false

export default function BottomNavigation() {
  const pathname = usePathname();

  // 서버에서는 false, 클라이언트에서는 true를 안전하게 반환
  const isClient = useSyncExternalStore(
    emptySubscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (!isClient) return <div className="h-[60px] border-t bg-white" />;

  return (
    <nav className="safe-area-inset-bottom fixed right-0 bottom-0 left-0 z-50 border-t border-gray-200 bg-white shadow-lg">
      <div className="pb-safe mx-auto flex h-[60px] max-w-md items-center justify-around">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex h-full flex-1 flex-col items-center justify-center transition-colors ${
                isActive
                  ? "text-[#339551]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon
                className={`mb-1 h-5 w-5 ${
                  isActive ? "stroke-[2.5]" : "stroke-2"
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  isActive ? "text-[#339551]" : "text-gray-500"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
