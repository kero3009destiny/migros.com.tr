import { ErrorHandler, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChunkErrorHandler implements ErrorHandler {
  private _chunkFailedMessage = /Loading chunk [\d]+ failed/;

  shouldHandle(error: any) {
    return this._chunkFailedMessage.test(error.message);
  }

  handleError(error: any): void {
    // Normally service worker should handle missing chunks
    // This is for devices that does not support sw e.g. mobile browsers
    window.location.reload();
  }
}
