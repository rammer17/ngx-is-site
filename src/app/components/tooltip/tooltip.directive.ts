import { trigger, transition, style, animate, state } from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  Directive,
  ElementRef,
  Renderer2,
  inject,
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  ChangeDetectorRef,
  ViewChild,
  ComponentRef,
  EmbeddedViewRef,
  ApplicationRef,
  ComponentFactoryResolver,
  Injector,
  Type,
  InputSignal,
  input,
} from '@angular/core';
import {
  ReplaySubject,
  delay,
  filter,
  finalize,
  fromEvent,
  merge,
  takeUntil,
  tap,
  throttleTime,
} from 'rxjs';
import { TooltipPosition } from './tooltip.model';

@Directive({
  selector: '[isTooltip]',
  standalone: true,
})
export class TooltipDirective {
  private readonly el: ElementRef = inject(ElementRef);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly appRef: ApplicationRef = inject(ApplicationRef);
  private readonly injector: Injector = inject(Injector);
  private readonly componentFactoryResolver: ComponentFactoryResolver =
    inject(ComponentFactoryResolver);

  //Tooltip text to display
  tooltipText: InputSignal<string> = input.required();
  //Position of the tooltip relative to the host element
  tooltipPos: InputSignal<TooltipPosition> = input('top' as TooltipPosition);
  //Delay after which the tooltip appears
  delay: InputSignal<number> = input(200, { alias: 'tooltipDelay' });
  //Duration in ms for which Enter and Exit animations occur
  animationDuration: InputSignal<number> = input(150, { alias: 'animationDuration' });

  tooltipComponentRef?: ComponentRef<TooltipComponent>;

  // Notifier obs for closing popover component
  destroy$?: ReplaySubject<any>;

  ngAfterViewInit(): void {
    this.initTooltipObservable();
  }

  initTooltipObservable(): void {
    const mouseEnter$ = fromEvent(this.el.nativeElement, 'mouseenter');
    const mouseLeave$ = fromEvent(this.el.nativeElement, 'mouseleave');
    const click$ = fromEvent(this.el.nativeElement, 'click');

    this.destroy$ = new ReplaySubject<any>(1);

    mouseEnter$
      .pipe(
        delay(this.delay()),
        filter(() =>
          this.el.nativeElement === document.activeElement ||
          this.el.nativeElement.contains(document.activeElement)
            ? false
            : true
        ),

        tap((e: any) => {
          this.createTooltip();
          e.stopPropagation();
        }),
        takeUntil(this.destroy$),
        finalize(() => {
          this.removeComponent(this.tooltipComponentRef!);
          this.tooltipComponentRef = undefined;
          this.cdr.detectChanges();
        })
      )
      .subscribe();

    merge(
      fromEvent(window, 'resize', { capture: true }),
      fromEvent(window, 'resize', { capture: true }).pipe(throttleTime(15)),
      mouseLeave$,
      click$
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.initTooltipObservable();
        this.destroy$!.next(null);
      });
  }

  private createTooltip(): void {
    let translateDir;
    let translateVal;
    //Set direction from which the tooltip appears depending on its position
    switch (this.tooltipPos()) {
      case 'top':
        translateDir = 'Y';
        translateVal = '';
        break;
      case 'bottom':
        translateDir = 'Y';
        translateVal = '-';
        break;
      case 'left':
        translateDir = 'X';
        translateVal = '';
        break;
      case 'right':
        translateDir = 'X';
        translateVal = '-';
        break;

      default:
        break;
    }

    this.tooltipComponentRef = this.appendComponent(TooltipComponent, {
      targetEl: this.el,
      tooltipPos: this.tooltipPos(),
      tooltipText: this.tooltipText(),
      translateDirection: translateDir,
      translateValue: translateVal,
      animationDuration: this.animationDuration(),
    });
  }

  private getComponentRootNode(componentRef: ComponentRef<any>): HTMLElement {
    return (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
  }

  private projectComponentInputs(component: ComponentRef<any>, options: any): ComponentRef<any> {
    if (options) {
      const props = Object.getOwnPropertyNames(options);
      for (const prop of props) {
        component.instance[prop] = options[prop];
      }
    }
    return component;
  }

  private appendComponent<T>(
    componentClass: Type<T>,
    options: any = {},
    location: Element = document.body
  ): ComponentRef<any> {
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentClass);
    let componentRef = componentFactory.create(this.injector);
    let appRef: any = this.appRef;
    let componentRootNode = this.getComponentRootNode(componentRef);

    this.projectComponentInputs(componentRef, options);

    appRef.attachView(componentRef.hostView);

    componentRef.onDestroy(() => {
      appRef.detachView(componentRef.hostView);
    });

    location.appendChild(componentRootNode);

    return componentRef;
  }

  private removeComponent(componentRef: ComponentRef<any>): void {
    componentRef.instance.close();
    setTimeout(() => {
      componentRef.destroy();
    }, this.animationDuration());
  }
}

@Component({
  selector: 'is-tooltip',
  standalone: true,
  template: `
    <div
      class="tooltip-container"
      [@tooltipAnimation]="{
        value: showLeaveAnimation,
        params: { td: translateDirection, tv: translateValue, ad: animationDuration }
      }">
      <div #tooltipEl class="tooltip-wrapper">
        <div class="tooltip-content">
          {{ tooltipText }}
        </div>
        <div class="tooltip-arrow"></div>
      </div>
    </div>
  `,
  styles: [
    `
      is-tooltip {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 10000;
        pointer-events: none;
      }
      .tooltip-content {
        font-size: 0.875rem;
        line-height: 1.25rem;
        border: 1px solid hsl(var(--input));
        padding: 0.5rem 0.75rem;
        border-radius: calc(0.5rem - 2px);
        background-color: hsl(var(--background));
        color: hsl(var(--foreground));
        word-break: keep-all;
        line-break: strict;
        position: relative;
        text-align: center;
        height: min-content;
        min-width: 200px;
        max-width: 400px;
        z-index: 50;
      }
      .tooltip-container {
        position: relative;
        transform: translate(-50%, -50%);
        transform-origin: 50% 50%;
      }
      .tooltip-arrow {
        position: relative;
        z-index: 51;
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid hsl(var(--input));
      }
      .tooltip-wrapper {
        position: relative;
      }
    `,
  ],
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('tooltipAnimation', [
      state('void, false', style({ transform: 'scale(0)' })),
      state('true', style({ transform: 'scale(1)' })),
      transition('* => true', [
        style({ opacity: 0, transform: 'translate{{ td }}({{ tv }}50%) scale(0.5)' }),
        animate('{{ ad }}ms', style({ opacity: 1, transform: 'translate{{ td }}(0) scale(1)' })),
      ]),
      transition('* => false', [
        style({ opacity: 1, transform: 'scale(1)' }),
        animate('{{ ad }}ms', style({ opacity: 0, transform: 'scale(0.95)' })),
      ]),
    ]),
  ],
})
class TooltipComponent {
  private readonly renderer: Renderer2 = inject(Renderer2);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef<HTMLElement>);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  @ViewChild('tooltipEl') tooltipEl?: ElementRef<any>;

  showLeaveAnimation: boolean = true;
  targetEl?: ElementRef<any>;
  tooltipPos: TooltipPosition = 'top';
  tooltipText: string = '';
  translateDirection: 'X' | 'Y' = 'Y';
  translateValue: '-' | '' = '';
  animationDuration: number = 150;

  ngAfterViewInit(): void {
    this.positionTooltip();
  }

  // Start exit animation before component is destroyed
  close(): void {
    this.showLeaveAnimation = false;
    this.cdr.detectChanges();
  }

  // Position tooltip component relative to targetElement
  positionTooltip(): void {
    if (!this.tooltipEl) return;

    const targetDOMRect = this.targetEl?.nativeElement.getBoundingClientRect();
    const tooltipContentEl = this.tooltipEl.nativeElement.children[0];
    const tooltipArrowEl = this.tooltipEl.nativeElement.children[1];

    let tooltipContainerX;
    let tooltipContainerY;
    let tooltipArrowX;
    let tooltipArrowY;
    let tooltipArrowRotate;

    switch (this.tooltipPos) {
      case 'top':
        tooltipContainerY = `${
          targetDOMRect.top - tooltipContentEl.offsetHeight - tooltipArrowEl.offsetHeight * 2
        }px`;
        tooltipContainerX = `${
          targetDOMRect.left + targetDOMRect.width / 2 - tooltipContentEl.offsetWidth / 2
        }px`;

        tooltipArrowY = ``;
        tooltipArrowX = `${tooltipContentEl.offsetWidth / 2 - tooltipArrowEl.offsetWidth / 2}px`;
        break;

      case 'bottom':
        tooltipContainerY = `${
          targetDOMRect.top + targetDOMRect.height + tooltipArrowEl.offsetHeight * 2
        }px`;
        tooltipContainerX = `${
          targetDOMRect.left + targetDOMRect.width / 2 - tooltipContentEl.offsetWidth / 2
        }px`;

        tooltipArrowY = `${tooltipContentEl.offsetHeight + tooltipArrowEl.offsetHeight}px`;
        tooltipArrowX = `${tooltipContentEl.offsetWidth / 2 - tooltipArrowEl.offsetWidth / 2}px`;
        tooltipArrowRotate = `180deg`;
        break;

      case 'left':
        tooltipContainerY = `${
          targetDOMRect.top - tooltipContentEl.offsetHeight / 2 + targetDOMRect.height / 2
        }px`;
        tooltipContainerX = `${
          targetDOMRect.left - tooltipContentEl.offsetWidth - tooltipArrowEl.offsetWidth
        }px`;

        tooltipArrowY = `${tooltipContentEl.offsetHeight / 2 + tooltipArrowEl.offsetWidth / 4}px`;
        tooltipArrowX = `${tooltipContentEl.offsetWidth - tooltipArrowEl.offsetWidth / 4}px`;
        tooltipArrowRotate = `270deg`;
        break;

      case 'right':
        tooltipContainerY = `${
          targetDOMRect.top - tooltipContentEl.offsetHeight / 2 + targetDOMRect.height / 2
        }px`;
        tooltipContainerX = `${
          targetDOMRect.left + targetDOMRect.width + tooltipArrowEl.offsetWidth
        }px`;

        tooltipArrowY = `${tooltipContentEl.offsetHeight / 2 + tooltipArrowEl.offsetWidth / 4}px`;
        tooltipArrowX = `-${tooltipArrowEl.offsetHeight * 1.4}px`;
        tooltipArrowRotate = `90deg`;
        break;

      default:
        return;
    }

    //* Set position of tooltip content
    this.renderer.setStyle(this.host.nativeElement, 'top', tooltipContainerY);
    this.renderer.setStyle(this.host.nativeElement, 'left', tooltipContainerX);

    //* Set position of tooltip arrow
    this.renderer.setStyle(tooltipArrowEl, 'bottom', tooltipArrowY);
    this.renderer.setStyle(tooltipArrowEl, 'left', tooltipArrowX);
    if (tooltipArrowRotate) {
      this.renderer.setStyle(tooltipArrowEl, 'rotate', tooltipArrowRotate);
    }
  }
}
