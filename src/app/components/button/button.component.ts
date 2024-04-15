import {
  ChangeDetectionStrategy,
  Component,
  InputSignal,
  OutputEmitterRef,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconName, IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { ButtonStyles } from './button.model';

@Component({
  selector: 'is-button',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [style]="{ color: labelColor() }"
      [ngClass]="buttonClass()"
      (click)="onClick.emit($event)"
      (focus)="onFocus.emit($event)"
      (blur)="onBlur.emit($event)">
      <ng-container *ngIf="icon() && !loading()">
        <fa-icon
          [size]="iconSize()"
          [pull]="iconPos()"
          [style]="{ color: iconColor }"
          [icon]="['fas', icon()!]"></fa-icon>
      </ng-container>
      <ng-container *ngIf="loading() === true">
        <fa-icon
          [size]="iconSize()"
          [pull]="iconPos()"
          animation="spin"
          [icon]="loadingIcon"></fa-icon>
      </ng-container>
      <ng-container *ngIf="label()">
        {{ label() }}
      </ng-container>
      <ng-content></ng-content>
    </button>
  `,
  styles: [
    `
      .is-button {
        padding: 0rem 1rem;
        border-radius: 0.5rem;
        border: none;
        transition: 0.2s;
        display: flex;
        align-items: center;
        min-height: 32px;
      }
      .is-button:hover:not([disabled]) {
        cursor: pointer;
      }

      .is-button-primary {
        color: hsl(var(--primary-foreground));
        background-color: hsl(var(--primary));
      }
      .is-button-primary:hover:not([disabled]) {
        background-color: hsl(var(--primary) / 0.9);
      }
      .is-button-primary:enabled:focus {
        box-shadow: 0 0 0 2px hsl(var(--primary) / 0.6);
      }

      .is-button-secondary {
        color: hsl(var(--secondary-foreground));
        background-color: hsl(var(--secondary));
      }
      .is-button-secondary:hover:not([disabled]) {
        background-color: hsl(var(--secondary) / 0.9);
      }
      .is-button-secondary:enabled:focus {
        box-shadow: 0 0 0 2px hsl(var(--secondary) / 0.6);
      }

      .is-button-destructive {
        color: hsl(var(--destructive-foreground));
        background-color: hsl(var(--destructive));
      }
      .is-button-destructive:hover:not([disabled]) {
        background-color: hsl(var(--destructive) / 0.9);
      }
      .is-button-destructive:enabled:focus {
        box-shadow: 0 0 0 2px hsl(var(--destructive) / 0.6);
      }

      .is-button-outlined {
        background-color: hsl(var(--background));
        border: 1px solid hsl(var(--border));
        color: hsl(var(--accent-foreground));
      }
      .is-button-outlined:hover:not([disabled]) {
        background-color: hsl(var(--accent));
      }

      .is-button-ghost {
        background-color: transparent;
        color: hsl(var(--foreground));
      }
      .is-button-ghost:hover:not([disabled]) {
        background-color: hsl(var(--muted));
      }

      .is-button-loading {
        opacity: 0.5;
      }

      .is-button-dashed {
        border: 1px dashed hsl(var(--border));
      }

      .spinner {
        animation: spin-animation 1s linear infinite;
        display: inline-block;
      }
      @keyframes spin-animation {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  //! Inputs
  type: InputSignal<string> = input('button');
  label: InputSignal<string | undefined> = input();
  labelColor: InputSignal<string | undefined> = input();
  icon: InputSignal<IconName | undefined> = input();
  iconPos: InputSignal<'right' | 'left' | any> = input('left');
  iconColor: InputSignal<string | undefined> = input();
  iconSize: InputSignal<'2xs' | 'xs' | 'sm' | 'lg' | 'xl' | '2xl' | any> = input();
  disabled: InputSignal<boolean> = input(false);
  loading: InputSignal<boolean> = input(false);
  class: InputSignal<ButtonStyles[] | any> = input([], { alias: 'styleClass' });
  //! Outputs
  onClick: OutputEmitterRef<MouseEvent> = output<MouseEvent>();
  onFocus: OutputEmitterRef<FocusEvent> = output<FocusEvent>();
  onBlur: OutputEmitterRef<FocusEvent> = output<FocusEvent>();

  loadingIcon: IconProp = faCircleNotch;

  buttonClass(): Object {
    return {
      'is-button': true,
      'is-button-primary': this.class().includes('primary'),
      'is-button-secondary': this.class().includes('secondary'),
      'is-button-destructive': this.class().includes('destructive'),
      'is-button-outlined': this.class().includes('outlined'),
      'is-button-ghost': this.class().includes('ghost'),
      'is-button-loading': this.loading(),
      'is-button-dashed': this.class().includes('dashed'),
    };
  }
}
