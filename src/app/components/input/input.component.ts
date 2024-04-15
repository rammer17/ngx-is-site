import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition, IconName } from '@fortawesome/free-solid-svg-icons';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'is-input',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule],
  template: `
    <div [ngClass]="wrapperClass()">
      <input
        #input
        id="input"
        [disabled]="disabled"
        [type]="type"
        [placeholder]="placeholder"
        title=""
        [checked]="checked"
        [ngModel]="value"
        (ngModelChange)="onInputChange($event)"
        [accept]="allowedExtensions"
        [ngClass]="inputClass()" />
      <fa-icon
        *ngIf="inputIcon && type !== 'checkbox'"
        [style]="{ color: iconColor }"
        [size]="iconSize"
        [ngClass]="iconClass()"
        [icon]="inputIcon"></fa-icon>
    </div>
  `,
  styles: [
    `
      * {
        box-sizing: border-box;
      }
      .is-input {
        padding: 0.5rem 0.75rem;
        border-radius: calc(0.5rem - 2px);
        height: 2rem;
        font-size: 0.875rem;
        line-height: 1.25rem;
        border: 1px solid hsl(var(--input));
        background-color: hsl(var(--background));
        color: hsl(var(--foreground));
        position: relative;
        z-index: 51;
        transition: 0.15s border;
      }
      .is-input:disabled:hover {
        cursor: not-allowed;
      }
      input:not([type='checkbox']):focus-visible {
        box-shadow: hsl(var(--background));
        outline: 2px solid hsl(var(--foreground));
        outline-offset: 1px;
      }
      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      input[type='number'] {
        -moz-appearance: textfield;
        appearance: textfield;
      }
      .input-wrapper {
        position: relative;
        display: flex;
        justify-content: center;
        flex-direction: column !important;
      }
      .input-wrapper:focus-within {
        .is-input::placeholder {
          opacity: 0;
        }
      }
      .input-destructive {
        .is-input {
          transition: 0.15s;
          box-shadow: hsl(var(--background));
          outline: 2px solid hsl(var(--destructive));
        }
      }
      .input-success {
        .is-input {
          transition: 0.15s;
          box-shadow: hsl(var(--background));
          outline: 2px solid hsl(var(--success));
        }
      }
      .input-ghost {
        .is-input {
          outline: none;
          border: none;
        }
      }

      .is-input::file-selector-button {
        background: hsl(var(--background));
        color: hsl(var(--foreground));
        outline: none;
        border: none;
      }
      .input-file-icon {
        .is-input::file-selector-button {
          margin-left: 20px;
        }
      }
      .input-icon {
        input {
          padding-left: 2rem;
        }
      }
      .is-input::file-selector-button:hover,
      input[type='file']:hover {
        cursor: pointer;
      }
      fa-icon {
        color: hsl(var(--foreground));
        position: absolute;
        z-index: 51;
        transform: translateX(50%);
      }
      .is-input-icon-right {
        right: 0;
        transform: translateX(-50%);
      }
      .is-input[type='checkbox'] {
        -moz-appearance: none;
        appearance: none;
        padding: 0.1rem 0.4rem;
        width: 16px;
        height: 16px;
        transition-duration: 0.15s;
        transition-property: background-color;
        border-color: hsl(var(--primary));
      }
      .is-input[type='checkbox']::before {
        content: '✓';
        color: transparent;
        position: relative;
        top: -4px;
        left: -4px;
      }
      .is-input[type='checkbox']:checked {
        -moz-appearance: none;
        background-color: hsl(var(--primary));
      }
      .is-input[type='checkbox']:checked::before {
        content: '✓';
        color: black;
      }
      .is-input[type='checkbox']:focus-visible {
        outline: none;
      }
      .input-checkbox {
        display: inline-flex;
        align-items: center;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() value: any;
  @Input('type') type: InputTypes = 'text';
  @Input('placeholder') placeholder: string = '';
  @Input('invalid') invalid: boolean = false;
  @Input('valid') valid: boolean = false;
  @Input('disabled') disabled: boolean = false;
  @Input('allowedExtensions') allowedExtensions: string[] = [];
  @Input('icon') inputIcon?: IconName | IconDefinition;
  @Input('iconPos') iconPos: 'left' | 'right' = 'left';
  @Input('iconColor') iconColor?: string;
  @Input('iconSize') iconSize?: '2xs' | 'xs' | 'sm' | 'lg' | 'xl' | '2xl';
  @Input('ghost') ghost: boolean = false;
  @Input('checked') checked: boolean = false;
  @Output('onChange') onValueChange: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('input') input?: ElementRef<HTMLInputElement>;

  onChange: any = () => {};
  onTouched: any = () => {};

  inputClass(): Object {
    return {
      'is-input': true,
    };
  }

  wrapperClass(): Object {
    return {
      'input-wrapper': true,
      'input-destructive': this.invalid,
      'input-success': this.valid,
      'input-file-icon': this.type === 'file' && this.iconPos === 'left' && this.inputIcon,
      'input-icon': this.inputIcon && this.iconPos === 'left',
      'input-ghost': this.ghost,
      'input-checkbox': this.type === 'checkbox',
    };
  }

  iconClass(): Object {
    return {
      'is-input-icon-right': this.iconPos === 'right',
    };
  }

  writeValue(value: string): void {
    this.value = value;
    if (this.type === 'checkbox') {
      this.onInputChange(true);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onInputChange(value: any): void {
    if (this.type === 'checkbox') {
      this.checked = !this.checked;
      value = this.checked;
    }
    this.value = value;
    this.onChange(value);
    this.onTouched();
    this.onValueChange.emit(value);
  }
}

export type InputTypes = 'text' | 'number' | 'password' | 'file' | 'checkbox';
