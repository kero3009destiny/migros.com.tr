import { Injectable } from '@angular/core';

import { finalize } from 'rxjs/operators';

import { Observable, Observer, ReplaySubject } from 'rxjs';

import { LoadingIndicatorService } from '../loading-indicator/loading-indicator.service';

interface ScriptModel {
  name: string;
  src: string;
  loaded: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class LazyScriptLoaderService {
  private scripts: ScriptModel[] = [];
  private scripts$ = new ReplaySubject<ScriptModel>();

  constructor(private _loadingIndicatorService: LoadingIndicatorService) {}

  load(script: Pick<ScriptModel, 'src' | 'name'>): Observable<ScriptModel> {
    this._loadingIndicatorService.start();
    return new Observable<ScriptModel>((observer: Observer<ScriptModel>) => {
      const existingScript = this.scripts.find((s) => s.name === script.name);

      if (existingScript && existingScript.loaded) {
        observer.next(existingScript);
        observer.complete();
        return;
      }
      const newScript = { ...script, loaded: false };
      this.scripts = [...this.scripts, newScript];

      const scriptElement = document.createElement('script');
      scriptElement.type = 'text/javascript';
      scriptElement.src = newScript.src;

      scriptElement.onload = () => {
        newScript.loaded = true;
        this.scripts$.next(newScript);
        observer.next(newScript);
        observer.complete();
      };

      scriptElement.onerror = () => {
        console.error(`Couldn't load script ${script.src}`);
      };

      document.getElementsByTagName('body')[0].appendChild(scriptElement);
    }).pipe(
      finalize(() => {
        this._loadingIndicatorService.stop();
      })
    );
  }

  getScripts$(): Observable<ScriptModel> {
    return this.scripts$.asObservable();
  }
}
