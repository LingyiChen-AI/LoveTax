export const SUPPORTED_TIMEZONES = [
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Tokyo',
  'America/Los_Angeles',
  'America/New_York',
  'Europe/London',
  'UTC'
] as const;

export type SupportedTimezone = (typeof SUPPORTED_TIMEZONES)[number];
