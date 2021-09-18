import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PhoneVerifyService } from '@fe-commerce/auth';
import { LoadingIndicatorService, LoggingService, ShortfallDialogService, UserService } from '@fe-commerce/core';
import { CartService } from '@fe-commerce/line-cart';
import { CheckoutService } from '@fe-commerce/line-checkout';
import { OtpDialogDataModel, SubscriptionAbstract } from '@fe-commerce/shared';

import {
  catchError,
  distinctUntilChanged,
  filter,
  finalize,
  first,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { EMPTY, forkJoin, Observable, throwError } from 'rxjs';
import { faChevronRight, faInfoCircle, IconDefinition } from '@fortawesome/pro-solid-svg-icons';
import {
  AnonymousCheckoutRestControllerService,
  CheckoutInfoDTO,
  LocationRestControllerService,
  OtpRegistrationControllerV2Service,
} from '@migroscomtr/sanalmarket-angular';

import { OtpAnonymousRegisterDialogComponent } from '../../../core';
import { ROUTE_CART } from '../../../routes';
import { AnonymousCheckoutForm, FormStatus, ServiceAreaObjectType } from '../../../shared/models';

@Component({
  selector: 'sm-delivery-address-page',
  templateUrl: './delivery-address-page.component.html',
  styleUrls: ['./delivery-address-page.component.scss'],
})
export class DeliveryAddressPageComponent extends SubscriptionAbstract implements OnInit {
  faInfoCircle: IconDefinition;
  faChevronRight: IconDefinition;

  streetsMap$ = this._userService.districtId$.pipe(
    distinctUntilChanged(),
    filter((districtId) => !!districtId),
    switchMap((districtId) => this._locationService.getStreets(districtId)),
    map((response) => response.data),
    map((streets) => streets.map((street) => ({ name: street.name, id: street.id })))
  );
  districtNameParts$ = this._userService.districtName$.pipe(map((name) => name.split(',')));
  cartInfo$ = this._cartService.cart$;
  serviceAreaObjectType$ = this._userService.locationInfo$.pipe(
    map((locationInfo) => locationInfo.serviceAreaObjectType as ServiceAreaObjectType)
  );

  _formStatus: FormStatus;
  private _formValue: AnonymousCheckoutForm;

  constructor(
    private _userService: UserService,
    private _cartService: CartService,
    private _locationService: LocationRestControllerService,
    private _loadingService: LoadingIndicatorService,
    private _anonymousCheckoutRestService: AnonymousCheckoutRestControllerService,
    private _shortfallDialogService: ShortfallDialogService,
    private _checkoutService: CheckoutService,
    private _router: Router,
    private _phoneVerifyService: PhoneVerifyService,
    private _registrationService: OtpRegistrationControllerV2Service,
    private _activatedRoute: ActivatedRoute,
    private _loggingService: LoggingService
  ) {
    super();
    this.faInfoCircle = faInfoCircle;
    this.faChevronRight = faChevronRight;
  }

  ngOnInit(): void {
    this._loadingService.start();
    const _cartInfo$ = this._cartService.getCart();
    forkJoin([
      this.districtNameParts$.pipe(first()),
      _cartInfo$.pipe(
        first(),
        tap((cartInfo) => {
          if (cartInfo?.priceLeftForCheckout > 0) {
            this._router.navigateByUrl(ROUTE_CART);
          }
        }),
        takeUntil(this.getDestroyInterceptor())
      ),
      this.serviceAreaObjectType$.pipe(first()),
      this.streetsMap$.pipe(
        filter((streets) => !!streets),
        first()
      ),
    ])
      .pipe(
        catchError((error) => {
          this._router.navigateByUrl('/', { skipLocationChange: true });
          this._loggingService.logError({ title: 'Hata', message: error?.error });
          return EMPTY;
        })
      )
      .subscribe(([_dnp, cartInfo, _saot]) => {
        this._loadingService.stop();
      });
  }

  onFormValueChange(form: AnonymousCheckoutForm): void {
    this._formValue = form;
  }

  onFormStatusChange(status: FormStatus): void {
    this._formStatus = status;
  }

  onContinue(_): void {
    const { phoneNumber, email } = this._formValue;
    this._loadingService.start();

    this._registrationService
      .code1({ email, phoneNumber })
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        catchError((error) => {
          this._loadingService.stop();
          this._loggingService.logError({ title: 'Hata', message: error?.error });
          return EMPTY;
        }),
        filter((response) => response.successful),
        map((response) => response.data),
        map((data) => {
          return {
            sendPhonePostData: {
              phoneNumber,
              email,
            },
            successNotificationConfig: {
              title: 'İşlem Başarılı!',
              message: 'Telefon numarası başarıyla doğrulandı.',
            },
            verifyPostData: {
              ...data,
            },
          } as OtpDialogDataModel;
        }),
        finalize(() => this._loadingService.stop())
      )
      .subscribe((otpModalData) => {
        this._phoneVerifyService.openVerifyModal(
          OtpAnonymousRegisterDialogComponent,
          // we use try again enable as the only countdown for sm
          {
            ...otpModalData,
            verifyPostData: {
              ...otpModalData.verifyPostData,
              phoneNumberClaimExpireInSeconds: otpModalData.verifyPostData.phoneNumberClaimTryAgainEnableInSeconds,
              expireInSeconds: otpModalData.verifyPostData.tryAgainEnableInSeconds,
            },
          },
          this.onUserVerified.bind(this)
        );
      });
  }

  onUserVerified(): void {
    this.createCheckout();
  }

  createCheckout(): void {
    this._loadingService.start();

    this._anonymousCheckoutRestService
      .createAnonymousCheckout({
        detail: this._formValue.doorNumber,
        direction: this._formValue.fullAddress,
        email: this._formValue.email,
        firstName: this._formValue.name,
        lastName: this._formValue.surname,
        phoneNumber: this._formValue.phoneNumber,
        streetId: this._formValue.street?.value,
        bagSelected: this.getFromParams('bagSelected', true, ['true', 'false']),
        alternativeProductChoice: this.getFromParams('alternativeProductChoice', 'UP_TO_CUSTOMER', [
          'UP_TO_PERSONNEL',
          'NO_ALTERNATIVE',
          'UP_TO_CUSTOMER',
        ]),
      })
      .pipe(
        map((response) => response.data as CheckoutInfoDTO),
        takeUntil(this.getDestroyInterceptor()),
        catchError((error) => {
          this._loggingService.logError({ title: 'Hata', message: error?.error });
          return EMPTY;
        }),
        finalize(() => {
          this._loadingService.stop();
        })
      )
      .subscribe((data) => {
        this._checkoutService.updateCheckout(data);
        this._router.navigateByUrl(`/siparis/adres/${data.line.id}`);
      });
  }

  getFromParams(paramName: string, defaultValue, acceptedValues: string[]): any {
    const param = this._activatedRoute.snapshot.queryParams[paramName];
    if (param && acceptedValues.indexOf(param) >= 0) {
      return param;
    }
    return defaultValue;
  }

  get continueDisabled(): boolean {
    return this._formStatus !== 'VALID';
  }

  isCartInfoFetched(): Observable<boolean> {
    return this.cartInfo$.pipe(map((cartInfo) => cartInfo?.itemInfos && cartInfo.itemInfos.length > 0));
  }
}
