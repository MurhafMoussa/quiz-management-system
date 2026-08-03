export class TimeUtils {
  static convertSecondsToMilliseconds(seconds: number): number {
    return seconds * 1000;
  }
  static convertMinutesToMilliseconds(minutes: number): number {
    return minutes * 60 * 1000;
  }
}
