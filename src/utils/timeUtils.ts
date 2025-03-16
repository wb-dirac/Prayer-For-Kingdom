/**
 * 格式化日期时间
 * @param date 日期对象
 * @returns 格式化后的日期时间字符串
 */
export const formatTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * 格式化持续时间（毫秒）
 * @param duration 持续时间（毫秒）
 * @returns 格式化后的持续时间字符串
 */
export const formatDuration = (duration: number): string => {
  const totalSeconds = Math.floor(duration / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}小时 ${minutes}分钟 ${seconds}秒`;
  } else if (minutes > 0) {
    return `${minutes}分钟 ${seconds}秒`;
  } else {
    return `${seconds}秒`;
  }
};

/**
 * 格式化日期（不含时间）
 * @param date 日期对象
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * 获取当前日期时间的时间戳
 * @returns 当前时间戳（毫秒）
 */
export const getCurrentTimestamp = (): number => {
  return Date.now();
};

/**
 * 计算两个时间戳之间的持续时间
 * @param startTime 开始时间戳
 * @param endTime 结束时间戳
 * @returns 持续时间（毫秒）
 */
export const calculateDuration = (startTime: number, endTime: number): number => {
  return endTime - startTime;
}; 