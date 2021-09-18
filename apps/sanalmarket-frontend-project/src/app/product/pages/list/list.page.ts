import { HttpParams } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';

import { GtmService, ScrollPositionRestorerService } from '@fe-commerce/core';
import { LocationService } from '@fe-commerce/delivery';
import { CartService } from '@fe-commerce/line-cart';
import { GtmDataModel, ProductInfoModel, SubscriptionAbstract } from '@fe-commerce/shared';

import { filter, takeUntil } from 'rxjs/operators';

import { faTimesCircle } from '@fortawesome/pro-light-svg-icons';
import { faArrowLeft, faSlidersH } from '@fortawesome/pro-regular-svg-icons';
import { faSortAlt } from '@fortawesome/pro-solid-svg-icons';
import {
  AggregationGroup,
  BannerDTO,
  Breadcrumb,
  CartInfoDTO,
  CartItemInfoDTO,
  PageMetaData,
  ProductSearchInfoWithMetaData,
  SanalmarketAggregationInfo,
  SearchScreenResultDTO,
  StoreProductInfoDTO,
} from '@migroscomtr/sanalmarket-angular';

import {
  ROUTE_ELECTRONIC_REGEX,
  ROUTE_HEMEN_REGEX,
  ROUTE_HOME,
  ROUTE_KURBAN_REGEX,
  ROUTE_PRODUCT_SEARCH_PAGE,
} from '../../../routes';
import {
  FilterChangedEvent,
  MobileCampaignModalData,
  MobileFilterModalData,
  SortCriteriaOption,
  TypedAggregationInfo,
} from '../../../shared';
import { MobileCampaignDetailComponent, MobileFilterModalComponent, MobileSortModalComponent } from '../../components';
import { ProductSearchService } from '../../services/product-search.service';

@Component({
  selector: 'sm-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ListPage extends SubscriptionAbstract implements OnInit {
  faTimesCircle = faTimesCircle;
  sortIcon = faSortAlt;
  filterIcon = faSlidersH;
  backIcon = faArrowLeft;

  private _storeProductInfos: StoreProductInfoDTO[] = [];

  private _baseSearchQuery: string;

  private _totalPageCount: number;

  private _pageIndex: number;
  private readonly PAGE_PARAM_KEY = 'sayfa';
  private _pageParams = new HttpParams();

  private _pageTitle: string;
  private _breadcrumbs: Breadcrumb[];
  private _banners: BannerDTO[];
  private _description: string;
  private _legalDescription: string;
  private _totalProductsCount: number;
  private _screenName: string;

  private _aggregationGroups: AggregationGroup[] = [];

  private _filterParams = new HttpParams();
  private _selectedFilters: TypedAggregationInfo[] = [];
  private _textFilter: string | null = null;

  private readonly SORT_PARAM_KEY = 'sirala';
  private _sortParams = new HttpParams();
  private _selectedSortCriteria: SortCriteriaOption;
  private _sortCriteriaOptions: SortCriteriaOption[];

  private _cartInfo: CartInfoDTO;
  private _pageInitialized = false;
  private bannerVisible: boolean;
  private isLoading = true;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _productSearchService: ProductSearchService,
    private _cartService: CartService,
    private _locationService: LocationService,
    private matDialog: MatDialog,
    private _gtmService: GtmService,
    private _titleService: Title,
    private _metaService: Meta,
    private _restorerService: ScrollPositionRestorerService
  ) {
    super();
  }

  ngOnInit(): void {
    this._subscribeToRouter();
    this._subscribeToCart();
    this._subscribeToLocation();
  }

  isMigroskopPage(): boolean {
    return this._router.url.includes('migroskop');
  }

  isGorInanPage(): boolean {
    return this._router.url.includes('gordugunuze-inanin');
  }

  isCategoryPage(): boolean {
    return 'Category' === this._screenName;
  }

  isBannerVisible(): boolean {
    return this.bannerVisible;
  }

  isSearchNotFoundVisible(): boolean {
    return this.getStoreProductInfos().length == 0 && !this.getIsLoading();
  }

  hasSelectedFilters(): boolean {
    return this.getSelectedFilters().length > 0;
  }

  getPageTitle(): string {
    return this._pageTitle;
  }

  getIsLoading(): boolean {
    return this.isLoading;
  }

  getTextFilter(): string {
    return this._textFilter;
  }

  getBreadcrumbs(): Breadcrumb[] {
    return this._breadcrumbs;
  }

  getTotalProductsCount(): number {
    return this._totalProductsCount;
  }

  getStoreProductInfos(): StoreProductInfoDTO[] {
    return this._storeProductInfos;
  }

  getAggregationGroups(): AggregationGroup[] {
    return this._aggregationGroups;
  }

  getSubCategories(): Array<SanalmarketAggregationInfo> {
    return this.getAggregationGroups().find((group) => group.type === 'CATEGORY')?.aggregationInfos ?? [];
  }

  getSelectedFilters(): TypedAggregationInfo[] {
    return this._selectedFilters;
  }

  getSortCriteriaOptions(): SortCriteriaOption[] {
    return this._sortCriteriaOptions;
  }

  getSelectedSortCriteria(): SortCriteriaOption {
    return this._selectedSortCriteria;
  }

  getPageIndex(): number {
    return this._pageIndex;
  }

  getScreenName(): string {
    return this._screenName;
  }

  setPageIndex(page: number): void {
    this._pageIndex = page;
    this._pageParams = this._pageParams.set(this.PAGE_PARAM_KEY, page.toString());
  }

  resetPageIndex(): void {
    this.setPageIndex(1);
  }

  getTotalPageCount(): number {
    return this._totalPageCount;
  }

  getDescription(): string {
    return this._description;
  }

  getLegalDescription(): string {
    return this._legalDescription;
  }

  getSubCategoryParam(subCategory: SanalmarketAggregationInfo): Params {
    return { kategori: subCategory.requestParameter };
  }

  getShortDescription(): string {
    return this._description?.substring(0, 200)?.concat('...');
  }

  getBanners(): BannerDTO[] {
    return this._banners;
  }

  getGtmData(product: ProductInfoModel): GtmDataModel[] {
    const impressionListName = this._screenName.toLowerCase();
    const gtmListName = impressionListName + '/' + this._pageTitle;
    return [
      {
        name: 'impression',
        product,
        list: gtmListName,
      },
    ];
  }

  setCurrentScrollPosition(): void {
    this._restorerService.setRestoredScrollPosition();
  }

  onFiltersChanged({ type, aggregationInfo, checked }: FilterChangedEvent): void {
    this.resetPageIndex();
    const requestParamKey = this._findRequestParamKey(type);
    if (checked) {
      this._addFilter(requestParamKey, aggregationInfo, type);
    } else {
      this._removeFilter(requestParamKey, aggregationInfo, type);
    }
    this._search();
  }

  onFilterRemoved(aggregationInfo: TypedAggregationInfo): void {
    this.resetPageIndex();
    const requestParamKey = this._findRequestParamKey(aggregationInfo.type);
    this._removeFilter(requestParamKey, aggregationInfo, aggregationInfo.type);
    this._search();
  }

  onAllFiltersRemoved(): void {
    this.resetPageIndex();
    this._filterParams = new HttpParams();
    this._selectedFilters = [];
    this._search();
  }

  onSortCriteriaChanged(selectedSortCriteria: SortCriteriaOption): void {
    this._sortParams = this._sortParams.set(this.SORT_PARAM_KEY, selectedSortCriteria.value);
    this._selectedSortCriteria = selectedSortCriteria;
    this._search();
  }

  onPageChanged(pageIndex: number): void {
    this.setPageIndex(pageIndex);
    scrollTo(0, 0);
    this._search();
  }

  getCartItem(product: StoreProductInfoDTO): CartItemInfoDTO {
    return this._cartInfo.itemInfos?.find((cartItemInfo) => cartItemInfo.product.sku === product.sku);
  }

  openMobileSortModal(): void {
    const dialogRef = this.matDialog.open(MobileSortModalComponent, {
      panelClass: ['mobile-modal', 'modal-content-no-padding'],
      data: {
        sortCriteriaOptions: this.getSortCriteriaOptions(),
        initialOption: this.getSelectedSortCriteria(),
      },
    });
    dialogRef.componentInstance.sortCriteriaConfirmed
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((value) => {
        this.onSortCriteriaChanged(value);
        dialogRef.close();
      });
  }

  openMobileFilterModal(): void {
    const dialogRef = this.matDialog.open<MobileFilterModalComponent, MobileFilterModalData>(
      MobileFilterModalComponent,
      {
        panelClass: ['mobile-modal', 'modal-content-no-padding'],
        data: {
          selectedFilters: this.getSelectedFilters(),
          aggregationGroups: this.getAggregationGroups(),
          totalCount: this.getTotalProductsCount(),
        },
      }
    );
    dialogRef.componentInstance.filtersChanged.pipe(takeUntil(this.getDestroyInterceptor())).subscribe((value) => {
      this._onMultipleFiltersChanged(value);
      dialogRef.close();
    });
  }

  openMobileCampaignModal(): void {
    this.matDialog.open<MobileCampaignDetailComponent, MobileCampaignModalData>(MobileCampaignDetailComponent, {
      panelClass: 'mobile-campaign-modal',
      data: {
        title: this.getPageTitle(),
        content: this.getDescription(),
      },
    });
  }

  onBackButtonClicked(): void {
    this._router.navigate(['/']);
  }

  onInsideViewPort(): void {
    this.bannerVisible = true;
  }

  onOutsideViewPort(): void {
    this.bannerVisible = false;
  }

  private _onMultipleFiltersChanged(filters: TypedAggregationInfo[]): void {
    this.resetPageIndex();
    this._filterParams = new HttpParams();
    this._selectedFilters = [];
    for (const typedFilter of filters) {
      const requestParamKey = this._findRequestParamKey(typedFilter.type);
      this._addFilter(requestParamKey, typedFilter, typedFilter.type);
    }
    this._search();
  }

  private _subscribeToRouter(): void {
    this._initializePage();
    this._router.events
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        this._initializePage();
      });
  }

  private _subscribeToLocation(): void {
    this._locationService
      .getLocationInfo$()
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        filter(() => this._pageInitialized)
      )
      .subscribe(() => {
        this._search();
      });
  }

  private _initializePage(): void {
    const { params, queryParams } = this._activatedRoute.snapshot;
    const { ...sanitizedQueryParams } = queryParams;

    if (this._router.url.includes(`/${ROUTE_PRODUCT_SEARCH_PAGE}`)) {
      if (!sanitizedQueryParams.q) {
        this._router.navigateByUrl(ROUTE_HOME);
        return;
      }
      this._textFilter = sanitizedQueryParams.q ?? null;
      this._productSearchService.getSearchScreenInfo(sanitizedQueryParams).subscribe((searchData) => {
        this._doInitialize(sanitizedQueryParams, searchData);
        this._banners = searchData.bannersMap?.SEARCH_PAGE ?? [];
      });
      return;
    }

    let newPathParam = params.pathParam;

    // Remove portfolio from pathParam
    if (newPathParam && ROUTE_ELECTRONIC_REGEX.test(newPathParam)) {
      newPathParam = params.pathParam.replace('/elektronik', '');
    } else if (newPathParam && ROUTE_KURBAN_REGEX.test(newPathParam)) {
      newPathParam = params.pathParam.replace('/kurban', '');
    } else if (newPathParam && ROUTE_HEMEN_REGEX.test(newPathParam)) {
      newPathParam = params.pathParam.replace('/hemen', '');
    }

    this._productSearchService.getListScreenInfo(newPathParam, sanitizedQueryParams).subscribe((searchData) => {
      this._doInitialize(sanitizedQueryParams, searchData);
      //
      this._banners = searchData.bannersMap?.CATEGORY_PAGE_TOP ?? searchData.bannersMap?.SUB_CATEGORY_PAGE_TOP ?? [];
    });
  }

  private _doInitialize(sanitizedQueryParams: Params, searchData: SearchScreenResultDTO): void {
    this._initializePageIndex(sanitizedQueryParams);
    this._baseSearchQuery = searchData.searchQuery;
    this._processSearchData(searchData.searchInfo);
    this._processMetaData(searchData.metaInfo);
    //
    this._initializeSelectedFilters(sanitizedQueryParams);
    this._initializeSortOptions(searchData.searchInfo);

    //
    this._sendGtmPageViewEvent(
      searchData.eventInfo.screenName,
      searchData.metaInfo.title,
      searchData.searchInfo.storeProductInfos,
      searchData.searchInfo.hitCount
    );
    this._screenName = searchData.eventInfo.screenName;
    //
    this._cartService.setCart(searchData.cartInfo);
    this._pageInitialized = true;
    if (this._restorerService.isUserNavigatedBack()) {
      this.restoreScrollPosition();
    }
  }

  private _subscribeToCart(): void {
    this._cartService.cart$.pipe(takeUntil(this.getDestroyInterceptor())).subscribe((cartInfo) => {
      this._cartInfo = cartInfo;
    });
  }

  private _addFilter(requestParamKey: string, aggregationInfo: SanalmarketAggregationInfo, type: string): void {
    this._filterParams = this._filterParams.append(requestParamKey, aggregationInfo.requestParameter);
    this._selectedFilters = [...this._selectedFilters, { type, ...aggregationInfo }];
  }

  private _findRequestParamKey(type: string): string {
    const { requestParamKey } = this._aggregationGroups.find((group) => group.type === type);
    return requestParamKey;
  }

  private _removeFilter(requestParamKey: string, aggregationInfo: SanalmarketAggregationInfo, type: string): void {
    this._filterParams = this._filterParams.delete(requestParamKey, aggregationInfo.requestParameter);
    this._selectedFilters = this._selectedFilters.filter(
      (selectedFilter) => !(selectedFilter.id === aggregationInfo.id && selectedFilter.type === type)
    );
  }

  private _search(): void {
    this._productSearchService
      .searchBy(this._baseSearchQuery, this._pageParams, this._filterParams, this._sortParams, this._textFilter)
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((searchData) => {
        this._processMetaData(searchData.metaData);
        this._processSearchData(searchData);
      });
  }

  private _processSearchData(searchData: ProductSearchInfoWithMetaData): void {
    this._storeProductInfos = searchData.storeProductInfos;
    this.isLoading = false;
    //
    this._totalPageCount = searchData.pageCount;
    this._totalProductsCount = searchData.hitCount;
    //
    this._aggregationGroups = searchData.aggregationGroups;
  }

  private _initializeSortOptions(searchData: ProductSearchInfoWithMetaData): void {
    this._sortParams = new HttpParams();
    this._sortCriteriaOptions = searchData.sortCriteria.map((criteria) => ({
      name: criteria.label,
      defaultSelected: criteria.selected,
      requestParam: criteria.requestParam,
      value: criteria.requestParam,
    }));

    this._selectedSortCriteria = this._sortCriteriaOptions.find((criteria) => criteria.defaultSelected);
  }

  private _initializeSelectedFilters(sanitizedQueryParams: Params): void {
    if (sanitizedQueryParams.kategori) {
      this._filterParams = new HttpParams({ fromObject: { kategori: sanitizedQueryParams.kategori } });
    } else {
      this._filterParams = new HttpParams();
    }
    this._selectedFilters = this._aggregationGroups.reduce(
      (acc, group) =>
        acc.concat(
          group.aggregationInfos.filter((info) => info.checked).map((info) => ({ type: group.type, ...info }))
        ),
      []
    );
    this._selectedFilters.forEach((f) => {
      this._filterParams = this._filterParams.append(this._findRequestParamKey(f.type), f.requestParameter);
    });
  }

  private _processMetaData(metaData: PageMetaData): void {
    this._breadcrumbs = metaData.breadcrumbs;
    this._pageTitle = metaData.title;
    this._description = metaData.description;
    this._legalDescription = metaData.legalDescription;
    if (metaData.seoTitle) {
      this._titleService.setTitle(metaData.seoTitle);
    }
    if (metaData.seoDescription) {
      this._metaService.updateTag({ name: 'description', content: metaData.seoDescription });
    }
  }

  private _initializePageIndex(queryParams: Params): void {
    this._pageParams = new HttpParams();
    const pageParam = Number.parseInt(queryParams[this.PAGE_PARAM_KEY], 10);
    if (Number.isNaN(pageParam)) {
      this.resetPageIndex();
    } else {
      this.setPageIndex(pageParam);
    }
  }

  private _sendGtmPageViewEvent(
    pageName: string,
    pageTitle: string,
    products: StoreProductInfoDTO[],
    hitCount: number
  ): void {
    const trimmedPageName = pageName.replace(/ /g, '');
    const gtmProducts = products.map((product, index) =>
      this._gtmService.generateGtmProductData(product, index, trimmedPageName)
    );
    this._gtmService.sendPageView({
      event: `virtualPageview${trimmedPageName}`,
      virtualPagePath: this._router.url,
      virtualPageTitle: `${pageTitle} | Sanalmarket`,
      virtualPageName: trimmedPageName,
      objectId: '',
      products: gtmProducts || [],
      resultCount: hitCount,
    });
  }

  private restoreScrollPosition(): void {
    if (this._restorerService.getRestoredScrollPosition()) {
      setTimeout(() => {
        this._restorerService.scrollToPosition();
      }, 1);
    }
  }
}
