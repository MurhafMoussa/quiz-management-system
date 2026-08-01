import { TimeUtils } from './time.utils';

describe('TimeUtils', () => {
  it('should correctly convert seconds to milliseconds', () => {
    expect(TimeUtils.convertSecondsToMilliseconds(1)).toBe(1000);
    expect(TimeUtils.convertSecondsToMilliseconds(60)).toBe(60000);
  });

  it('should correctly convert minutes to milliseconds', () => {
    expect(TimeUtils.convertMinutesToMilliseconds(1)).toBe(60000);
    expect(TimeUtils.convertMinutesToMilliseconds(15)).toBe(900000);
  });
});
