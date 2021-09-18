import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material-experimental/mdc-dialog';
import { MatSnackBar } from '@angular/material-experimental/mdc-snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

import { AppStateService, GtmService, LoadingIndicatorService, LoggingService, PortfolioEnum } from '@fe-commerce/core';
import { AddressService, LocationService } from '@fe-commerce/delivery';
import { CheckoutService, CheckoutSteps, DeliveryModel } from '@fe-commerce/line-checkout';
import { AddressOwnerModel, presenceAnimationTrigger, SubscriptionAbstract } from '@fe-commerce/shared';

import { catchError, filter, mergeMap, switchMap, takeUntil, tap } from 'rxjs/operators';

import { faAngleDoubleDown, faInfoCircle, faPen, faTrashAlt, IconDefinition } from '@fortawesome/pro-regular-svg-icons';
import { AddressInfoBean, CheckoutInfoDTO, Foundation, PickPoint } from '@migroscomtr/sanalmarket-angular';
import { EMPTY, forkJoin, of, throwError } from 'rxjs';
import { faPlus } from '@fortawesome/pro-light-svg-icons';

import { ROUTE_DELIVERY_PAYMENT, ROUTE_DELIVERY_TIME, ROUTE_ORDER } from '../../../routes';
import { OrderSummaryType } from '../../../shared';
import { AddressSubmitEventData } from '../../models';
import { AddDeliveryAddressModalComponent } from '../add-delivery-address-modal/add-delivery-address-modal.component';
import { AddInvoiceAddressModalComponent } from '../add-invoice-address-modal/add-invoice-address-modal.component';
import { DeleteAddressModalComponent } from '../delete-address-modal/delete-address-modal.component';

@Component({
  selector: 'sm-address-selector',
  templateUrl: './address-selector.component.html',
  styleUrls: ['./address-selector.component.scss'],
  animations: [presenceAnimationTrigger],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AddressSelectorComponent extends SubscriptionAbstract implements OnInit {
  // ICON
  infoIcon: IconDefinition = faInfoCircle;
  doubleDownIcon: IconDefinition = faAngleDoubleDown;
  penIcon: IconDefinition = faPen;
  trashIcon: IconDefinition = faTrashAlt;
  plusIcon: IconDefinition = faPlus;
  // storeIcon: IconDefinition = faStore;

  // DATA
  private invoiceAddressList: AddressInfoBean[] = [];
  private deliveryAddressList: AddressInfoBean[] = [];
  private checkoutInfo: CheckoutInfoDTO;

  private selectedInvoiceAddress: AddressInfoBean;
  private selectedDeliveryAddress: AddressInfoBean;
  private isAddressModalOpened = true;
  private editedInvoiceAddressId: number;
  private editedDeliveryAddressId: number;

  // STATE
  private loading = false;
  private invoiceSameAsDeliveryAddress = false;
  private alreadySelectedAddressTypeFoundation = false;
  private alreadySelectedAddressTypeDistrict = false;
  private alreadySelectedAddressTypePickPoint = false;
  private selectedFoundation: Foundation;
  private selectedPickPoint: PickPoint & { fullAddress: string };
  private deliveryNote: string;
  private currentDeliveryAddressIndex = 3; // controls how many items will be shown in the delivery address list
  private currentInvoiceAddressIndex = 3; // controls how many items will be shown in the invoice address list

  // MODAL REF
  private dialogAddDeliveryAddressModalRef?: MatDialogRef<AddDeliveryAddressModalComponent>;
  private dialogAddInvoiceAddressModalRef?: MatDialogRef<AddInvoiceAddressModalComponent>;
  private dialogDeleteAddressModalRef?: MatDialogRef<DeleteAddressModalComponent>;

  // READONLY
  private readonly loadThreshold = 3;
  private readonly objectTypeUser = 'USER';
  private readonly deliveryUpdated = 'deliveryUpdated';
  private readonly deliveryAndInvoiceAddressCreated = 'deliveryAndInvoiceAddressCreated';
  private readonly deliveryAddressCreated = 'deliveryAddressCreated';
  private readonly invoiceCreated = 'invoiceCreated';
  private readonly invoiceUpdated = 'invoiceUpdated';

  constructor(
    private loggingService: LoggingService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private addressService: AddressService,
    private loadingIndicatorService: LoadingIndicatorService,
    private activatedRoute: ActivatedRoute,
    private checkoutService: CheckoutService,
    private router: Router,
    private gtmService: GtmService,
    private _snackBar: MatSnackBar,
    private _locationService: LocationService,
    private _appStateService: AppStateService
  ) {
    super();
  }

  ngOnInit(): void {
    this.resetStates();
    this.subscribeToRouter();
    this.configureInvoiceSameAsDelivery();
  }

  getDeliveryAddressList(): AddressInfoBean[] {
    return this.deliveryAddressList;
  }

  getInvoiceAddressList(): AddressInfoBean[] {
    return this.invoiceAddressList;
  }

  getSelectedFoundation(): Foundation {
    return this.selectedFoundation;
  }

  getSelectedPickPoint(): PickPoint & { fullAddress: string } {
    return this.selectedPickPoint;
  }

  getCheckoutInfo(): CheckoutInfoDTO {
    return this.checkoutInfo;
  }

  getTiklaGelAlSrc(): string {
    return this.isPickPointIconFaStore()
      ? '/../../assets/icons/address-selector/migros-m.svg'
      : '/../../assets/icons/address-selector/tikla-gel-al.svg';
  }

  isLoading(): boolean {
    return this.loading;
  }

  isInvoiceSameAsDeliveryAddress(): boolean {
    return this.invoiceSameAsDeliveryAddress;
  }

  isInvoiceAddressesWrapperVisible(): boolean {
    return !this.invoiceSameAsDeliveryAddress;
  }

  isDeliveryAddressSelected(deliveryAddress: AddressInfoBean, index: number): boolean {
    return this.isAddressModalOpened ? index === 0 : deliveryAddress === this.selectedDeliveryAddress;
  }

  isInvoiceAddressSelected(invoiceAddress: AddressInfoBean, index: number): boolean {
    return this.isAddressModalOpened ? index === 0 : invoiceAddress === this.selectedInvoiceAddress;
  }

  isFoundationWrapperVisible(): boolean {
    return this.isAlreadySelectedAddressTypeFoundation();
  }

  isAnonymous(): boolean {
    if (!this.checkoutInfo) {
      return;
    }
    return this.checkoutInfo.line.anonymous;
  }

  isPickPointWrapperVisible(): boolean {
    return this.isAlreadySelectedAddressTypePickPoint();
  }

  isDeliverAddressesWrapperVisible(): boolean {
    return !this.isAlreadySelectedAddressTypeFoundation() && !this.isAlreadySelectedAddressTypePickPoint();
  }

  isAlreadySelectedAddressTypeFoundation(): boolean {
    return this.alreadySelectedAddressTypeFoundation;
  }

  isAlreadySelectedAddressTypePickPoint(): boolean {
    return this.alreadySelectedAddressTypePickPoint;
  }

  isDeliveryAddressVisible(index: number): boolean {
    if (this._locationService.isDeliveryShipment()) {
      if (this.deliveryAddressList[index].storeDeliveryModel !== DeliveryModel.SHIPMENT) {
        return false;
      }
    }
    if (this._locationService.isDeliveryLastMile()) {
      if (this.deliveryAddressList[index].storeDeliveryModel !== DeliveryModel.LAST_MILE) {
        return false;
      }
    }
    return index < this.currentDeliveryAddressIndex;
  }

  hasVisibleDeliveryAddress(): boolean {
    if (this._locationService.isDeliveryShipment()) {
      const items = this.deliveryAddressList.filter(
        (address) => address.storeDeliveryModel !== DeliveryModel.LAST_MILE
      );
      if (items.length > 0) {
        return true;
      }
    }
    if (this._locationService.isDeliveryLastMile()) {
      const items = this.deliveryAddressList.filter((address) => address.storeDeliveryModel !== DeliveryModel.SHIPMENT);
      if (items.length > 0) {
        return true;
      }
    }
  }

  isInvoiceAddressVisible(index: number): boolean {
    return index < this.currentInvoiceAddressIndex;
  }

  isLoadMoreDeliveryAddressBtnVisible(): boolean {
    let listLength;
    if (this._locationService.isDeliveryShipment()) {
      const onlyShipment = this.deliveryAddressList.filter((address: AddressInfoBean) => {
        return address.storeDeliveryModel === DeliveryModel.SHIPMENT;
      });
      listLength = onlyShipment.length;
    }
    if (this._locationService.isDeliveryLastMile()) {
      listLength = this.getDeliveryAddressList().length;
    }
    return listLength >= this.currentDeliveryAddressIndex + 1;
  }

  isLoadMoreInvoiceAddressBtnVisible(): boolean {
    return this.getInvoiceAddressList().length >= this.currentInvoiceAddressIndex + 1;
  }

  configureInvoiceSameAsDelivery(): void {
    if (this._locationService.isDeliveryFoundation() || this._locationService.isDeliveryPickPoint()) {
      this.invoiceSameAsDeliveryAddress = false;
    }
  }

  onClickAddNewDeliveryAddress(): void {
    this.openAddDeliveryAddressModal();
  }

  onClickAddNewInvoiceAddress(): void {
    this.openAddInvoiceAddressModal();
  }

  onDeliveryNoteChange(note: string): void {
    this.deliveryNote = note;
  }

  onClickEditButton(address: AddressInfoBean, isInvoice: boolean = false, $event: MouseEvent): void {
    $event.stopPropagation();
    if (!isInvoice) {
      this.openAddDeliveryAddressModal(address, true);
      return;
    }
    this.openAddInvoiceAddressModal(address, true);
  }

  onClickDeleteButton(address: AddressInfoBean, isInvoice: boolean = false, $event: MouseEvent): void {
    $event.stopPropagation();
    this.dialogDeleteAddressModalRef = this.dialog.open(DeleteAddressModalComponent, {
      closeOnNavigation: true,
      id: 'delete-delivery-address-modal-component',
    });
    this.subscribeToDialogDeleteAddressModal(address, isInvoice);
  }

  onClickDeliveryAddress(deliveryAddress: AddressInfoBean): void {
    this.isAddressModalOpened = false;
    this.selectedDeliveryAddress = deliveryAddress;
    this.checkoutService.setSelectedDeliveryAddress(deliveryAddress);
  }

  onClickInvoiceAddress(invoiceAddress: AddressInfoBean): void {
    this.isAddressModalOpened = false;
    this.selectedInvoiceAddress = invoiceAddress;
    this.checkoutService.setSelectedInvoiceAddress(invoiceAddress);
  }

  onChangeInvoiceSameAsDeliveryAddressCheckbox(condition: boolean): void {
    this.invoiceSameAsDeliveryAddress = condition;
  }

  onClickLoadMoreDeliveryAddress(): void {
    if (this.currentDeliveryAddressIndex + this.loadThreshold >= this.getDeliveryAddressList().length) {
      this.currentDeliveryAddressIndex = this.getDeliveryAddressList().length;
      return;
    }
    this.currentDeliveryAddressIndex = this.currentDeliveryAddressIndex + this.loadThreshold;
  }

  onClickLoadMoreInvoiceAddress(): void {
    if (this.currentInvoiceAddressIndex + this.loadThreshold >= this.getInvoiceAddressList().length) {
      this.currentInvoiceAddressIndex = this.getInvoiceAddressList().length;
      return;
    }
    this.currentInvoiceAddressIndex = this.currentInvoiceAddressIndex + this.loadThreshold;
  }

  onSubmit(): void {
    if (
      !this.checkoutService.getSelectedDeliveryAddress() &&
      !this.isAlreadySelectedAddressTypePickPoint() &&
      !this.checkoutService.getSelectedInvoiceAddress()
    ) {
      this.openSnackBar('Lütfen teslimat ve fatura adresi seçin.');
      return;
    }
    if (!this.checkoutService.getSelectedDeliveryAddress() && !this.isAlreadySelectedAddressTypePickPoint()) {
      this.openSnackBar('Lütfen bir teslimat adresi seçin.');
      return;
    }
    if (!this.checkoutService.getSelectedInvoiceAddress() && !this.isInvoiceSameAsDeliveryAddress()) {
      this.openSnackBar('Lütfen bir fatura adresi seçin.');
      return;
    }
    if (
      (!this.checkoutService.getSelectedDeliveryAddress() && !this.isAlreadySelectedAddressTypePickPoint()) ||
      (!this.checkoutService.getSelectedInvoiceAddress() && !this.isInvoiceSameAsDeliveryAddress())
    ) {
      return;
    }

    const addressBody = {
      deliveryAddressId: this.checkoutService.getSelectedDeliveryAddress().id,
      invoiceAddressId: this.isInvoiceSameAsDeliveryAddress()
        ? this.checkoutService.getSelectedDeliveryAddress().id
        : this.checkoutService.getSelectedInvoiceAddress().id,
    };

    if (this.deliveryNote) {
      Object.assign(addressBody, { note: this.deliveryNote });
    }

    this.checkoutService.addressCheckout(this.checkoutInfo.line.id, addressBody).subscribe((data) => {
      if (this._locationService.isDeliveryShipment() || this._locationService.isDeliveryFoundation()) {
        this.router.navigate([ROUTE_ORDER, ROUTE_DELIVERY_PAYMENT, data?.line.id]);
        return;
      }
      this.router.navigate([ROUTE_ORDER, ROUTE_DELIVERY_TIME, data.line.id]);
    });
  }

  resetStates(): void {
    this.checkoutService.setSelectedDeliveryAddress(undefined);
    this.checkoutService.setSelectedInvoiceAddress(undefined);
  }

  isPickPointIconFaStore(): boolean {
    return this._appStateService.getPortfolio() === PortfolioEnum.KURBAN;
  }

  private sendGtmPageViewEvent(page, id): void {
    this.gtmService.sendPageView({
      event: `virtualPageview${page}`,
      virtualPagePath: this.router.url,
      virtualPageTitle: 'Teslimat zamanı | Sanalmarket',
      virtualPageName: page,
      objectId: id,
    });
  }

  private sendGtmEvent(checkoutInfo): void {
    if (checkoutInfo && checkoutInfo.itemInfos) {
      const products = checkoutInfo.itemInfos.map((checkoutItem, index) => {
        return this.gtmService.generateGtmProductData(
          checkoutItem.product,
          index,
          'checkout/address',
          checkoutItem.item.amount,
          checkoutItem.totalDiscount
        );
      });

      const data = {
        event: 'ecommerceCheckout',
        nonInteraction: true,
        eventType: 'Checkout',
        ecommerce: {
          checkout: {
            actionField: { step: 1 },
            products,
          },
        },
      };

      this.gtmService.sendCheckoutEvent(data);
    }
  }

  private subscribeToRouter(): void {
    this.activatedRoute.params.subscribe((params) => {
      const checkoutId = params['id'];
      this.initialize(checkoutId);
      this.sendGtmPageViewEvent('DeliveryAddress', checkoutId);
      if (this._appStateService.isUserVisitingAppFirstTime() || this._appStateService.isUserNavigatedViaBackButton()) {
        this.checkoutService.getCheckoutInfo(checkoutId, CheckoutSteps.ADDRESS);
      }
    });
  }

  private openAddDeliveryAddressModal(address?: AddressInfoBean, isGoingToEdit: boolean = false): void {
    this.isAddressModalOpened = true;
    this.dialogAddDeliveryAddressModalRef?.close();
    this.dialogAddDeliveryAddressModalRef = this.dialog.open(AddDeliveryAddressModalComponent, {
      closeOnNavigation: true,
      panelClass: ['mobile-modal'],
      id: 'add-delivery-address-modal-component',
      data: { address, isGoingToEdit: isGoingToEdit },
    });
    this.subscribeToDialogAddDeliveryAddressModal();
  }

  private openAddInvoiceAddressModal(address?: AddressInfoBean, isGoingToEdit: boolean = false): void {
    this.isAddressModalOpened = true;
    this.dialogAddInvoiceAddressModalRef?.close();
    this.dialogAddInvoiceAddressModalRef = this.dialog.open(AddInvoiceAddressModalComponent, {
      closeOnNavigation: true,
      panelClass: ['mobile-modal'],
      id: 'add-invoice-address-modal-component',
      data: { address, isGoingToEdit: isGoingToEdit },
    });
    this.subscribeToDialogAddInvoiceAddressModal();
  }

  private subscribeToDialogAddDeliveryAddressModal(): void {
    this.dialogAddDeliveryAddressModalRef.componentInstance.addressFormSubmit
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        tap(() => {
          this.loadingIndicatorService.start();
        }),
        catchError((error) => {
          this.loadingIndicatorService.stop();
          this.loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        }),
        mergeMap((addressSubmitEventData: AddressSubmitEventData) => {
          const { formValues, isGoingToEdit, id } = addressSubmitEventData;
          if (isGoingToEdit) {
            this.editedDeliveryAddressId = id;
            formValues.id = id;
            return forkJoin([of(this.deliveryUpdated), this.addressService.updateDeliveryAddress(formValues)]);
          }
          if (formValues.saveAsInvoice) {
            return forkJoin([
              of(this.deliveryAndInvoiceAddressCreated),
              this.addressService.createInvoiceAddress(formValues, AddressOwnerModel.PERSONAL),
              this.addressService.createDeliveryAddress(formValues),
            ]);
          }
          return forkJoin([of(this.deliveryAddressCreated), this.addressService.createDeliveryAddress(formValues)]);
        })
      )
      .subscribe((data) => {
        if (data[0] === this.deliveryUpdated) {
          this.deliveryAddressList = this.deliveryAddressList.filter((i) => i.id !== this.editedDeliveryAddressId);
          this.deliveryAddressList.unshift(data[1]);
          this.checkoutService.setSelectedDeliveryAddress(this.deliveryAddressList[0]);
        }
        if (data[0] === this.deliveryAndInvoiceAddressCreated) {
          this.invoiceAddressList.unshift(data[1]);
          this.deliveryAddressList.unshift(data[2]);
          this.checkoutService.setSelectedDeliveryAddress(this.deliveryAddressList[0]);
          this.checkoutService.setSelectedInvoiceAddress(this.invoiceAddressList[0]);
        }
        if (data[0] === this.deliveryAddressCreated) {
          this.deliveryAddressList.unshift(data[1]);
          this.checkoutService.setSelectedDeliveryAddress(this.deliveryAddressList[0]);
        }
        this.finishAddingAddressProcess();
      });

    this.dialogAddDeliveryAddressModalRef.componentInstance.closeEvent
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe(() => {
        this.dialogAddDeliveryAddressModalRef.close();
      });
  }

  private subscribeToDialogAddInvoiceAddressModal(): void {
    this.dialogAddInvoiceAddressModalRef.componentInstance.addressFormSubmit
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        tap(() => {
          this.loadingIndicatorService.start();
        }),
        catchError((error) => {
          this.loadingIndicatorService.stop();
          this.loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        }),
        mergeMap((addressSubmitEventData: AddressSubmitEventData) => {
          const { formValues, isGoingToEdit, id, addressOwnerModel } = addressSubmitEventData;
          if (isGoingToEdit) {
            this.editedInvoiceAddressId = id;
            formValues.id = id;
            return forkJoin([
              of(this.invoiceUpdated),
              this.addressService.updateInvoiceAddress(formValues, addressOwnerModel),
            ]);
          }
          return forkJoin([
            of(this.invoiceCreated),
            this.addressService.createInvoiceAddress(formValues, addressOwnerModel),
          ]);
        })
      )
      .subscribe((data) => {
        if (data[0] === this.invoiceCreated) {
          this.invoiceAddressList.unshift(data[1]);
        }
        if (data[0] === this.invoiceUpdated) {
          this.invoiceAddressList = this.invoiceAddressList.filter((i) => i.id !== this.editedInvoiceAddressId);
          this.invoiceAddressList.unshift(data[1]);
          this.checkoutService.setSelectedInvoiceAddress(this.invoiceAddressList[0]);
        }
        this.finishAddingAddressProcess();
      });

    this.dialogAddInvoiceAddressModalRef.componentInstance.closeEvent
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe(() => {
        this.dialogAddInvoiceAddressModalRef.close();
      });
  }

  private subscribeToDialogDeleteAddressModal(selectedAddress: AddressInfoBean, isInvoice: boolean = false): void {
    this.dialogDeleteAddressModalRef.componentInstance.accept
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        tap(() => {
          this.loadingIndicatorService.start();
        }),
        catchError((error) => {
          this.loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        }),
        mergeMap((data) => {
          if (data) {
            return this.addressService.removeAddress(selectedAddress.id, isInvoice);
          }
          return of([]);
        })
      )
      .subscribe((data) => {
        if (!Array.isArray(data)) {
          this.removeAddressFromList(selectedAddress, isInvoice);
          if (isInvoice) {
            this.checkoutService.setSelectedInvoiceAddress(null);
          } else {
            this.checkoutService.setSelectedDeliveryAddress(null);
          }
        }
        this.loadingIndicatorService.stop();
        this.cdr.detectChanges();
      });
  }

  private removeAddressFromList(addressToRemove: AddressInfoBean, isInvoice: boolean = false): void {
    if (!isInvoice) {
      this.deliveryAddressList = this.deliveryAddressList.filter((deliveryAddress) => {
        return deliveryAddress.id !== addressToRemove.id;
      });
      return;
    }
    this.invoiceAddressList = this.invoiceAddressList.filter((invoiceAddress) => {
      return invoiceAddress.id !== addressToRemove.id;
    });
  }

  private finishAddingAddressProcess(): void {
    this.dialogAddDeliveryAddressModalRef?.close();
    this.dialogAddInvoiceAddressModalRef?.close();
    this.loadingIndicatorService.stop();
    this.cdr.detectChanges();
  }

  private initialize(checkoutId: number): void {
    this.subscribeToCheckout();
    this.loadingIndicatorService.start();
    this.addressService
      .getDeliveryAddresses(checkoutId)
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        switchMap((addressInfo) => {
          if (addressInfo.length === 0) {
            return of([]);
          }
          const addressInfoToCheck = addressInfo[0];
          switch (addressInfoToCheck.objectType) {
            case OrderSummaryType.PICK_POINT:
              this.selectedPickPoint = { name: addressInfoToCheck.name, fullAddress: addressInfoToCheck.fullAddress };
              this.checkoutService.setSelectedDeliveryAddress(addressInfoToCheck);
              this.alreadySelectedAddressTypePickPoint = true;
              break;
            case OrderSummaryType.FOUNDATION:
              this.checkoutService.setSelectedDeliveryAddress(addressInfoToCheck);
              this.selectedFoundation = { name: addressInfoToCheck.name, iconUrl: addressInfoToCheck.iconUrl };
              this.alreadySelectedAddressTypeFoundation = true;
              break;
            case this.objectTypeUser:
              this.alreadySelectedAddressTypeDistrict = true;
              break;
            default:
              throwError('Data bulunamadı');
          }
          return forkJoin([this.addressService.getInvoiceAddresses(), of(addressInfo)]);
        }),
        catchError((error) => {
          this.loggingService.logError({ title: 'Hata', message: error });
          this.loadingIndicatorService.stop();
          return EMPTY;
        })
      )
      .subscribe((data: [AddressInfoBean[], AddressInfoBean[]] | []) => {
        this.loadingIndicatorService.stop();
        if (data.length === 0) {
          this.invoiceAddressList = [];
          this.deliveryAddressList = [];
          this.cdr.detectChanges();
          return;
        }
        this.invoiceAddressList = data[0];
        this.selectedInvoiceAddress = this.invoiceAddressList[0];
        this.checkoutService.setSelectedInvoiceAddress(this.selectedInvoiceAddress);

        this.deliveryAddressList = data[1];
        this.selectedDeliveryAddress = this.deliveryAddressList[0];
        this.checkoutService.setSelectedDeliveryAddress(this.selectedDeliveryAddress);

        this.cdr.detectChanges();
      });
  }

  private subscribeToCheckout(): void {
    this.loadingIndicatorService.start();
    this.loading = true;
    this.checkoutService.checkout$
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        filter((checkoutInfo) => {
          return Object.keys(checkoutInfo).length > 0;
        })
      )
      .subscribe((checkoutInfo) => {
        this.sendGtmEvent(checkoutInfo);
        //
        this.checkoutInfo = checkoutInfo;
        //
        this.cdr.markForCheck();
        this.loadingIndicatorService.stop();
        this.loading = false;
      });
  }

  private openSnackBar(message: string): void {
    this._snackBar.open(message, '', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      politeness: 'assertive',
    });
  }
}
