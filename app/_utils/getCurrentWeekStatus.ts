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
    weekNum: weekNum
  };
};


/**
 * 오늘 날짜를 기준으로 주차 정보를 가져오는 메인 로직
 */
export const getCurrentWeekStatus = () => {
  const today = new Date();
  
  // 이번 주의 시작일(월요일)과 종료일(일요일)을 구합니다.
  const currentDay = today.getDay(); // 0(일) ~ 6(토)
  const diffToMon = currentDay === 0 ? -6 : 1 - currentDay;
  const diffToSun = diffToMon + 6;

  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMon);

  const sunday = new Date(today);
  sunday.setDate(today.getDate() + diffToSun);

  const startInfo = getWeekInfo(monday);
  const endInfo = getWeekInfo(sunday);

  // 시작일과 종료일의 달이 다르면 두 개를 모두 반환
  if (startInfo.month !== endInfo.month) {
    return `${startInfo.month}월 ${startInfo.weekNum}주 ~ ${endInfo.month}월 ${endInfo.weekNum}주차`
  }

  // 달이 같으면 하나만 반환
  return `${startInfo.month}월 ${startInfo.weekNum}주차`;
};