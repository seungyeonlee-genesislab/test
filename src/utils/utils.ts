//* Cropper
export const secondsToTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

//* Trimmer
export interface TrimmedVideoDuration {
  startHour: number | '';
  startMin: number | '';
  startSec: number | '';
  endHour: number | '';
  endMin: number | '';
  endSec: number | '';
}

export const validateTimeByName = (name: string, value: string): string => {
  const nameRegex = /(Min|Sec)/;
  const valueRegex = /^([0-5]?\d)$/;

  if (nameRegex.test(name)) {
    return valueRegex.test(value) ? value : '0';
  }
  return value;
};

export const getTimeDiffInSeconds = (trimmedVideoDuration: TrimmedVideoDuration): number => {
  const { startHour, startMin, startSec, endHour, endMin, endSec } = trimmedVideoDuration;
  const startSeconds =
    parseInt(String(startHour || 0)) * 3600 +
    parseInt(String(startMin || 0)) * 60 +
    parseInt(String(startSec || 0));
  const endSeconds =
    parseInt(String(endHour || 0)) * 3600 +
    parseInt(String(endMin || 0)) * 60 +
    parseInt(String(endSec || 0));

  return endSeconds - startSeconds;
};
