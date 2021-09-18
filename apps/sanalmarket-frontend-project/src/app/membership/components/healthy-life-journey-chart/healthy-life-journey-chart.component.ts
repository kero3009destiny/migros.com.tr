import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';

import { LazyScriptLoaderService } from '@fe-commerce/core';
import { DoughnutChart } from '@fe-commerce/shared';

@Component({
  selector: 'sm-healthy-life-journey-chart',
  templateUrl: './healthy-life-journey-chart.component.html',
  styleUrls: ['./healthy-life-journey-chart.component.scss'],
})
export class HealthyLifeJourneyChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvasElement') canvas: ElementRef;
  @Input() chartValues: DoughnutChart;
  @Input() name: string;
  @Input() customColors: string[];

  readonly DAIRY_PRODUCTS_PART_COLOR: string[] = ['#f75b39', '#30a6e3', '#e62867', '#fdb615', '#2ecd8c'];

  private chart: unknown;
  private chartDatas;

  private chartOptions = {
    plugins: {
      legend: {
        display: false,
      },
    },
  };
  constructor(private _lazyScriptLoaderService: LazyScriptLoaderService) {}

  ngAfterViewInit(): void {
    this._lazyScriptLoaderService
      .load({
        src: 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.3.2/chart.min.js',
        name: 'chart.js',
      })
      .subscribe(() => {
        this.chartFilled();
      });
  }

  ngOnDestroy(): void {
    // @ts-expect-error https://www.chartjs.org/docs/latest/developers/api.html#destroy
    this.chart?.destroy();
  }

  chartFilled(): void {
    const donutCtx = this.canvas.nativeElement.getContext('2d');
    const colorList = this.customColors ?? this.DAIRY_PRODUCTS_PART_COLOR;
    this.chartDatas = {
      datasets: [
        {
          data: this.chartValues.chartData,
          backgroundColor: colorList,
          borderColor: colorList,
        },
      ],
      labels: this.chartValues.chartLabel,
    };
    // @ts-expect-error https://www.chartjs.org/docs/latest/getting-started/usage.html#creating-a-chart
    this.chart = new Chart(donutCtx, {
      type: 'doughnut',
      data: this.chartDatas,
      options: this.chartOptions,
    });
  }
}
