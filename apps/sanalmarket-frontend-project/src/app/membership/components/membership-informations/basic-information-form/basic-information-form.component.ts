import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { faInfoCircle } from '@fortawesome/pro-regular-svg-icons';
import { UserDTO } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'sm-basic-information-form',
  templateUrl: './basic-information-form.component.html',
  styleUrls: ['./basic-information-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicInformationFormComponent {
  @Input() user: UserDTO;
  @Input() formGroup: FormGroup;
  @Input() isNewRegister: boolean;

  infoIcon = faInfoCircle;

  getMinBirthDate(): Date {
    return new Date('1930-01-01');
  }

  getMaxBirthDate(): Date {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay;
  }

  isGenderChecked(value: string): boolean {
    return value === this.user?.gender;
  }
}
