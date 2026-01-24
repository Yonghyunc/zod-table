'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import MealBox from '@/app/components/MealBox';

interface DateItem {
  date: Date;
  key: string;
}

export default function WeeklyScheduler() {
  const [dates, setDates] = useState<DateItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);
  const initialScrollDone = useRef(false);

  // 날짜를 YYYY-MM-DD 형식의 키로 변환
  const getDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 날짜 배열 초기화 (오늘을 포함한 7일)
  const initializeDates = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const initialDates: DateItem[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      initialDates.push({
        date,
        key: getDateKey(date),
      });
    }
    console.log(initialDates)
    setDates(initialDates);
  }, []);

  // 이전 날짜들 추가
  const loadPreviousDates = useCallback(() => {
    console.log('prev')
    if (isLoading || dates.length === 0) return;
    
    setIsLoading(true);
    const firstDate = dates[0].date;
    const newDates: DateItem[] = [];
    
    // 이전 7일 추가
    for (let i = 7; i >= 1; i--) {
      const date = new Date(firstDate);
      date.setDate(firstDate.getDate() - i);
      newDates.push({
        date,
        key: getDateKey(date),
      });
    }
    
    // 현재 스크롤 위치 저장
    const currentScrollTop = containerRef.current?.scrollTop || 0;
    
    setDates((prev) => [...newDates, ...prev]);
    
    // 스크롤 위치 유지 (새로 추가된 항목들의 높이만큼 스크롤 위치 조정)
    setTimeout(() => {
      if (containerRef.current) {
        // 각 날짜 박스의 높이 (대략 200px) + gap (16px) = 216px
        const itemHeight = 216;
        const newContentHeight = newDates.length * itemHeight;
        containerRef.current.scrollTop = currentScrollTop + newContentHeight;
      }
      setIsLoading(false);
    }, 0);
  }, [dates, isLoading]);

  // 다음 날짜들 추가
  const loadNextDates = useCallback(() => {
    console.log('next')
    if (isLoading || dates.length === 0) return;
    
    setIsLoading(true);
    const lastDate = dates[dates.length - 1].date;
    const newDates: DateItem[] = [];
    
    // 다음 7일 추가
    for (let i = 1; i <= 7; i++) {
      const date = new Date(lastDate);
      date.setDate(lastDate.getDate() + i);
      newDates.push({
        date,
        key: getDateKey(date),
      });
    }
    
    setDates((prev) => [...prev, ...newDates]);
    setIsLoading(false);
  }, [dates, isLoading]);

  // 날짜 포맷팅
  const formatDate = (date: Date): { day: string; date: string; month: string, dateDisplay: string, isToday: boolean } => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const day = days[date.getDay()];
    const dateNum = date.getDate();
    const month = date.getMonth() + 1;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = date.getTime() === today.getTime();
    
    // 1일인 경우에만 월/일 형식으로 표시
    const dateDisplay = dateNum === 1 ? `${month}/${dateNum}` : dateNum.toString();
    
    return {
      day,
      date: dateNum.toString(),
      month: `${month}월`,
      dateDisplay,
      isToday
    };
  };

  // Intersection Observer 설정
  useEffect(() => {
    if (!topSentinelRef.current || !bottomSentinelRef.current) return;

    const topObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadPreviousDates()
        }
      },
      { threshold: 0.5 }
    );

    const bottomObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadNextDates();
        }
      },
      { threshold: 0.5 }
    );

    topObserver.observe(topSentinelRef.current);
    bottomObserver.observe(bottomSentinelRef.current);

    return () => {
      topObserver.disconnect();
      bottomObserver.disconnect();
    };
  }, [loadPreviousDates, loadNextDates, isLoading]);

  // 초기화 및 오늘 날짜로 스크롤
  useEffect(() => {
    initializeDates();
    
    // 초기 렌더링 후 오늘 날짜로 스크롤
    setTimeout(() => {
      if (containerRef.current && !initialScrollDone.current) {
        containerRef.current.scrollTop = 0;
        initialScrollDone.current = true;
      }
    }, 100);
  }, [initializeDates]);

  return (
    <div
      ref={containerRef}
      className="relative h-[calc(100vh-4rem)] overflow-y-auto scroll-smooth scrollbar-hide"
    >
      {/* 상단 센티넬 (이전 날짜 로드 트리거) */}
      {/* <div ref={topSentinelRef} className="h-1 relative z-10" /> */}

        <div className="space-y-3">
          {dates.map((item, index) => {
            const { day, date, month, dateDisplay, isToday } = formatDate(item.date);
            return (
              <div
                key={item.key}
                className="relative p-2 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-2 w-full">
                    <div
                      className={`flex items-center justify-start gap-1 ${
                        isToday
                          ? 'text-[#339551]'
                          : 'text-gray-600'
                      }`}
                    >
                      {/* <div className="absolute top-3 left-0 w-3 h-2 bg-[#339551] rounded-r-sm"></div> */}
                      <span className="text-sm font-bold">{day}</span>
                      <span className="text-sm font-bold">{dateDisplay}</span>
                    </div>
                    <MealBox type="breakfast" date={item.date}/>
                    <MealBox type="lunch" date={item.date}/>
                    <MealBox type="dinner" date={item.date}/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      
      {/* 하단 센티넬 (다음 날짜 로드 트리거) */}
      {/* <div ref={bottomSentinelRef} className="h-1 relative z-10" /> */}
      
      {/* 로딩 인디케이터 */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="text-sm text-gray-400">로딩 중...</div>
        </div>
      )}
    </div>
  );
}
