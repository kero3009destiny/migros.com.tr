import {
  faAddressCard,
  faCheck,
  faCreditCard,
  faLiraSign,
  faMobileAlt,
  faMoneyBillWaveAlt,
  faShieldCheck,
  IconDefinition,
} from '@fortawesome/pro-solid-svg-icons';

export interface MoneyTransferStepsModel {
  description: string;
  image?: string;
  icon?: IconDefinition;
}

export interface StoreModel {
  addressDetail: string;
  cityName: string;
  createdAt: number;
  ibanActive: boolean;
  ibanMaxAmount: string;
  id: number;
  lastUpdatedAt: number;
  moneyActive: boolean;
  moneyMaxAmount: string;
  phoneNumber: string;
  townName: string;
  warehouseId: number;
  warehouseName: string;
}

export interface CostModel {
  minSendLimit: number;
  maxSendLimit: number;
  cost: number;
}

export const AMOUNTS = [
  { name: '0-1.999 TL', value: 'AMOUNT_0_1999' },
  { name: '2.000-7.000 TL', value: 'AMOUNT_2000_7000' },
];

export const TYPES = [
  { name: 'Para Gönderim ve Para Alım', value: 'MONEY_TRANSFER' },
  { name: "IBAN'a Gönderim", value: 'IBAN_TRANSFER' },
];

export const COSTS = [
  {
    minSendLimit: 0,
    maxSendLimit: 2000,
    cost: 6,
  },
  { minSendLimit: 2001, maxSendLimit: 5000, cost: 12 },
  { minSendLimit: 5001, maxSendLimit: 7000, cost: 20 },
];

export const STORE_STEPS = [
  {
    description: "Size en yakın Migros'a gelin.",
    image: 'migros-icon.svg',
  },
  {
    description: 'Fotoğraflı kimlik belgeniz yanınızda olsun.',
    icon: faAddressCard,
  },
  {
    description: 'Göndermek istediğiniz tutarı iletin.',
    icon: faLiraSign,
  },
  {
    description: 'Cep telefonunuza gelen şifreyi personelimize iletin.',
    icon: faMobileAlt,
  },
  {
    description: 'Paranız gönderildi.',
    icon: faCheck,
  },
];

export const WEB_STEPS = [
  {
    description: 'https://gonder-al.com/money-transfer sitesine girin.',
    image: 'gonder-al-icon.png',
  },
  {
    description: 'Gönderim türünü ödeme noktasına gönderi seçin.',
    image: 'migros-icon.svg',
  },
  {
    description: 'Göndermek istediğiniz tutarı girin ve gerekli bilgileri doldurun.',
    icon: faLiraSign,
  },
  {
    description: 'Kredi kartı ile ödeme yapın.',
    icon: faCreditCard,
  },
  {
    description: 'Paranız gönderildi, mağazalarımızdan çekebilirsiniz.',
    icon: faCheck,
  },
];

export const WITHDRAW_STEPS = [
  {
    description: "Size en yakın Migros'a gelin.",
    image: 'migros-icon.svg',
  },
  {
    description: 'Fotoğraflı kimlik belgeniz yanınızda olsun.',
    icon: faAddressCard,
  },
  {
    description: "Göndericiden temin ettiğiniz Referans Kodu'nu iletin.",
    icon: faShieldCheck,
  },
  {
    description: 'Cep telefonunuza gelen şifreyi personelimize iletin.',
    icon: faMobileAlt,
  },
  {
    description: 'Paranızı alabilirsiniz.',
    icon: faMoneyBillWaveAlt,
  },
];
