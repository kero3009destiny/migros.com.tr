import { BreakpointObserver } from '@angular/cdk/layout';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Params, Router } from '@angular/router';

import { AppStateService, PortfolioEnum, SearchComboboxService } from '@fe-commerce/core';
import { EnvService } from '@fe-commerce/env-service';
import { BreakpointObserverRef } from '@fe-commerce/shared';

import { debounceTime, startWith, tap } from 'rxjs/operators';

import { Subscription } from 'rxjs';
import { SanalmarketAggregationInfo, StoreProductInfoDTO } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'fe-product-search-combobox',
  templateUrl: './product-search-combobox.component.html',
  styleUrls: ['./product-search-combobox.component.scss'],
})
export class ProductSearchComboboxComponent extends BreakpointObserverRef implements OnInit, OnDestroy, AfterViewInit {
  loading = false;
  isSearchActive = false;
  searchTerm: string;
  // get searchQuery() and keydown event using this for instant search
  instantSearchTerm: string;
  userTyping = false;
  searchControl: FormControl = new FormControl('');
  productSearchResults: StoreProductInfoDTO[] = [];
  categorySearchResults: SanalmarketAggregationInfo[] = [];
  private _localSubscriptions: Subscription[] = [];
  private _searchValueChangeSubscription: Subscription;
  private _productResultsSubscription: Subscription;
  private _categoryResultsSubscription: Subscription;
  private _searchComboboxActiveSubscription: Subscription;
  private _portfolio: PortfolioEnum;

  @Input() migros = false;
  @Input() triggerAutoFocus = true;
  @Output() activated: EventEmitter<void> = new EventEmitter<void>();
  @Output() deactivated: EventEmitter<void> = new EventEmitter<void>();
  @Output() opened: EventEmitter<void> = new EventEmitter<void>();
  @Output() closed: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;
  @ViewChild('triggerInput') triggerInput: ElementRef;

  constructor(
    public breakpointObserver: BreakpointObserver,
    private _searchComboboxService: SearchComboboxService,
    private _router: Router,
    private _envService: EnvService,
    private _appStateService: AppStateService
  ) {
    super(breakpointObserver);
  }

  ngOnInit() {
    this.subscribeToAppState();
    this.subscribeToSearchValueChanges();
    this.subscribeToProductResults();
    this.subscribeToCategoryResults();
    this.subscribeToComboboxActive();
    super.ngOnInit();
  }

  getCompanyClass(): string {
    return this.migros ? 'migros' : '';
  }

  isMigros(): boolean {
    return this.migros;
  }

  getAutoCompleteClassList(): string {
    return `mat-elevation-z2 product-search-combobox--panel ${this.getCompanyClass()}`;
  }

  getSearchInputPlaceHolder(): string {
    if (this._portfolio === PortfolioEnum.ELECTRONIC) {
      return "Migros Ekstra'da Ara";
    } else if (this._portfolio === PortfolioEnum.HEMEN) {
      return 'Hemen teslimat! 🛵';
    }

    let conjunction = 'da';
    if (this.getCompanyName().toLowerCase().includes('tazedirekt')) {
      conjunction = 'de';
    }
    if (this.getCompanyName().toLowerCase().includes('migros')) {
      conjunction = 'te';
    }
    return `${this.getCompanyName()}'${conjunction} Ara!`;
  }

  ngAfterViewInit() {
    if (!this.isLargeScreen && this.triggerAutoFocus) {
      this.triggerInput.nativeElement.focus();
    }
    setTimeout(() => {
      scrollTo(0, 0);
    }, 100);
  }

  ngOnDestroy() {
    this._localSubscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });

    super.ngOnDestroy();
  }

  get searchQuery(): Params {
    return {
      q: this.instantSearchTerm,
    };
  }

  getCompanyName(): string {
    return this._envService.companyName;
  }

  closeAutocomplete() {
    this.autocompleteTrigger.closePanel();
  }

  onProductSelect(item) {
    return item.name;
  }

  subscribeToSearchValueChanges() {
    this._searchValueChangeSubscription = this.searchControl.valueChanges
      .pipe(
        tap((value) => {
          this.userTyping = true;
          // onKeydown event need this before debounce
          this.instantSearchTerm = value;
          return value;
        }),
        debounceTime(500),
        startWith('')
      )
      .subscribe((value) => {
        this.userTyping = false;
        this.loading = true;
        this.searchTerm = value;
        this._searchComboboxService.getSearchResults(value);
      });
    this._localSubscriptions.push(this._searchValueChangeSubscription);
  }

  subscribeToProductResults() {
    this._productResultsSubscription = this._searchComboboxService.productResults$.subscribe((result) => {
      this.loading = false;
      this.productSearchResults = result;
    });
    this._localSubscriptions.push(this._productResultsSubscription);
  }

  subscribeToComboboxActive() {
    this._searchComboboxActiveSubscription = this._searchComboboxService.active$.subscribe((isSearchActive) => {
      this.isSearchActive = isSearchActive;
    });
    this._localSubscriptions.push(this._searchComboboxActiveSubscription);
  }

  subscribeToCategoryResults() {
    this._categoryResultsSubscription = this._searchComboboxService.categoryResults$.subscribe((result) => {
      this.categorySearchResults = result;
    });
    this._localSubscriptions.push(this._categoryResultsSubscription);
  }

  onPanelOpened() {
    this._addCustomClassToOverlay();
  }

  onPanelClosed() {
    this._removeCustomClassFromOverlay();
  }

  onProductClick() {
    this.autocompleteTrigger.closePanel();
  }

  onEnterKeyDown() {
    this.closeAutocomplete();
    const { q } = this.searchQuery;
    if (q && this.instantSearchTerm && this.instantSearchTerm !== '') {
      this._router.navigate(['/arama'], { queryParams: this.searchQuery });
      this.userTyping = false;
    }
    this.searchControl.reset();
  }

  _getParentOverlayNode() {
    const matAutoCompleteCollection = document.getElementsByClassName(
      'mat-autocomplete-panel product-search-combobox--panel'
    );

    const currentItem = matAutoCompleteCollection.item(0);
    return currentItem.parentElement;
  }

  // God damn workaround https://github.com/angular/components/issues/4196
  _addCustomClassToOverlay() {
    const parentOverlayNode = this._getParentOverlayNode();
    parentOverlayNode.classList.add('combobox-overlay');
  }

  _removeCustomClassFromOverlay() {
    const parentOverlayNode = this._getParentOverlayNode();
    parentOverlayNode.classList.remove('combobox-overlay');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generateCategoryQueryParams(categoryId): any {
    return {
      ...this.searchQuery,
      kategoriler: categoryId,
    };
  }

  private subscribeToAppState(): void {
    this._appStateService.getPortfolio$().subscribe((portfolio) => {
      this._portfolio = portfolio;
    });
  }
}
