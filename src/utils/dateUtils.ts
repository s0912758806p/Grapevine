/**
 * 日期处理工具函数
 */

/**
 * 统一的日期格式化函数
 * @param date Date对象
 * @returns 格式化后的日期字符串 MM/DD/YYYY
 */
export const formatDateString = (date: Date): string => {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

/**
 * 格式化短日期
 * @param timestamp 时间戳
 * @returns 格式化后的日期字符串 MM/DD/YYYY
 */
export const formatShortDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return formatDateString(date);
};

/**
 * 格式化日期和时间
 * @param timestamp 时间戳
 * @returns 格式化后的日期时间字符串 MM/DD/YYYY HH:MM
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const dateStr = formatDateString(date);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${dateStr} ${hours}:${minutes}`;
};

/**
 * 获取以给定时间戳为中心的邻近日期
 * @param timestamp 中心时间戳
 * @param dayRange 范围天数
 * @param minTime 最小时间限制
 * @returns 邻近日期字符串数组
 */
export const getNearbyDates = (
  timestamp: number,
  dayRange: number,
  minTime: number
): string[] => {
  const dates: string[] = [];
  const currentDate = new Date(timestamp);

  // 获取前后日期
  for (let i = -dayRange; i <= dayRange; i++) {
    if (i === 0) continue; // 跳过当前日期

    // 创建新日期对象避免修改原始对象
    const nearbyDate = new Date(currentDate.getTime());
    // 通过调整天数设置日期
    nearbyDate.setDate(currentDate.getDate() + i);

    // 仅包含时间范围内的日期
    if (nearbyDate.getTime() >= minTime && nearbyDate.getTime() <= Date.now()) {
      dates.push(formatShortDate(nearbyDate.getTime()));
    }
  }

  return dates;
};

/**
 * 计算指定天数前的时间戳
 * @param days 天数
 * @returns 指定天数前的时间戳
 */
export const getDateBeforeDays = (days: number): number => {
  return Date.now() - days * 24 * 60 * 60 * 1000;
};
