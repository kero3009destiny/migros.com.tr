import { Component, Input } from '@angular/core';

import { UserDTO } from '@migroscomtr/sanalmarket-angular';

@Component({
  selector: 'fe-account-dropdown',
  templateUrl: './account-dropdown.component.html',
  styleUrls: ['./account-dropdown.component.scss'],
})
export class AccountDropdownComponent {
  @Input() user: UserDTO;
}
