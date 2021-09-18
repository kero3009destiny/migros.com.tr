import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { faStar, IconDefinition } from '@fortawesome/pro-solid-svg-icons';

@Component({
  selector: 'fe-membership-rating-stars',
  templateUrl: './rating-stars.component.html',
  styleUrls: ['./rating-stars.component.scss'],
})
export class RatingStarsComponent implements OnInit {
  starIcon: IconDefinition = faStar;
  starsArray = [];
  @Input() isPreview = false;
  @Input() ratingValue: number;
  @Output() clickRating = new EventEmitter();

  ngOnInit(): void {
    this.fillStarsArray(5);
  }

  isStarRated(index: number): string {
    if (this.ratingValue >= index + 1) {
      return 'rated';
    }
    return '';
  }

  onClickRating(index: number): void {
    this.clickRating.emit(index);
  }

  fillStarsArray(totalStarCount: number): void {
    this.starsArray = [...Array(totalStarCount).keys()];
  }
}
