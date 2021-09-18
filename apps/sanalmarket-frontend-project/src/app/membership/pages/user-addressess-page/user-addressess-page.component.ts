import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material-experimental/mdc-dialog';
import { Router } from '@angular/router';

import { GtmService, LoadingIndicatorService, LoggingService } from '@fe-commerce/core';
import { AddressService } from '@fe-commerce/delivery';
import { AddressOwnerModel, SubscriptionAbstract } from '@fe-commerce/shared';

import { catchError, mergeMap, switchMap, takeUntil, tap } from 'rxjs/operators';

import { EMPTY, forkJoin, of } from 'rxjs';
import { faAngleDoubleDown, faInfoCircle, IconDefinition } from '@fortawesome/pro-solid-svg-icons';
import { AddressInfoBean } from '@migroscomtr/sanalmarket-angular';
import { faPlus } from '@fortawesome/pro-light-svg-icons';

import {
  AddDeliveryAddressModalComponent,
  AddInvoiceAddressModalComponent,
  DeleteAddressModalComponent,
} from '../../../checkout/components';
import { AddressSubmitEventData } from '../../../checkout/models';

@Component({
  selector: 'sm-user-addressess-page',
  templateUrl: './user-addressess-page.component.html',
  styleUrls: ['./user-addressess-page.component.scss'],
})
export class UserAddressessPageComponent extends SubscriptionAbstract implements OnInit {
  // READONLY
  readonly loadThreshold = 3;
  readonly deliveryUpdated = 'deliveryUpdated';
  readonly deliveryAndInvoiceAddressCreated = 'deliveryAndInvoiceAddressCreated';
  readonly deliveryAddressCreated = 'deliveryAddressCreated';
  readonly invoiceCreated = 'invoiceCreated';
  readonly invoiceUpdated = 'invoiceUpdated';

  // ICONS
  infoIcon: IconDefinition = faInfoCircle;
  doubleDownIcon: IconDefinition = faAngleDoubleDown;
  plusIcon: IconDefinition = faPlus;

  // DATA
  private invoiceAddressList: AddressInfoBean[] = [];
  private deliveryAddressList: AddressInfoBean[] = [];

  // MODAL REF
  private dialogAddDeliveryAddressModalRef?: MatDialogRef<AddDeliveryAddressModalComponent>;
  private dialogAddInvoiceAddressModalRef?: MatDialogRef<AddInvoiceAddressModalComponent>;
  private dialogDeleteAddressModalRef?: MatDialogRef<DeleteAddressModalComponent>;

  // STATE
  private currentDeliveryAddressIndex = 3; // controls how many items will be shown in the delivery address list
  private currentInvoiceAddressIndex = 3; // controls how many items will be shown in the invoice address list
  private loading = false;

  constructor(
    private loggingService: LoggingService,
    private dialog: MatDialog,
    protected cdr: ChangeDetectorRef,
    private addressService: AddressService,
    private loadingIndicatorService: LoadingIndicatorService,
    private gtmService: GtmService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.initialize();
    this.sendGtmPageViewEvent('UserAddresses', 'Adreslerim | Sanalmarket');
  }

  initialize(): void {
    this.loadingIndicatorService.start();
    this.loading = true;

    this.addressService
      .getDeliveryAddresses()
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        switchMap((addressInfo) => {
          if (addressInfo.length === 0) {
            return of([]);
          }
          return forkJoin([this.addressService.getInvoiceAddresses(), this.addressService.getDeliveryAddresses()]);
        }),
        catchError((error) => {
          this.loggingService.logError({ title: 'Hata', message: error });
          this.loadingIndicatorService.stop();
          this.loading = false;
          return EMPTY;
        })
      )
      .subscribe((data: [AddressInfoBean[], AddressInfoBean[]] | []) => {
        this.loadingIndicatorService.stop();
        this.loading = false;
        if (data.length === 0) {
          this.invoiceAddressList = [];
          this.deliveryAddressList = [];
          this.cdr.detectChanges();
          return;
        }
        this.invoiceAddressList = data[0];
        this.deliveryAddressList = data[1];
        this.cdr.detectChanges();
      });
  }

  getDeliveryAddressList(): AddressInfoBean[] {
    return this.deliveryAddressList;
  }

  getInvoiceAddressList(): AddressInfoBean[] {
    return this.invoiceAddressList;
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

  isLoadMoreDeliveryAddressBtnVisible(): boolean {
    const listLength = this.getDeliveryAddressList().length;

    return listLength >= this.currentDeliveryAddressIndex + 1;
  }

  isLoadMoreInvoiceAddressBtnVisible(): boolean {
    return this.getInvoiceAddressList().length >= this.currentInvoiceAddressIndex + 1;
  }

  isLoading(): boolean {
    return this.loading;
  }

  isDeliveryAddressVisible(index: number): boolean {
    return index < this.currentDeliveryAddressIndex;
  }

  isInvoiceAddressVisible(index: number): boolean {
    return index < this.currentInvoiceAddressIndex;
  }

  onClickAddNewDeliveryAddress(): void {
    this.openAddDeliveryAddressModal();
  }

  onClickAddNewInvoiceAddress(): void {
    this.openAddInvoiceAddressModal();
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

  private openAddDeliveryAddressModal(address?: AddressInfoBean, isGoingToEdit: boolean = false): void {
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
    this.dialogAddInvoiceAddressModalRef?.close();
    this.dialogAddInvoiceAddressModalRef = this.dialog.open(AddInvoiceAddressModalComponent, {
      closeOnNavigation: true,
      panelClass: ['mobile-modal'],
      id: 'add-user-invoice-address-modal-component',
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
          const updateAddress = this.deliveryAddressList.find(
            (deliveryAddress) => data[1].objectId === deliveryAddress.objectId
          );
          const index = this.deliveryAddressList.indexOf(updateAddress);
          this.deliveryAddressList[index] = data[1];
        }
        if (data[0] === this.deliveryAndInvoiceAddressCreated) {
          this.invoiceAddressList.unshift(data[1]);
          this.deliveryAddressList.unshift(data[2]);
        }
        if (data[0] === this.deliveryAddressCreated) {
          this.deliveryAddressList.unshift(data[1]);
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
          const updateAddress = this.invoiceAddressList.find(
            (invoiceAddress) => data[1].objectId === invoiceAddress.objectId
          );
          const index = this.invoiceAddressList.indexOf(updateAddress);
          this.invoiceAddressList[index] = data[1];
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
        }
        this.loadingIndicatorService.stop();
        this.cdr.detectChanges();
      });
  }

  private finishAddingAddressProcess(): void {
    this.dialogAddDeliveryAddressModalRef?.close();
    this.dialogAddInvoiceAddressModalRef?.close();
    this.loadingIndicatorService.stop();
    this.cdr.detectChanges();
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

  private sendGtmPageViewEvent(pageComponentName: string, pageTitle: string): void {
    this.gtmService.sendPageView({
      event: `virtualPageview${pageComponentName}`,
      virtualPagePath: this.router.url,
      virtualPageTitle: pageTitle,
      virtualPageName: pageComponentName,
    });
  }
}
