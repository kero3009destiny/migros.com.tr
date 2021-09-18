import { OrderInfoDTO } from '@migroscomtr/sanalmarket-angular';

import { OrderSummaryType } from '../models';

// TODO - emin : get from orderInfo after api cleanup job https://e-migros.atlassian.net/browse/F1-2927
export const getOrderSummaryTypeFromOrderInfo = (orderInfo: OrderInfoDTO): OrderSummaryType => {
  switch (orderInfo.line.serviceAreaObjectType) {
    case 'DISTRICT':
      if (orderInfo.line['deliveryModel'] === 'SHIPMENT') {
        return OrderSummaryType.SHIPMENT;
      } else if (orderInfo.line.scheduleType === 'INSTANT') {
        return OrderSummaryType.DISTRICT_INSTANT;
      } else {
        return OrderSummaryType.DISTRICT_TIMESLOT;
      }
    case 'PICK_POINT':
      return OrderSummaryType.PICK_POINT;
    case 'FOUNDATION':
      return OrderSummaryType.FOUNDATION;
  }
};

const deliveryAddressNameKeyMap = {
  FOUNDATION: 'foundation',
  PICK_POINT: 'pickPoint',
  DISTRICT_TIMESLOT: 'district',
  DISTRICT_INSTANT: 'district',
  SHIPMENT: 'district',
};

// TODO - emin : get from orderInfo after api cleanup job https://e-migros.atlassian.net/browse/F1-2927
export const getEmbeddedDeliveryAddressName = (orderInfo: OrderInfoDTO): string => {
  const orderType = getOrderSummaryTypeFromOrderInfo(orderInfo);
  const embeddedFieldKey = deliveryAddressNameKeyMap[orderType];
  return JSON.parse(orderInfo.line.embeddedDeliveryAddressInfo)[embeddedFieldKey]['name'];
};
