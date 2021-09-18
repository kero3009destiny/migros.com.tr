import { Component, Input } from '@angular/core'

@Component({
  selector: 'fe-search-not-found',
  templateUrl: './search-not-found.component.html',
  styleUrls: ['./search-not-found.component.scss'],
})
export class SearchNotFoundComponent {
  @Input() searchQueryParams = { q: '' }
}
