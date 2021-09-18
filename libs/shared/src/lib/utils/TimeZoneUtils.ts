/**
 * Once we've used GMT+2 in Turkey and some of the users' birthdate has this offset in their birthdates
 * This method will correct date according to today's timezone offset
 * @param birthDateTimestamp
 */
export function getDate(timestamp: number): Date {
  const currentDate = new Date(timestamp);
  const today = new Date();
  return new Date(timestamp + (currentDate.getTimezoneOffset() - today.getTimezoneOffset()) * 60000);
}
