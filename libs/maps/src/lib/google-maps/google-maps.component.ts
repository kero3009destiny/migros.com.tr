import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';

import { LazyScriptLoaderService } from '@fe-commerce/core';

import { catchError, map } from 'rxjs/operators';

import { Observable, of } from 'rxjs';

import { InfoWindowModel } from './map-model';

@Component({
  selector: 'fe-google-maps',
  templateUrl: './google-maps.component.html',
  styleUrls: ['./google-maps.component.scss'],
})
export class GoogleMapsComponent implements OnInit {
  @Input() coordinates: google.maps.LatLngLiteral;
  @Input() markerIconPath: string;
  @Input() infoWindowContent: InfoWindowModel;

  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;
  @ViewChild('marker') mapMarker: MapMarker;

  apiLoaded: Observable<boolean>;

  constructor(private _lazyScriptLoaderService: LazyScriptLoaderService) {}

  ngOnInit(): void {
    this.apiLoaded = this._lazyScriptLoaderService
      .load({
        src: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDlSG4NrUO_ZqPUd6jiMcdR0qxDpjDu-uo',
        name: 'google-maps',
      })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  onLoad() {
    this.infoWindow.open(this.mapMarker);
  }

  getZoom(): number {
    return 14;
  }

  getCenter(): google.maps.LatLngLiteral {
    return { lat: this.coordinates.lat + 0.001, lng: this.coordinates.lng };
  }

  getMarkerPosition(): google.maps.LatLngLiteral {
    return this.coordinates;
  }

  getMarkerOptions(): google.maps.MarkerOptions {
    return {
      icon: this.markerIconPath,
      anchorPoint: new google.maps.Point(0, -35),
    };
  }

  openInfoWindow(marker: MapMarker): void {
    this.infoWindow.open(marker);
  }
}
