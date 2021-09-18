import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material-experimental/mdc-dialog';
import { Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

import {
  AppStateService,
  Browser,
  GtmService,
  LoadingIndicatorService,
  LoggingService,
  PortfolioEnum,
  UserService,
} from '@fe-commerce/core';
import { onEnterAnimationTrigger, SubscriptionAbstract } from '@fe-commerce/shared';

import { catchError, filter, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { EMPTY, Observable } from 'rxjs';
import { faChevronRight } from '@fortawesome/pro-light-svg-icons';
import { faPlus } from '@fortawesome/pro-regular-svg-icons';
import { faCheckCircle, faClipboardList, faHeartbeat, IconDefinition } from '@fortawesome/pro-solid-svg-icons';
import {
  CampaignDTO,
  ShoppingListDTO,
  ShoppingListSystemRestControllerService,
  UserRestControllerService,
} from '@migroscomtr/sanalmarket-angular';

import { ROUTE_HOME } from '../../../routes';
import { CampaignDetailModalComponent } from '../../../shared/components/campaign-detail-modal/campaign-detail-modal.component';
import { CreateCampaignComponent } from '../../../shared/components/create-campaign/create-campaign.component';

@Component({
  selector: 'sm-campaigns',
  templateUrl: './campaigns.component.html',
  styleUrls: ['./campaigns.component.scss'],
  animations: [onEnterAnimationTrigger],
})
export class CampaignsComponent extends SubscriptionAbstract implements OnInit, AfterViewChecked {
  // ICONS
  clipboardList: IconDefinition = faClipboardList;
  heartBeat: IconDefinition = faHeartbeat;
  plus: IconDefinition = faPlus;
  faCheckCircle: IconDefinition = faCheckCircle;
  faChevronRight: IconDefinition = faChevronRight;

  // TABS
  readonly tamBanaGore = 'tamBanaGore';
  readonly money = 'money';
  readonly saglikliYasam = 'saglikliYasam';

  // STATES
  private selectedTab: string = this.tamBanaGore;
  private progressBarAvailable = false;
  private _portfolio = PortfolioEnum.MARKET;

  // DATA
  private tamBanaGoreCampaigns: CampaignDTO[] = [];
  private moneyCampaigns: CampaignDTO[] = [];
  private saglikliYasamCampaigns: CampaignDTO[] = [];
  private staticCampaigns: ShoppingListDTO[] = [];

  // MODAL REF
  private createCampaignModalRef?: MatDialogRef<CreateCampaignComponent>;

  constructor(
    private userRestControllerService: UserRestControllerService,
    private shoppingListService: ShoppingListSystemRestControllerService,
    private loggingService: LoggingService,
    private loadingIndicatorService: LoadingIndicatorService,
    private dialog: MatDialog,
    private userService: UserService,
    private gtmService: GtmService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private appStateService: AppStateService,
    private titleService: Title,
    private metaService: Meta
  ) {
    super();
  }

  ngOnInit(): void {
    this.subcribeToAppStateService();
    this.initialize();
    this.sendGtmPageViewEvent('Campaigns');
  }

  ngAfterViewChecked(): void {
    this.cdr.detectChanges();
  }

  isTamBanaGoreTabSelected(): boolean {
    return this.selectedTab === this.tamBanaGore && this.getTamBanaGoreCampaigns().length > 0;
  }

  isMoneyTabSelected(): boolean {
    return this.selectedTab === this.money;
  }

  isSaglikliYasamTabSelected(): boolean {
    return this.selectedTab === this.saglikliYasam;
  }

  isCampaignAddedToMoneyCard(campaign: CampaignDTO): boolean {
    return campaign.optinFlag === '1';
  }

  isCampaignKKY(campaign: CampaignDTO): boolean {
    return campaign.type === 'tbgkky';
  }

  isTamBanaGoreTabVisible(): boolean {
    return this.tamBanaGoreCampaigns.length > 0;
  }

  isPersonalPromotionsVisible(): boolean {
    return this._portfolio === PortfolioEnum.MARKET || this._portfolio === PortfolioEnum.HEMEN;
  }

  isMoneyTabVisible(): boolean {
    return this.moneyCampaigns.length > 0;
  }

  isSaglikliYasamTabVisible(): boolean {
    return this.saglikliYasamCampaigns.length > 0;
  }

  isDiscountTypeVisible(campaign: CampaignDTO): boolean {
    return !!campaign.discountType;
  }

  isProgressBarVisible(campaign: CampaignDTO): boolean {
    return !!campaign.progress;
  }

  getTamBanaGoreCampaigns(): CampaignDTO[] {
    return this.tamBanaGoreCampaigns;
  }

  getMoneyCampaigns(): CampaignDTO[] {
    return this.moneyCampaigns;
  }

  getSaglikliYasamCampaigns(): CampaignDTO[] {
    return this.saglikliYasamCampaigns;
  }

  getStaticCampaigns(): ShoppingListDTO[] {
    return this.staticCampaigns;
  }

  getStaticCampaignImageUrl(staticCampaign: ShoppingListDTO): string {
    if (!staticCampaign.imageUrls) {
      return;
    }
    return staticCampaign.imageUrls[0].urls.CAMPAIGN_LIST;
  }

  getCampaignAddedLabel(campaign: CampaignDTO): string {
    if (campaign.promotionUsed === '1') {
      return 'Kampanyaya Katıldınız';
    }
    return 'Money Kartınıza Eklendi';
  }

  getPaddingForProgressBar(): string {
    return this.progressBarAvailable ? '0 0 3rem 0' : '0';
  }

  setProgressBarAvailable(): void {
    this.progressBarAvailable = true;
  }

  setSelectedTab(selectedTab: string): void {
    this.selectedTab = selectedTab;
  }

  configurePersonalCampaigns(personalCampaigns: CampaignDTO[]): void {
    if (!personalCampaigns) {
      return;
    }
    if (personalCampaigns.length > 0) {
      personalCampaigns.forEach((campaign) => {
        if (campaign.type === 'mny') {
          this.moneyCampaigns.push(campaign);
          return;
        }
        if (campaign.type === 'iyiyasam') {
          this.saglikliYasamCampaigns.push(campaign);
          return;
        }
        this.tamBanaGoreCampaigns.push(campaign);
      });
    }
  }

  fetchStaticCampaigns(): void {
    this.shoppingListService
      .getInfosByPlaceholder('CAMPAIGN_LIST')
      .pipe(
        catchError((error) => {
          this.loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        }),
        takeUntil(this.getDestroyInterceptor()),
        map((response) => response.data),
        finalize(() => this.loadingIndicatorService.stop())
      )
      .subscribe((campaigns) => {
        this.staticCampaigns = Object.values(campaigns);
      });
  }

  fetchPersonalPromotions(): void {
    this.checkIfUserSignedIn()
      .pipe(
        filter((isSignedIn) => isSignedIn),
        switchMap(() => {
          return this.userRestControllerService.getCampaignsV2();
        }),
        catchError((error) => {
          this.loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        }),
        map((response) => response.data),
        takeUntil(this.getDestroyInterceptor()),
        finalize(() => this.loadingIndicatorService.stop())
      )
      .subscribe((campaigns) => {
        this.configurePersonalCampaigns(campaigns);
      });
  }

  initialize(): void {
    this.loadingIndicatorService.start();
    this.fetchPersonalPromotions();
    this.fetchStaticCampaigns();

    this.titleService.setTitle('Kampanyalar');
    this.metaService.updateTag({
      name: 'description',
      content:
        "Migros Sanal Market'teki kampanyaları, en özel indirimleri ve en güncel fırsatları keşfetmek için hemen tıklayın!",
    });
  }

  checkIfUserSignedIn(): Observable<boolean> {
    return this.userService.isAuthenticated$;
  }

  onClickHomepage(): void {
    this.router.navigate([ROUTE_HOME]);
  }

  onClickCampaignDetail(campaign): void {
    if (!Object.prototype.hasOwnProperty.call(campaign, 'offerName')) {
      this.router.navigate(['/' + campaign.prettyName], { state: { referrerEventId: campaign.referrerEventId } });
      return;
    }

    this.dialog.open(CampaignDetailModalComponent, {
      data: { imageUrl: campaign.imageLink2, detail: campaign.offerDesc, title: campaign.offerName },
      height: Browser.isMobile() ? '100vh' : '',
      width: Browser.isMobile() ? '100vw' : '',
    });
  }

  onClickAddCampaignToMoneyCard(campaignToAdd): void {
    this.gtmService.sendCrmPromotionAddClickEvent(campaignToAdd);
    const params = {
      promoNo: campaignToAdd.promoNo,
      offerNo: campaignToAdd.offerNo,
    };
    this.loadingIndicatorService.start();
    this.userRestControllerService
      .enrollCampaign(params)
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        catchError((error) => {
          this.loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        }),
        finalize(() => {
          this.loadingIndicatorService.stop();
        })
      )
      .subscribe(() => {
        const campaigns = this.tamBanaGoreCampaigns.concat(this.moneyCampaigns, this.saglikliYasamCampaigns);
        campaigns.filter((campaign) => campaign.promoNo === campaignToAdd.promoNo)[0].optinFlag = '1';
      });
  }

  onClickCreateCampaign(): void {
    this.createCampaignModalRef = this.dialog.open(CreateCampaignComponent, {
      height: Browser.isMobile() ? '100vh' : '',
      width: Browser.isMobile() ? '100vw' : '',
    });
    this.createCampaignModalRef.componentInstance.kkyEnrolled
      .pipe(
        takeUntil(this.getDestroyInterceptor()),
        catchError((error) => {
          this.loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.tamBanaGoreCampaigns.filter((campaign) => campaign.type === 'tbgkky')[0].optinFlag = '1';
      });
  }

  sendGtmPageViewEvent(page: string): void {
    this.gtmService.sendPageView({
      event: `virtualPageview${page}`,
      virtualPagePath: this.router.url,
      virtualPageTitle: 'Kampanyalar | Migros SanalMarket',
      virtualPageName: page,
      objectId: '',
    });
  }

  subcribeToAppStateService(): void {
    this.appStateService
      .getPortfolio$()
      .pipe(takeUntil(this.getDestroyInterceptor()))
      .subscribe((portfolio) => (this._portfolio = portfolio));
  }
}
