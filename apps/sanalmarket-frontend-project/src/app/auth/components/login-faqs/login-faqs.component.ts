import { Component, EventEmitter, Input, Output } from '@angular/core';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faArrowLeft } from '@fortawesome/pro-regular-svg-icons/faArrowLeft';
import { FaqDTO } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'sm-login-faqs',
  templateUrl: './login-faqs.component.html',
  styleUrls: ['./login-faqs.component.scss'],
})
export class LoginFaqsComponent {
  @Input() faqs: FaqDTO[];
  @Output() closeFaq = new EventEmitter<never>();
  returnIcon: IconProp = faArrowLeft;

  closeFaqs() {
    this.closeFaq.emit();
  }
}
