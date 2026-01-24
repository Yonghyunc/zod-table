'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UtensilsCrossed, Calendar, Wallet } from 'lucide-react';

const navigationItems = [
  {
    name: '식비',
    href: '/expense',
    icon: Wallet,
  },
  {
    name: '식단',
    href: '/',
    icon: Calendar,
  },
  {
    name: '레시피',
    href: '/recipes',
    icon: UtensilsCrossed,
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto pb-safe">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-[#339551]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon
                className={`w-6 h-6 mb-1 ${
                  isActive ? 'stroke-[2.5]' : 'stroke-2'
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  isActive ? 'text-[#339551]' : 'text-gray-500'
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
