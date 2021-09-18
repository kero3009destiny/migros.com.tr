import { Injectable } from '@angular/core';

import { EnvService } from '@fe-commerce/env-service';
import { DetailedLocationInfo, UserInfoModel, UserPreferenceMapModel } from '@fe-commerce/shared';

import { catchError, filter, map, tap } from 'rxjs/operators';

import { BehaviorSubject, EMPTY, Observable, ReplaySubject, throwError } from 'rxjs';
import {
  AddReferralCookieRequest,
  AllClaimInfoDTO1,
  AppResponse,
  AppResponseUserInfoDTO,
  BalanceDTO1,
  ClaimInfoDTO,
  ClaimMailFormBean,
  ContactSettingsFormBean,
  EmailChangeByOtpFormBean,
  HealthyLifeInfoDTO,
  IdentifyAnonymousUserBean,
  PhoneNumberChangeByOtpFormBean,
  ServiceResponse,
  ServiceResponseUserDTO,
  UserDTO,
  UserInfoDTO,
  UserLocationInfoV2,
  UserPreference,
  UserRestControllerService,
  UserStateInfo,
} from '@migroscomtr/sanalmarket-angular';

import { LoggingService } from '../../error/services/logging.service';
import { SystemCookiesService } from '../system-cookies/system-cookies.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _user = new BehaviorSubject<UserDTO>(<UserDTO>{});
  private _userState = new BehaviorSubject<UserStateInfo>(<UserStateInfo>{ cartMode: 'MAIN' });
  private _locationInfo = new BehaviorSubject<DetailedLocationInfo>(<DetailedLocationInfo>{});
  private _districtId = new ReplaySubject<number>(1);
  private _districtName = new ReplaySubject<string>(1);
  private _hasDistrictId = new ReplaySubject<boolean>(1);

  private _userPreferences = new ReplaySubject<UserPreferenceMapModel>(1);
  private _isAuthenticated = new ReplaySubject<boolean>(1);
  private _isPhoneNumberVerified = new ReplaySubject<boolean>(1);
  private _anonymousCheckoutStart = new ReplaySubject<boolean>(1);

  private _userPoints = new BehaviorSubject<{ [key: string]: BalanceDTO1 }>({});

  constructor(
    private _userRestControllerService: UserRestControllerService,
    private _systemCookiesService: SystemCookiesService,
    private _loggingService: LoggingService,
    private _envService: EnvService
  ) {}

  get user$() {
    return this._user.asObservable();
  }

  get locationInfo$(): Observable<DetailedLocationInfo> {
    return this._locationInfo.asObservable();
  }

  get userPreferences$() {
    return this._userPreferences.asObservable();
  }

  get isAuthenticated$() {
    return this._isAuthenticated.asObservable();
  }

  get isPhoneNumberVerified$() {
    return this._isPhoneNumberVerified.asObservable();
  }

  get hasDistrictId$() {
    return this._hasDistrictId.asObservable();
  }

  get districtId$() {
    return this._districtId.asObservable();
  }

  get districtName$() {
    return this._districtName.asObservable();
  }

  getUser() {
    return this.getUserObservable().subscribe();
  }

  getUserPoints() {
    return this._userPoints.asObservable();
  }

  getUserState(): Observable<UserStateInfo> {
    return this._userState.asObservable();
  }

  getUserObservable(isAdditionalOrderActive: boolean = false): Observable<UserInfoDTO> {
    return this._userRestControllerService.getV3().pipe(
      catchError((error) => {
        this._isAuthenticated.next(false);
        this._loggingService.logError({ title: 'Hata', message: error });
        return EMPTY;
      }),
      map((response: AppResponseUserInfoDTO) => response.data),
      tap((userInfo: UserInfoModel) => {
        // Todo  later, make this logic like sanalmarket.
        if (!this.getCompanyName().toLowerCase().includes('migros')) {
          if (!isAdditionalOrderActive) {
            this._userState.next(userInfo.stateInfo);
          }
        } else {
          this._userState.next(userInfo.stateInfo);
        }
        //
        this._setUserServiceInitials(userInfo);
      })
    );
  }

  getCompanyName(): string {
    return this._envService.companyName;
  }

  getUserCheques() {
    return this._userRestControllerService.getCheques().pipe(
      catchError((error) => throwError(error)),
      map((response) => response.data)
    );
  }

  isAnonymousCheckoutStart(): Observable<boolean> {
    return this._anonymousCheckoutStart.asObservable();
  }

  startAnonymousCheckout(): void {
    this._anonymousCheckoutStart.next(true);
  }

  private _setUserServiceInitials(newUserInfo: UserLocationInfoV2) {
    const { user: newUser, locationInfo } = newUserInfo;
    //
    this._locationInfo.next(locationInfo);
    const newDistrictId = locationInfo.serviceAreaObjectId;
    this._districtId.next(newDistrictId);
    this._hasDistrictId.next(!!newDistrictId);
    //
    const newDistrictName = locationInfo.fullServiceAreaObjectName;
    this._districtName.next(newDistrictName);
    //
    if (!newUser) {
      this._isPhoneNumberVerified.next(false);
      this._isAuthenticated.next(false);
      return;
    }
    this._user.next(<UserDTO>{
      ...this._user.value,
      ...newUser,
      districtId: newDistrictId,
      fullDistrictName: newDistrictName,
    });
    this._isPhoneNumberVerified.next(newUser.phoneNumberVerified);
    this._isAuthenticated.next(true);
    //
    this._systemCookiesService.saveUserCredentialsAsMd5({ email: newUserInfo.user.email, userId: newUserInfo.user.id });
  }

  getUserPreferences() {
    this._userRestControllerService
      .getPreferences()
      .pipe(
        catchError((error) => throwError(error)),
        map((response) => response.data)
      )
      .subscribe((userPreferenceData: UserPreference[]) => {
        const userPreferenceMap: UserPreferenceMapModel = userPreferenceData.reduce((acc, current: UserPreference) => {
          acc[current.key] = current;
          return acc;
        }, {}) as UserPreferenceMapModel;
        this._userPreferences.next(userPreferenceMap);
      });
  }

  updateLocationInfo(locationInfo: DetailedLocationInfo): void {
    this._locationInfo.next(locationInfo);
  }

  updateUserEmail(email: string) {
    return this._userRestControllerService.sendOtpForEmailUpdate({ email }).pipe(
      catchError((error) => throwError(error)),
      filter((response) => response.successful),
      tap(() => {
        this._user.next({ ...this._user.value, ...{ email } });
      }),
      map((response) => response.data)
    );
  }

  updatePersonalInformation({ userInfoData, source, registerMcc = false }) {
    return this._userRestControllerService.updateBasicInfo({ ...userInfoData, source, registerMcc }).pipe(
      catchError((error) => throwError(error)),
      filter((response) => response.successful),
      map((response) => response.data),
      tap((newUserInfo: UserDTO) => {
        this._user.next({ ...this._user.value, ...newUserInfo });
      })
    );
  }

  updateContactInfo(permissions: ContactSettingsFormBean) {
    return this._userRestControllerService.updateContactPermissions(permissions).pipe(
      catchError((error) => throwError(error)),
      filter((response) => response.successful),
      map((response) => response.data),
      tap((newUserInfo) => {
        this._user.next({ ...this._user.value, ...newUserInfo });
      })
    );
  }

  identifyAnonymousUser(request: IdentifyAnonymousUserBean): Observable<UserLocationInfoV2> {
    return this._userRestControllerService.identifyAnonymousUser(request).pipe(
      filter((response) => response.successful),
      map((response) => response.data),
      tap((data: UserLocationInfoV2) => {
        this._setUserServiceInitials(data);
      })
    );
  }

  addReferralCookie(request: AddReferralCookieRequest): Observable<ServiceResponse> {
    return this._userRestControllerService.addReferralCookie(request).pipe(
      catchError((error) => throwError(error)),
      filter((response) => response.successful),
      map((response) => response.data)
    );
  }

  fetchUserPoints() {
    this._userRestControllerService.getPointsV2().subscribe((response) => {
      this._userPoints.next(response.data);
    });
  }

  getHealthyLifeInfo(): Observable<HealthyLifeInfoDTO> {
    return this._userRestControllerService.getHealthyLifeInfo().pipe(
      catchError((error) => throwError(error)),
      map((response) => response.data)
    );
  }

  enrollHealthyLifeChoice(category: string): Observable<ServiceResponse> {
    return this._userRestControllerService.enrollHealthyLifeChoice(category).pipe(
      catchError((error) => throwError(error)),
      map((response) => response.data)
    );
  }

  sendVerificationMail(email: string): Observable<ClaimInfoDTO> {
    return this._userRestControllerService.sendVerificationMail({ email }).pipe(
      filter((response) => response.successful),
      catchError((error) => throwError(error)),
      map((response) => response.data)
    );
  }

  verifyMail(request: ClaimMailFormBean): Observable<AppResponse> {
    return this._userRestControllerService.claimMail(request).pipe(
      filter((response) => response.successful),
      catchError((error) => throwError(error))
    );
  }

  sendOtpForEmailUpdate(email: string): Observable<AllClaimInfoDTO1> {
    return this._userRestControllerService.sendOtpForEmailUpdate({ email }).pipe(
      filter((response) => response.successful),
      catchError((error) => throwError(error)),
      map((response) => response.data)
    );
  }

  updateEmailByOtp(request: EmailChangeByOtpFormBean): Observable<ServiceResponseUserDTO> {
    return this._userRestControllerService.updateEmailByOtp(request).pipe(
      filter((response) => response.successful),
      catchError((error) => throwError(error))
    );
  }

  sendOtpForPhoneNumberUpdate(phoneNumber: string): Observable<ServiceResponse> {
    return this._userRestControllerService.sendOtpForPhoneNumberUpdate({ phoneNumber }).pipe(
      filter((response) => response.successful),
      catchError((error) => throwError(error)),
      map((response) => response.data)
    );
  }

  updatePhoneNumberByOtp(request: PhoneNumberChangeByOtpFormBean): Observable<ServiceResponseUserDTO> {
    return this._userRestControllerService.updatePhoneNumberByOtp(request).pipe(
      filter((response) => response.successful),
      catchError((error) => throwError(error))
    );
  }
}
