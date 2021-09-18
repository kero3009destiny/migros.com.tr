import { animate, style, transition, trigger } from '@angular/animations';

export const presenceAnimationTrigger = trigger('presenceAnimation', [
  transition(':enter', [style({ opacity: 0 }), animate('300ms ease-in-out')]),
  transition(':leave', [animate('300ms ease-in-out', style({ opacity: 0 }))]),
]);

export const presenceAnimationFasterTrigger = trigger('presenceAnimationFaster', [
  transition(':enter', [style({ opacity: 0 }), animate('150ms ease-in-out')]),
  transition(':leave', [animate('150ms ease-in-out', style({ opacity: 0 }))]),
]);

export const onEnterAnimationTrigger = trigger('onEnterAnimation', [
  transition(':enter', [style({ opacity: 0 }), animate('300ms ease-in-out')]),
]);
