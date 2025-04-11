// utils/formatTime.ts

/**
 * Định dạng mili giây thành chuỗi thời gian MM:SS.
 * @param millis - Thời gian bằng mili giây.
 * @returns Chuỗi định dạng MM:SS hoặc '--:--' nếu đầu vào không hợp lệ.
 */
export const formatMillisToTime = (millis: number | undefined | null): string => {
    if (millis === null || millis === undefined || isNaN(millis) || millis < 0) {
        return '--:--';
    }

    const totalSeconds = Math.floor(millis / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60);

    const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${paddedMinutes}:${paddedSeconds}`;
};