import { Injectable } from '@angular/core';

import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { CartRestControllerService, UpdateNote } from '@migroscomtr/sanalmarket-angular';

@Injectable()
export class CartProductNoteService {
  constructor(private _cartRestService: CartRestControllerService) {}

  upsertNote(noteRequest: UpdateNote) {
    return this._cartRestService
      .updateNotes({ updateNotes: [noteRequest] })
      .pipe(catchError((error) => throwError(error)));
  }
}
