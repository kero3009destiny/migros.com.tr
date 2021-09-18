import { TimeSlotInfoDto } from '@migroscomtr/sanalmarket-angular';

export enum CheckoutSteps {
  ADDRESS = 'ADDRESS',
  PAYMENT = 'PAYMENT',
  SCHEDULE = 'SCHEDULE',
  SUCCESS = 'SUCCESS',
}

export interface Step {
  number: number;
  title: string;
  url: string;
  alternativeUrl?: string;
}

export interface DeliveryTimeInfo {
  timeSlot: TimeSlotInfoDto;
  date: string;
  dayName?: string;
}

export interface SummaryDeliveryPrices {
  regularDeliveryPrice: number;
  deliveryPrice: number;
}

export enum DeliveryModel {
  LAST_MILE = 'LAST_MILE',
  SHIPMENT = 'SHIPMENT',
}

export enum DeliveryType {
  INSTANT = 'INSTANT',
  TIMESLOT = 'TIME_SLOT',
  PICKPOINT = 'PICK_POINT',
}

export interface AnonymousDeliveryForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  detail?: string;
  direction?: string;
}

export type FormStatus = 'VALID' | 'INVALID';
