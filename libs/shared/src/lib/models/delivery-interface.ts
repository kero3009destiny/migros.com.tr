import { TimeSlotInfoDto } from '@migroscomtr/sanalmarket-angular';
interface ScheduleInfo {
  dateTimeSlotMap: Record<string, TimeSlotInfoDto>;
  firstAvailableDate: string | number;
  firstAvailableTimeSlot: TimeSlotInfoDto;
}

interface DateModel<T> {
  [key: string]: T;
}

enum ServiceAreaObjectType {
  DISTRICT = 'DISTRICT',
  POLYGON = 'POLYGON',
  PICK_POINT = 'PICK_POINT',
  FOUNDATION = 'FOUNDATION',
}

export { ScheduleInfo, DateModel, ServiceAreaObjectType };
