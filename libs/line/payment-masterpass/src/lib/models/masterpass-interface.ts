type MasterpassCallback<T extends Response = Response> = (status: string, response: T) => void;

interface MasterPassClientInterface {
  setClientId: (clientId: string) => void;
  setAddress: (url: string) => void;
  listCards: (phoneNumber: string, token: string, callback: MasterpassCallback<ListCardResponse>) => void;
  checkMasterPass: (checkInputs: HTMLInputElement[], callback: MasterpassCallback<CheckMasterpassResponse>) => void;
  linkCardToClient: (linkInputs: HTMLInputElement[], callback: MasterpassCallback) => void;
  validateTransaction: (validationInputs: HTMLInputElement[], callback: MasterpassCallback) => void;
  getLastToken: () => string;
  resendOtp: (token: string, lang: string, callback: MasterpassCallback) => void;
  register: (registerInputs: HTMLInputElement[], callback: MasterpassCallback) => void;
  deleteCard: (removeInputs: HTMLInputElement[], callback: MasterpassCallback) => void;
  purchase: (purchaseInputs: HTMLInputElement[], callback: MasterpassCallback<PurchaseResponse>) => void;
  updateUser: (updateUserInputs: HTMLInputElement[], callback: MasterpassCallback) => void;
}

interface TokenInfo {
  amount?: number;
  callbackUrl?: string;
  posOrderId?: string;
  token?: string;
}

interface Response {
  responseCode: string;
  responseDescription: string;
}

interface ListCardResponse extends Response {
  cards: Card[];
}

interface CheckMasterpassResponse extends Response {
  accountStatus: string;
}

interface PurchaseResponse extends Response {
  token: string;
  url3D: string;
}

interface Card {
  Name: string;
  Value1: string;
  BankIca: string;
}

enum UserStatus {
  GUEST,
  LINKABLE,
  LINKED,
  BLOCKED,
  UPDATE_NEEDED,
  UPDATE_APPROVED,
}

enum PurchaseStatus {
  INIT,
  CLIENT_PURCHASE,
  CLIENT_VALIDATION,
  SERVER_PURCHASE,
  COMPLETED,
}

enum ValidationStatus {
  INIT,
  BANK_VALIDATION,
  MP_VALIDATION,
  UNSUCCESSFUL,
  SUCCESSFUL,
}

export {
  MasterPassClientInterface,
  TokenInfo,
  Card,
  Response,
  UserStatus,
  PurchaseStatus,
  ValidationStatus,
  PurchaseResponse,
};
