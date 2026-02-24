/**
 * 해당 날짜가 그 달의 몇 번째 주인지 계산하는 함수
 */
const getWeekInfo = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // 해당 달의 1일이 무슨 요일인지 (0: 일, 1: 월 ...)
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // 월요일 기준 보정 (일요일을 7로 취급하거나, 프로젝트 기준에 맞춰 조정 가능)
  // 여기서는 1일이 속한 주를 1주차로 계산합니다.
  const weekNum = Math.ceil((day + firstDayOfMonth) / 7);

  return {
    month: month + 1, // 0~11 이므로 +1
    weekNum: weekNum,
  };
};

/**
 * 오늘 날짜를 기준으로 주차 정보를 가져오는 메인 로직
 */
export const getWeekDisplay = (baseDate: Date) => {
  const today = new Date(baseDate);
  const currentDay = today.getDay(); // 0(일)~6(토)

  // 이번 주의 월요일과 일요일 구하기
  const diffToMon = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMon);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const start = getWeekInfo(monday);

  return `${start.month}월 ${start.weekNum}주차`;
};
