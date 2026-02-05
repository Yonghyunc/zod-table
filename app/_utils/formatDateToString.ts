const week = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * 날짜를 "D일 (요일)" 형식의 문자열로 포맷팅
 * 1일의 경우 월 표시 추가
 */
export const formatDate = (date: Date) => {
  const day = date.getDate();
  const dayName = week[date.getDay()];
  if (day == 1) {
    const month = date.getMonth() + 1;
    return `${month}월 ${day}일 (${dayName})`;
  }
  return `${day}일 (${dayName})`;
};
