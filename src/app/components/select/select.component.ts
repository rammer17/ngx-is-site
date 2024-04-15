import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  InputSignal,
  WritableSignal,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';
import { PopoverDirective } from '../popover/popover.directive';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'is-select',
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, PopoverDirective, FontAwesomeModule],
  template: `
    <div class="w-100 ">{{ placeholder() }}</div>
    <div [ngClass]="wrapperClass()" class="w-100">
      <input
        readonly
        autocomplete="off"
        #input
        id="input"
        title=""
        (focus)="showDropdownOptions = true"
        (blur)="showDropdownOptions = false"
        [value]="value()"
        class="form-input"
        [ngClass]="{ auto: auto() }"
        [isPopover]="showDropdownOptions"
        [appendTo]="'body'"
        [position]="'top-inline-left'"
        [template]="dropdownTemplate" />
      <fa-icon class="sort-icon" [icon]="['fas', 'sort']"></fa-icon>
      <ng-template #dropdownTemplate>
        <ul class="dropdown">
          <li *ngFor="let option of data()" class="dropdown-option" (click)="onInputChange(option)">
            {{ optionProperty() ? option['optionProperty'] : option }}
            <fa-icon *ngIf="option == value()" [icon]="['fas', 'check']" size="sm"></fa-icon>
          </li>
        </ul>
      </ng-template>
    </div>
  `,
  styles: [
    `
      * {
        box-sizing: border-box;
      }
      .form-input {
        padding: 0.5rem 0.7rem;
        border-radius: calc(0.5rem - 2px);
        width: 4rem;
        height: 2rem;
        font-size: 0.875rem;
        line-height: 1.25rem;
        border: 1px solid hsl(var(--border));
        background-color: hsl(var(--background));
        color: hsl(var(--foreground));
        position: relative;
        z-index: 51;
        transition: 0.15s border;
        &:hover {
          cursor: pointer;
        }
      }
      .auto {
        width: auto !important;
      }
      .dropdown-wrapper {
        position: relative;
        display: flex;
        justify-content: center;
        flex-direction: column !important;
        fa-icon.sort-icon {
          position: absolute;
          z-index: 51;
          float: right;
          right: 0.7rem;
          height: 1.25rem;
          &:hover {
            cursor: pointer;
          }
        }
      }
      .dropdown-wrapper:focus-within {
        .form-input::placeholder {
          opacity: 0;
        }
      }
      .dropdown {
        list-style: none;
        border-radius: calc(0.5rem - 2px);
        border: 1px solid hsl(var(--border));
        width: 100%;
        margin: 0;
        padding: 0;
        max-height: 200px;
        overflow-y: auto;
        li {
          padding: 0.5rem 0.75rem;
          background-color: hsl(var(--background));
          color: hsl(var(--accent-foreground));
          list-style: none;
          transition: 0.15s all;
          display: flex;
          justify-content: space-between;
          font-family: '__Inter_0ec1f4', '__Inter_Fallback_0ec1f4', ui-sans-serif, system-ui,
            -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
            'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
            'Noto Color Emoji';
        }
        li:hover {
          cursor: pointer;
          background-color: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
        }
      }
      .input-destructive {
        .form-input {
          transition: 0.15s;
          box-shadow: hsl(var(--background));
          outline: 2px solid hsl(var(--destructive));
        }
      }
      .input-success {
        .form-input {
          transition: 0.15s;
          box-shadow: hsl(var(--background));
          outline: 2px solid hsl(var(--success));
        }
      }
      .selected-option {
        background-color: hsl(var(--background)) !important;
        color: hsl(var(--accent-foreground));
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent implements ControlValueAccessor {
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  data: InputSignal<any[]> = input.required();
  placeholder: InputSignal<string> = input('');
  disabled: InputSignal<boolean> = input(false);
  auto: InputSignal<boolean> = input(false);
  optionProperty: InputSignal<string | null> = input(null, { transform: (x) => x });

  value: WritableSignal<any> = signal(null);
  showDropdownOptions: boolean = false;

  ngAfterViewInit(): void {}

  wrapperClass(): Object {
    return {
      'dropdown-wrapper': true,
    };
  }

  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: any): void {
    this.value.set(value);
  }

  registerOnChange(fn: () => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onInputChange(value: any): void {
    this.value.set(value);
    this.onChange(this.value());
    this.onTouched();
    this.cdr.markForCheck();
  }
}
