/**
 * 기준 날짜가 포함된 주의 월요일부터 일요일까지 7일간의 Date 객체 배열을 반환합니다.
 */
export const getDaysInWeek = (baseDate: Date): Date[] => {
  const date = new Date(baseDate);
  const day = date.getDay(); // 0(일) ~ 6(토)
  
  // 월요일을 시작점으로 잡기 위한 보정값 계산
  // 일요일(0)이면 -6, 그 외에는 1-day
  const diffToMonday = day === 0 ? -6 : 1 - day;
  
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);

  // 월요일부터 7일간 배열 생성
  return Array.from({ length: 7 }, (_, i) => {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    return nextDay;
  });
};