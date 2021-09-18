import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { GtmService, UserService } from '@fe-commerce/core';
import { DoughnutChart, HealthyJourneyType } from '@fe-commerce/shared';

import { filter } from 'rxjs/operators';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faArrowLeft } from '@fortawesome/pro-regular-svg-icons/faArrowLeft';
import { Router } from '@angular/router';

@Component({
  selector: 'sm-healthy-life-journey',
  templateUrl: './healthy-life-journey.page.html',
  styleUrls: ['./healthy-life-journey.page.scss'],
})
export class HealthyLifeJourneyPage implements OnInit {
  private commonReference: DoughnutChart;
  private veganReference: DoughnutChart;
  private vegetarianReference: DoughnutChart;
  private commonUser: DoughnutChart;
  private veganUser: DoughnutChart;
  private vegetarianUser: DoughnutChart;
  private hasCommonShopping: boolean;
  private hasVeganShopping: boolean;
  private hasVegetarianShopping: boolean;
  private chartLabel: string[];
  private selected: HealthyJourneyType = 'common';
  private isLoading = true;
  private arrowLeftIcon = faArrowLeft;

  constructor(
    private _userService: UserService,
    private gtmService: GtmService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getHealthyLifeInfo();
    this.sendGtmPageViewEvent('HealthyLifeJourney', 'Sağlıklı Yaşam Yolculuğum | Sanal Market');
  }

  getHealthyLifeInfo() {
    this._userService
      .getHealthyLifeInfo()
      .pipe(filter((data) => !!data.groceryHabits))
      .subscribe((info) => {
        this.chartLabel = info.groceryHabits[0].referencePie.map((data, index) => data.category);

        this.commonReference = {
          chartLabel: this.chartLabel,
          chartData: info.groceryHabits
            .filter((i) => i.category === 'Genel')[0]
            .referencePie.map((data, index) => data.percentage),
        };

        const veganReferenceList = info.groceryHabits
          .filter((i) => i.category === 'Vegan')[0]
          .referencePie.map((data, index) => data.percentage);
        this.veganReference = {
          chartLabel: this.chartLabel,
          chartData: [veganReferenceList[0], 0, 0, veganReferenceList[1], veganReferenceList[2]],
        };

        const vegetarianReferenceList = info.groceryHabits
          .filter((i) => i.category === 'Vejetaryen')[0]
          .referencePie.map((data, index) => data.percentage);
        this.vegetarianReference = {
          chartLabel: this.chartLabel,
          chartData: [
            vegetarianReferenceList[0],
            vegetarianReferenceList[1],
            0,
            vegetarianReferenceList[2],
            vegetarianReferenceList[3],
          ],
        };

        this.commonUser = {
          chartLabel: this.chartLabel,
          chartData: info.groceryHabits
            .filter((i) => i.category === 'Genel')[0]
            .userPie.map((data, index) => data.percentage),
        };

        this.hasCommonShopping = this.commonUser.chartData.length > 0;

        const veganUserList = info.groceryHabits
          .filter((i) => i.category === 'Vegan')[0]
          .userPie.map((data, index) => data.percentage);
        this.veganUser = {
          chartLabel: this.chartLabel,
          chartData: [veganUserList[0], 0, 0, veganUserList[1], veganUserList[2]],
        };

        this.hasVeganShopping = this.veganUser.chartData[0] !== undefined;

        const vegetarianUserList = info.groceryHabits
          .filter((i) => i.category === 'Vejetaryen')[0]
          .userPie.map((data, index) => data.percentage);
        this.vegetarianUser = {
          chartLabel: this.chartLabel,
          chartData: [vegetarianUserList[0], vegetarianUserList[1], 0, vegetarianUserList[2], vegetarianUserList[3]],
        };

        this.hasVegetarianShopping = this.vegetarianUser.chartData[0] !== undefined;

        this.isLoading = false;
        this.cd.markForCheck();
      });
  }

  setDiet(event): void {
    this._userService.enrollHealthyLifeChoice(event.value);
  }

  getArrowLeftIcon(): IconProp {
    return this.arrowLeftIcon;
  }

  getCommonReference(): DoughnutChart {
    return this.commonReference;
  }

  getVeganReference(): DoughnutChart {
    return this.veganReference;
  }

  getVegetarianReference(): DoughnutChart {
    return this.vegetarianReference;
  }

  getCommonUser(): DoughnutChart {
    return this.commonUser;
  }

  getVeganUser(): DoughnutChart {
    return this.veganUser;
  }

  getVegetarianUser(): DoughnutChart {
    return this.vegetarianUser;
  }

  getHasCommonShopping(): boolean {
    return this.hasCommonShopping;
  }

  getHasVeganShopping(): boolean {
    return this.hasVeganShopping;
  }

  getHasVegetarianShopping(): boolean {
    return this.hasVegetarianShopping;
  }

  getIsLoading(): boolean {
    return this.isLoading;
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
