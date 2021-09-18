import { Component } from '@angular/core';

import { UserService } from '@fe-commerce/core';
import { EnvService } from '@fe-commerce/env-service';
import { MasterpassLinkUserComponent, MasterpassService } from '@fe-commerce/line-payment-masterpass';

@Component({
  selector: 'sm-masterpass-link-user',
  templateUrl: './masterpass-link-user.component.html',
  styleUrls: ['./masterpass-link-user.component.scss'],
})
export class SmMasterpassLinkUserComponent extends MasterpassLinkUserComponent {
  constructor(_masterpassService: MasterpassService, _userService: UserService, _envService: EnvService) {
    super(_masterpassService, _userService, _envService);
  }
}
