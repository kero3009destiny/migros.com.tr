import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material-experimental/mdc-dialog';

import { faChevronRight, IconDefinition } from '@fortawesome/pro-solid-svg-icons';

import { CompleteMembershipEvent, CompleteMembershipRef } from './complete-membership.ref';
import { MobileAgreementsDialogComponent } from './mobile-agreements-dialog/mobile-agreements-dialog.component';

@Component({
  selector: 'sm-complete-membership',
  templateUrl: './complete-membership.component.html',
  styleUrls: ['./complete-membership.component.scss'],
})
export class CompleteMembershipComponent extends CompleteMembershipRef implements OnInit {
  @Input() membershipCompleted = false;
  @Output() completeMembership: EventEmitter<CompleteMembershipEvent> = new EventEmitter();

  completeMembershipFormGroup: FormGroup;
  faChevronRight: IconDefinition;

  constructor(private _dialogService: MatDialog, formBuilder: FormBuilder) {
    super(formBuilder);
    this.faChevronRight = faChevronRight;
  }

  ngOnInit() {
    super.ngOnInit();
  }

  onClickMobileCompleteMembershipButton(): void {
    this.openRegistrationAgreementsDialog();
  }

  openRegistrationAgreementsDialog(): void {
    this._dialogService
      .open(MobileAgreementsDialogComponent, { panelClass: 'wide-dialog' })
      .afterClosed()
      .subscribe((event: CompleteMembershipEvent) => {
        if (event) {
          this.onCompleteMembership(event);
        }
      });
  }

  isCompleteMembershipFormInitiated(): boolean {
    return !!this.completeMembershipFormGroup.value.registrationAgreements;
  }

  isCompleteMembershipFormGroupValid(): boolean {
    return this.isCompleteMembershipFormInitiated() && this.completeMembershipFormGroup.valid;
  }

  onCompleteMembership(event?: CompleteMembershipEvent): void {
    this.completeMembership.emit(event ?? this.createCompleteMembershipEvent());
  }
}
