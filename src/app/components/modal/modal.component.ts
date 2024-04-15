import {
  Component,
  DestroyRef,
  InputSignal,
  OutputEmitterRef,
  TemplateRef,
  inject,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TrapFocusDirective } from './trap-focus.directive';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'is-modal',
  standalone: true,
  imports: [CommonModule, TrapFocusDirective],
  template: `
    <div class="modal-deadarea" trapFocus>
      <dialog
        [open]="isModalVisible()"
        [@defaultAnimation]="{ value: showAnimation, params: { duration: duration() } }">
        <!--* Header -->
        <ng-container *ngTemplateOutlet="headerTemplate() || defaultHeaderTemplate"></ng-container>
        <ng-template #defaultHeaderTemplate>
          <h3 class="modal-heading">Are you sure?</h3>
        </ng-template>

        <!-- Content -->
        <ng-container
          *ngTemplateOutlet="contentTemplate() || defaultContentTemplate"></ng-container>
        <ng-template #defaultContentTemplate>
          <p class="content-paragraph">
            The phantom menace is the best episode! Also greedo shot first
          </p>
        </ng-template>

        <!--* Actions -->
        <div class="modal-actions">
          <button class="cancel-btn" (click)="onCancel()">Cancel</button>
          <button class="submit-btn" (click)="onSubmit()">Save</button>
        </div>
      </dialog>
    </div>
  `,
  styles: [
    `
      .modal-deadarea {
        background-color: rgba(0, 0, 0, 0.8);
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: 100vw;
        display: flex;
        align-items: center;
        justify-content: center;
        dialog {
          padding: 1.5rem;
          border-radius: var(--radius);
          border: 0px solid #fefefe;
          overscroll-behavior: contain;
          .modal-heading {
            color: hsl(var(--primary-foreground));
            margin: 0 0 0.5rem 0;
          }
          .content-paragraph {
            color: hsl(var(--muted-foreground));
          }
          .modal-actions {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 0.5rem;
            .submit-btn,
            .cancel-btn {
              border: 1px solid;
              border-radius: var(--radius);
              height: 2rem;
              white-space: nowrap;
              padding: 0.5rem 1rem;
              font-weight: 500;
              font-size: 0.875rem;
              line-height: 1.25rem;
              display: inline-flex;
              justify-content: center;
              align-items: center;
              transition-property: color, background-color;
              transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
              transition-duration: 0.15s;
            }
            .cancel-btn {
              border-color: hsl(var(--input));
              background-color: inherit;
              color: hsl(var(--primary-foreground));
            }
            .cancel-btn:hover {
              background-color: hsl(var(--accent));
              color: hsl(var(--accent-foreground));
              cursor: pointer;
            }
            .submit-btn {
              border-color: hsl(var(--input));
              background-color: hsl(var(--secondary));
              color: hsl(var(--secondary-foreground));
            }
            .submit-btn:hover {
              background-color: hsl(var(--secondary) / 0.9);
              cursor: pointer;
            }
          }
        }
      }
    `,
  ],
  animations: [
    trigger('defaultAnimation', [
      state('void, false', style({ transform: 'scale(0)' })),
      transition('* => true', [
        style({ opacity: 0, transform: 'translateY(0%) scale(0.5)' }),
        animate('{{ duration }}ms', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
      transition('* => false', [
        style({ opacity: 1, transform: 'scale(1)' }),
        animate('{{ duration }}ms', style({ opacity: 0, transform: 'scale(0.95)' })),
      ]),
    ]),
  ],
})
export class ModalComponent {
  //! Dependencies
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  //! Outputs
  close: OutputEmitterRef<void> = output<void>();
  submit: OutputEmitterRef<void> = output<void>();
  //! Inputs
  headerTemplate: InputSignal<TemplateRef<any> | any> = input(null, { alias: 'header' });
  contentTemplate: InputSignal<TemplateRef<any> | any> = input(null, { alias: 'content' });
  isModalVisible: InputSignal<boolean> = input(true, { alias: 'open' });
  duration: InputSignal<number> = input(150, { alias: 'duration' });

  showAnimation: boolean = true;

  ngOnInit(): void {
    this.initEventListenerObservables();
  }

  onCancel(): void {
    this.closeModal('close');
  }

  onSubmit(): void {
    this.closeModal('submit');
  }

  private closeModal(eventType: 'close' | 'submit'): void {
    this.showAnimation = false;
    setTimeout(() => {
      this[eventType].emit();
    }, this.duration());
  }

  private initEventListenerObservables(): void {
    fromEvent(window, 'wheel', { passive: false })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((e: any) => {
        if (e?.ctrlKey) e.preventDefault();
      });
  }
}
