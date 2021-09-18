import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'fe-selectable-card',
  templateUrl: './selectable-card.component.html',
  styleUrls: ['./selectable-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SelectableCardComponent {
  @Input() isSelected = false;
  @Input() outlined = false;
  @Input() disabled = false;
  @Input() hasActions = false;
  @Input() hasHeader = false;

  @Output() selected = new EventEmitter<never>();
  @Output() hovered = new EventEmitter<boolean>();

  onSelected() {
    this.isSelected = !this.isSelected;
    this.selected.emit();
  }

  onPointerEnter() {
    this.hovered.emit(true);
  }

  onPointerExit() {
    this.hovered.emit(false);
  }
}
