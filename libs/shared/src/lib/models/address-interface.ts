import {
  AddCorporateInvoiceAddressFormBean,
  AddPersonalInvoiceAddressFormBean,
} from '@migroscomtr/sanalmarket-angular';

enum AddressTypeModel {
  INVOICE = 'invoice',
  DELIVERY = 'delivery',
}

enum AddressOwnerModel {
  PERSONAL = 'personal',
  CORPORATE = 'corporate',
}

interface AddressOptionsModel {
  type?: AddressTypeModel;
  owner?: AddressOwnerModel;
}

interface AddressDialogModel {
  dialogData: AddressDialogUiDataModel;
  formData: AddressDialogFormDataModel;
}

interface AddressDialogUiDataModel {
  header: string;
}

interface AddressDialogFormDataModel {
  addressType: string;
  title: string;
  firstName: string;
  lastName: string;
  city: string;
  district: string;
  quarter: string;
  street: string;
  no: string;
  additional: string;
  phoneNumber: string;
  town: string;
}

interface AddressFormEmitModel {
  formValue: AddPersonalInvoiceAddressFormBean | AddCorporateInvoiceAddressFormBean;
  owner: AddressOwnerModel;
}

interface CityModel {
  createdAt: number;
  externalId: string;
  id: number;
  lastUpdatedAt: number;
  latitude: number;
  longitude: number;
  name: string;
  population: number;
  version: number;
}

interface TownModel {
  cityId: number;
  createdAt: number;
  externalId: string;
  id: number;
  lastUpdatedAt: number;
  latitude: number;
  longitude: number;
  name: string;
  population: number;
  version: number;
}

interface DistrictModel {
  createdAt: number;
  externalId: string;
  id: number;
  lastUpdatedAt: number;
  latitude: number;
  longitude: number;
  name: string;
  population: number;
  townId: number;
  version: number;
  zipCode: number;
}

interface StreetModel {
  createdAt: number;
  districtId: number;
  externalId: string;
  id: number;
  lastUpdatedAt: number;
  latitude: number;
  longitude: number;
  name: string;
  type: string;
  version: number;
}

interface PickPointModel {
  companyId?: number;
  createdAt?: number;
  id?: number;
  lastUpdatedAt?: number;
  name?: string;
  type?: string;
  fullAddress?: string;
}

interface FoundationModel {
  companyId?: number;
  createdAt?: number;
  iconUrl?: string;
  id?: number;
  lastUpdatedAt?: number;
  name?: string;
}

interface DeliverableModel {
  deliverable?: boolean;
  undeliverable?: boolean;
}

interface AddNewAddressModel extends AddPersonalInvoiceAddressFormBean {
  saveAsInvoice?: { [key: string]: boolean };
  id?: number;
}

export {
  AddressOptionsModel,
  AddressTypeModel,
  AddressOwnerModel,
  AddressDialogModel,
  AddressDialogUiDataModel,
  AddressDialogFormDataModel,
  AddressFormEmitModel,
  CityModel,
  TownModel,
  DistrictModel,
  PickPointModel,
  FoundationModel,
  StreetModel,
  DeliverableModel,
  AddNewAddressModel,
};
