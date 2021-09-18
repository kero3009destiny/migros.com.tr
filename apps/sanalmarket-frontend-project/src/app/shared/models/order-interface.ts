import { EtaInfo, OrderPaymentDTO } from '@migroscomtr/sanalmarket-angular';

export enum OrderSummaryType {
  DISTRICT = 'DISTRICT',
  SHIPMENT = 'SHIPMENT',
  PICK_POINT = 'PICK_POINT',
  FOUNDATION = 'FOUNDATION',
  DISTRICT_INSTANT = 'DISTRICT_INSTANT',
  DISTRICT_TIMESLOT = 'DISTRICT_TIMESLOT',
}

export interface OrderSummaryFields {
  orderType: OrderSummaryType;
  itemCount: number;
  deliveryAddressName?: string; //needed for the foundation, pick_point cases
  deliveryDate: string;
  timeSlotDetails: string;
  orderAmount: number;
  deliveryFee: number;
  migrosDiscount?: number;
  cartDiscount?: number;
  specialDiscount?: number;
  couponDiscount?: number;
  instantDiscount?: number;
  payments?: Array<OrderPaymentDTO>;
  overallTotal: number;
  etaInfo?: EtaInfo;
  isAnonymousOrderTrackInfoShown?: boolean;
}
