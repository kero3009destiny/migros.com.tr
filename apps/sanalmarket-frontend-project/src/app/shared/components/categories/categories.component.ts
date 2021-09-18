import { Component, OnInit } from '@angular/core';

import { LoggingService } from '@fe-commerce/core';
import { SubscriptionAbstract } from '@fe-commerce/shared';

import { EMPTY } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { CategoryRestControllerService, TreeNodeCategoryDTO } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'sm-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent extends SubscriptionAbstract implements OnInit {
  private categories: TreeNodeCategoryDTO[];

  constructor(
    private loggingService: LoggingService,
    private productCategoryTreeService: CategoryRestControllerService
  ) {
    super();
  }

  ngOnInit() {
    this.fetchCategoryTree();
  }

  getCategories(): TreeNodeCategoryDTO[] {
    return this.categories;
  }

  getCategoryImgSrc(category: TreeNodeCategoryDTO): string {
    if (category.data.images.length > 0) {
      return category.data.images[0].urls.x1;
    }
    return category.data.iconUrl;
  }

  fetchCategoryTree(): void {
    this.productCategoryTreeService
      .getCategoryTree()
      .pipe(
        catchError((error) => {
          this.loggingService.logError({ title: 'Hata', message: error });
          return EMPTY;
        }),
        map((response) => response.data)
      )
      .subscribe((data) => {
        this.categories = data;
      });
  }
}
