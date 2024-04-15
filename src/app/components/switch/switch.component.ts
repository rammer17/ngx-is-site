import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  inject,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'is-switch',
  standalone: true,
  imports: [NgClass, FormsModule],
  template: `
    <button
      #button
      type="button"
      [disabled]="disabled"
      [ngClass]="{ checked: value, disabled: disabled }"
      (click)="onSwitch()">
      <span class="circle"> </span>
    </button>
  `,
  styles: [
    `
      button {
        padding: 0.25rem;
        margin: 0;
        width: 2.75rem;
        height: 1.5rem;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        border: none;
        outline: none;
        background-color: hsl(var(--secondary) / 0.5);
        transition: 0.15s linear;
        span.circle {
          display: inline-block;
          height: 1.25rem;
          width: 1.25rem;
          border-radius: 9999px;
          background-color: hsl(var(--background));
          transition: 0.15s linear;
        }
        &:hover {
          cursor: pointer;
        }
        &.checked {
          background-color: hsl(var(--primary));
          span.circle {
            margin-left: 50%;
          }
        }
        &.disabled {
          opacity: 0.75;
          span.circle {
            opacity: 0.75;
          }
          &:hover {
            cursor: not-allowed;
          }
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SwitchComponent),
      multi: true,
    },
  ],
})
export class SwitchComponent implements ControlValueAccessor {
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  value: boolean = false;
  disabled: boolean = false;

  onChange: (value: boolean) => void = () => {};
  onTouched: () => void = () => {};

  onSwitch(): void {
    this.value = !this.value;
    this.onChange(this.value);
    this.onTouched();
  }

  writeValue(obj: boolean): void {
    this.value = obj;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
    this.cdr.markForCheck();
  }
}
