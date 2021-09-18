import { Subject } from 'rxjs';

export enum SegmentifyActionType {
  ADD = 'add',
  GET = 'get',
  DELETE = 'delete',
}

export interface SegmentifyAction {
  type: SegmentifyActionType;
  affectedObjectName: string;
  subject: Subject<any>;
}

export interface SegmentifyProduct {
  brand: string;
  category: string[];
  currency: string;
  image: string;
  inStock: boolean;
  insertTime: number;
  language: string;
  lastUpdateTime: number;
  name: string;
  oldPriceText: string;
  params: Record<string, string>;
  price: number;
  priceText: string;
  productId: string;
  publishTime: number;
  specialPriceText: string;
  url: string;
}

export interface SegmentifyEvent extends CustomEvent {
  detail: SegmentifyProduct[];
  type: string;
}
