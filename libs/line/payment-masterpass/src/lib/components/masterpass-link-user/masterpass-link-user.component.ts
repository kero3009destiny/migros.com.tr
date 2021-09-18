import { Component, ElementRef, ViewChild } from '@angular/core';

import { UserService } from '@fe-commerce/core';
import { EnvService } from '@fe-commerce/env-service';

import { map } from 'rxjs/operators';

import { UserStatus } from '../../models';
import { MasterpassService } from '../../services/masterpass.service';
import { extractInputsFromNodeList } from '../../utils';

@Component({
  selector: 'fe-masterpass-link-user',
  templateUrl: './masterpass-link-user.component.html',
  styleUrls: ['./masterpass-link-user.component.scss'],
})
export class MasterpassLinkUserComponent {
  isUserLinkable$ = this._masterpassService.getStatus().pipe(map((status) => status === UserStatus.LINKABLE));

  @ViewChild('linkMasterPassForm') linkForm: ElementRef<HTMLFormElement>;

  constructor(
    private _masterpassService: MasterpassService,
    private _userService: UserService,
    private _envService: EnvService
  ) {}

  get user$() {
    return this._userService.user$;
  }

  get companyName(): string {
    return this._envService.companyName;
  }

  onLinkAccepted() {
    const linkInputs = extractInputsFromNodeList(this.linkForm);
    this._masterpassService.linkUser(linkInputs);
  }
}
