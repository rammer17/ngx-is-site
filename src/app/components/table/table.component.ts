import {
  ChangeDetectionStrategy,
  Component,
  InputSignal,
  TemplateRef,
  ViewEncapsulation,
  input,
} from '@angular/core';
import { PopoverDirective } from '../popover/popover.directive';
import { InputComponent } from '../input/input.component';
import { AsyncPipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'is-table',
  standalone: true,
  imports: [
    PopoverDirective,
    InputComponent,
    NgClass,
    FontAwesomeModule,
    NgFor,
    NgIf,
    AsyncPipe,
    NgTemplateOutlet,
  ],
  template: `
    <div class="data-table-wrapper">
      <div class="rounded-table-border">
        <table>
          <thead>
            <tr>
              <ng-container *ngTemplateOutlet="tableHeaderTemplate() || defaultTableHeaderTemplate">
              </ng-container>
              <ng-template #defaultTableHeaderTemplate>
                <ng-container *ngFor="let fieldType of fields">
                  <th>
                    <div class="sort-wrapper">
                      <span>{{ fieldType.name }}</span>
                    </div>
                  </th>
                </ng-container>
              </ng-template>
            </tr>
          </thead>
          <tbody>
            <ng-container
              *ngTemplateOutlet="
                tableBodyTemplate() || defaultTableBodyTemplate;
                context: { $implicit: data() }
              ">
            </ng-container>
            <ng-template #defaultTableBodyTemplate>
              <tr *ngFor="let row of data()">
                <ng-container *ngFor="let column of fields">
                  <td>
                    {{ row[column.type] }}
                  </td>
                </ng-container>
              </tr>
            </ng-template>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
      div.data-table-wrapper {
        div.rounded-table-border {
          border: 1px solid hsl(var(--border));
          border-radius: calc(0.5rem - 2px);
          overflow: hidden;
          table {
            font-size: 0.875rem;
            line-height: 1.25rem;
            text-indent: 0;
            border-collapse: collapse;
            background-color: hsl(var(--background));
            color: hsl(var(--foreground));
            user-select: none;
            thead {
              tr:hover {
                background-color: hsl(var(--muted) / 0.5);
              }
              th {
                padding: 0rem 1rem;
                font-size: 1.125em;
              }
            }
            tbody {
              tr {
                transition-duration: 0.15s;
                transition-property: background-color;
                border-top: 1px solid hsl(var(--border));
              }
              tr:hover {
                background-color: hsl(var(--muted) / 0.5);
              }
            }
            th {
              color: hsl(var(--muted-foreground));
              font-weight: 500;
              vertical-align: middle;
              text-align: left;
              height: 3rem;
            }
            td {
              vertical-align: middle;
              padding: 1rem;
            }
          }
        }
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
  data: InputSignal<any[]> = input.required();
  fields: { name: string; type: string }[] = [];
  tableHeaderTemplate: InputSignal<TemplateRef<any> | undefined> = input();
  tableBodyTemplate: InputSignal<TemplateRef<any> | undefined> = input();

  ngOnInit(): void {
    this.initFields();
  }

  private initFields(): void {
    this.fields = Object.keys(this.data()[0]).map((x: string) => {
      return {
        name: x[0].toUpperCase() + x.slice(1),
        type: x,
      };
    });
  }
}
