import { Response } from '../models';

function isSuccessful(response: Response) {
  return response.responseCode === '0000' || response.responseCode === '';
}

function hasMasterpassAccount(accountStatus: string) {
  return accountStatus[1] === '1';
}

function hasRegisteredCardInMasterpassAccount(accountStatus: string) {
  return accountStatus[2] === '1';
}

function isMasterpassAccountLinked(accountStatus: string) {
  return accountStatus[3] === '1';
}

function isMasterpassAccountBlocked(accountStatus: string) {
  return accountStatus[4] === '1';
}

function isMasterpassAccountInvalidToken(accountStatus: string) {
  return accountStatus[6] === '1';
}

export {
  isSuccessful,
  hasMasterpassAccount,
  hasRegisteredCardInMasterpassAccount,
  isMasterpassAccountLinked,
  isMasterpassAccountBlocked,
  isMasterpassAccountInvalidToken,
};
