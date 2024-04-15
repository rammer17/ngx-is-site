import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  InputSignal,
  OutputEmitterRef,
  TemplateRef,
  inject,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PopoverDirective } from '../popover/popover.directive';
import { ButtonComponent } from '../button/button.component';
import {
  BehaviorSubject,
  Observable,
  merge,
  of,
  switchMap,
  map,
  shareReplay,
  ReplaySubject,
  tap,
  distinct,
  from,
  toArray,
  filter,
  scan,
  startWith,
  combineLatest,
} from 'rxjs';
import { InputComponent } from '../input/input.component';
import { SelectComponent } from '../select/select.component';

@Component({
  selector: 'is-data-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    PopoverDirective,
    ButtonComponent,
    InputComponent,
    SelectComponent,
  ],
  template: `
    <div class="data-table-wrapper">
      <ng-container *ngTemplateOutlet="headerTemplate() || defaultHeaderTemplate"></ng-container>
      <div class="rounded-table-border">
        <table>
          <thead>
            <tr>
              <th>
                <is-input
                  [type]="'checkbox'"
                  [(ngModel)]="selectedAllRows"
                  (onChange)="toggleSelectedRows($event)"></is-input>
              </th>
              <ng-container *ngFor="let fieldType of fields; let i = index">
                <th *ngIf="fieldType.showInTable" [ngClass]="{ sort: fieldType.showInTable }">
                  <div
                    class="sort-wrapper"
                    [ngClass]="{ 'sort-wrapper-hover': fieldType.sort }"
                    [isPopover]="showTableHeadSorting && tempSortIndex === i && fieldType.sort"
                    [appendTo]="'body'"
                    [position]="'bottom'"
                    [template]="tableHeadSortTemplate"
                    [templateContext]="i"
                    (click)="onTogglePopover('SORT', i)">
                    <span>{{ fieldType.name }}</span>
                    <fa-icon
                      *ngIf="fieldType.sort"
                      [icon]="[
                        'fas',
                        sortOrder === 'ASC' && sortIndex === i
                          ? 'sort-up'
                          : sortOrder === 'DESC' && sortIndex === i
                          ? 'sort-down'
                          : 'sort'
                      ]"></fa-icon>
                  </div>
                </th>
              </ng-container>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let row of (data$ | async)[currentPageIndex]; let i = index"
              [ngClass]="{ 'selected-row': row.selected }">
              <td>
                <is-input
                  [type]="'checkbox'"
                  (onChange)="toggleSelectedRowAction$.next(null)"
                  [(ngModel)]="row['selected']"></is-input>
              </td>
              <ng-container *ngFor="let column of fields; let colIndex = index">
                <td *ngIf="column.showInTable">
                  {{ row[column.type] }}
                </td>
              </ng-container>
              <td class="action-trigger">
                <fa-icon
                  [icon]="actionIcon"
                  (click)="onTogglePopover('ACTION', i)"
                  [isPopover]="showActions && actionIndex === i"
                  [position]="'bottom-inline-right'"
                  [appendTo]="'body'"
                  [template]="actionsTemplate"
                  [templateContext]="row"></fa-icon>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ng-container *ngTemplateOutlet="footerTemplate() || defaultFooterTemplate"></ng-container>
    </div>

    <ng-template #actionsTemplate let-row>
      <div class="default-actions-template">
        <ng-container *ngFor="let action of actions()">
          <div class="sort-options" (click)="onTriggerAction(action, row)">{{ action.name }}</div>
        </ng-container>
      </div>
    </ng-template>

    <ng-template #tableHeadSortTemplate let-index>
      <div class="default-thead-sort-template">
        <div (click)="onSortTableRows('ASC')" class="sort-options">
          <fa-icon [icon]="['fas', 'arrow-up-wide-short']"></fa-icon>
          Asc
        </div>
        <div (click)="onSortTableRows('DESC')" class="sort-options">
          <fa-icon [icon]="['fas', 'arrow-down-short-wide']"></fa-icon>
          Desc
        </div>
        <div class="divider"></div>
        <div (click)="onToggleTableField(index)" class="sort-options">
          <fa-icon [icon]="['far', 'eye-slash']"></fa-icon>
          Hide
        </div>
      </div>
    </ng-template>

    <ng-template #defaultHeaderTemplate>
      <div class="default-header-template">
        <div class="header-filters">
          <is-button
            *ngFor="let filter of filters(); let i = index"
            [isPopover]="showFilter && filterIndex === i"
            [position]="'bottom-inline-left'"
            [appendTo]="'body'"
            [template]="filterTemplate"
            [templateContext]="filter"
            (onClick)="onTogglePopover('FILTER', i, filter.type)"
            [label]="filter.name"
            [styleClass]="['outlined', 'dashed']"
            [type]="'button'"
            [icon]="'filter'">
            <div class="filter-values" *ngIf="activeFilter$ | async as activeFilters">
              <div class="vertical-divider"></div>
              <ng-container *ngFor="let activeFilter of activeFilters; let i = index">
                <div class="active-filter-container" *ngIf="activeFilter[filter.type]">
                  <span style="cursor: pointer">
                    {{ activeFilter[filter.type] }}
                  </span>
                </div>
              </ng-container>
              <ng-template #activeFiltersNumber>
                <div class="active-filter-container">
                  <span>{{ activeFilters?.length }} selected</span>
                </div>
              </ng-template>
            </div>
          </is-button>
        </div>
        <div
          class="header-view"
          [isPopover]="showToggleColumns"
          [position]="'bottom-inline-right'"
          [appendTo]="'body'"
          [template]="toggleColumnsTemplate">
          <is-button
            (onClick)="onTogglePopover('TOGGLE_COLUMN')"
            [type]="'button'"
            [styleClass]="['outlined']"
            [label]="'View'"
            [icon]="'sliders'"></is-button>
        </div>
      </div>
    </ng-template>

    <ng-template #toggleColumnsTemplate>
      <div class="toggle-columns-container">
        <div class="toggle-columns-label">Toggle columns</div>
        <div class="divider"></div>
        <div
          *ngFor="let column of fields; let i = index"
          class="table-columns"
          (click)="onToggleTableField(i)">
          <fa-icon [icon]="['far', column.showInTable ? 'circle-check' : 'circle-xmark']"></fa-icon>
          {{ column.name }}
        </div>
      </div>
    </ng-template>

    <ng-template #filterTemplate let-filter>
      <div class="filter-options-container">
        <div class="search-bar">
          <is-input
            #filterAutocompleteInput
            (onChange)="onFilterAutocomplete(filterAutocompleteInput.value)"
            [placeholder]="filter.name"
            [type]="'text'"
            [ghost]="true"
            [iconSize]="'sm'"
            [iconColor]="'hsl(var(--muted-foreground))'"
            [icon]="'search'"></is-input>
          <div class="divider"></div>
          <ng-container
            *ngIf="availableFilter$ | async as availableFilters; else noAvailableFilters">
            <ng-container *ngIf="availableFilters?.length > 1; else noAvailableFilters">
              <div *ngFor="let option of availableFilters; let i = index" class="filter-options">
                <ng-container *ngIf="option && option?.length">
                  <ng-container *ngIf="activeFilter$ | async as activeFilterObs">
                    <is-input
                      (change)="onFilterChange(option, filter.type)"
                      [type]="'checkbox'"
                      [checked]="determineIfFilterIsChecked(activeFilterObs, option)"></is-input>
                  </ng-container>
                  <fa-icon [icon]="['far', 'circle']"></fa-icon>
                  <span>{{ option }}</span>
                </ng-container>
              </div>
            </ng-container>
          </ng-container>
          <ng-template #noAvailableFilters>
            <div class="no-results">No results found.</div>
          </ng-template>
        </div>
      </div>
    </ng-template>

    <ng-template #defaultFooterTemplate>
      <div class="default-footer-template">
        <div class="selected-rows-wrapper" *ngIf="selectedData$ | async as selectedData">
          {{ selectedData.selected + ' of ' + selectedData.total }} row(s) selected.
        </div>
        <div class="data-table-pagination">
          <div class="pagination-rows">
            <span>Rows per page</span>
            <is-select
              [(ngModel)]="rowsPerPage"
              (ngModelChange)="onChangeRowsPerPage($event)"
              [data]="[10, 20, 30, 50]"></is-select>
          </div>
          <div class="pagination-pages">
            Page {{ currentPageIndex + 1 }} of {{ availablePages + 1 }}
          </div>
          <div class="pagination-controls">
            <fa-icon
              [icon]="['fas', 'angles-left']"
              size="xs"
              (click)="onChangePage('FIRST')"></fa-icon>
            <fa-icon
              [icon]="['fas', 'angle-left']"
              size="xs"
              (click)="onChangePage('PREV')"></fa-icon>
            <fa-icon
              [icon]="['fas', 'angle-right']"
              size="xs"
              (click)="onChangePage('NEXT')"></fa-icon>
            <fa-icon
              [icon]="['fas', 'angles-right']"
              size="xs"
              (click)="onChangePage('LAST')"></fa-icon>
          </div>
        </div>
      </div>
    </ng-template>
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
              tr {
                th.sort {
                  padding-left: 0;
                  transition-duration: 0.15s;
                  transition-property: background-color, color;
                  fa-icon {
                    margin-left: 0.25rem;
                  }
                }
                div.sort-wrapper {
                  display: flex;
                  align-items: center;
                  margin-left: 0.25rem;
                  padding: 0.5rem 1rem;
                  width: min-content;
                  transition-duration: 0.15s;
                  transition-property: background-color, color;
                  border-radius: calc(0.5rem - 2px);
                }
                div.sort-wrapper-hover:hover {
                  background-color: hsl(var(--accent));
                  color: hsl(var(--accent-foreground));
                  cursor: pointer;
                }
              }
              tr:hover {
                background-color: hsl(var(--muted) / 0.5);
              }
            }
            tbody {
              tr {
                transition-duration: 0.15s;
                transition-property: background-color;
                border-top: 1px solid hsl(var(--border));
              }
              tr:hover {
                background-color: hsl(var(--accent) / 0.8);
                color: hsl(var(--accent-foreground));
              }
              tr.selected-row {
                background-color: hsl(var(--accent));
                color: hsl(var(--accent-foreground));
              }
            }
            th {
              color: hsl(var(--muted-foreground));
              font-weight: 500;
              vertical-align: middle;
              text-align: left;
              height: 3rem;
              padding: 0.25rem 1rem;
            }
            th:has(> input[type='checkbox']) {
              padding-right: 0;
            }
            td {
              vertical-align: middle;
              padding: 1rem;
            }
            td.action-trigger {
              text-align: center;
              fa-icon {
                transition-duration: 0.15s;
                transition-property: background-color, color;
                padding: 0.25rem 0.5rem;
                border-radius: calc(0.5rem - 2px);
              }
              fa-icon:hover {
                cursor: pointer;
                background-color: hsl(var(--secondary));
              }
            }
          }
        }
      }
      div.default-thead-sort-template,
      div.default-actions-template,
      div.toggle-columns-container,
      div.filter-options-container {
        background-color: hsl(var(--background));
        border-radius: calc(0.5rem - 2px);
        border: 1px solid hsl(var(--border));
        color: hsl(var(--muted-foreground));
        padding: 0.25rem;
        font-family: '__Inter_0ec1f4', '__Inter_Fallback_0ec1f4', ui-sans-serif, system-ui,
          -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
          'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
          'Noto Color Emoji';
        user-select: none;
        margin-top: calc(0.5rem - 1px);
        div.sort-options,
        div.toggle-columns-label,
        div.table-columns {
          transition-duration: 0.15s;
          transition-property: background-color, color;
          padding: 0.5rem;
          border-radius: calc(0.5rem - 4px);
          font-size: 0.875rem;
          line-height: 1.25rem;
        }
        div.sort-options:hover,
        div.table-columns:hover {
          background-color: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
          cursor: pointer;
        }
        div.divider {
          height: 1px;
          background-color: hsl(var(--border));
          margin: 0.25rem 0;
        }
        fa-icon {
          margin-right: 0.25rem;
          width: 14px;
          height: 14px;
          color: hsl(var(--muted-foreground));
        }
        div.toggle-columns-label {
          font-weight: 600;
        }
        div.search-bar {
          input[type='checkbox'] {
            display: inline-block;
          }
          div.no-results {
            text-align: center;
            padding: 0.75rem 1rem;
          }
        }
        div.filter-options {
          display: flex;
          gap: 0.5rem;
        }
      }
      div.default-header-template {
        margin-bottom: 0.75rem;
        display: flex;
        justify-content: space-between;
        div.header-filters {
          display: flex;
          gap: 0.25rem;
          div.filter-values {
            display: inline-flex;
            justify-content: space-around;
            gap: 0.25rem;
            // align-items: center;
            div.vertical-divider {
              margin-left: 0.25rem;
              width: 1px;
              background-color: hsl(var(--border));
            }
            div.active-filter-container {
              padding: 0.125rem 0.25rem;
              border-radius: calc(0.5rem - 4px);
              background-color: hsl(var(--secondary));
            }
          }
        }
      }
      div.default-footer-template {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: hsl(var(--muted-foreground));
        font-size: 0.875rem;
        line-height: 1.25rem;
        font-weight: 500;
        div.data-table-pagination {
          margin-top: 1rem;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2.5rem;
          div.pagination-rows {
            display: flex;
            justify-content: center;
            align-items: center;
            span {
              margin-right: 0.5rem;
            }
          }
          div.pagination-controls {
            display: flex;
            justify-content: center;
            align-items: center;
            fa-icon {
              background-color: hsl(var(--background));
              display: flex;
              justify-content: center;
              align-items: center;
              height: 2rem;
              width: 2rem;
              transition-duration: 0.15s;
              transition-property: background-color, color, border-color;
              margin-left: 0.5rem;
              border: 1px solid hsl(var(--border));
              border-radius: calc(0.5rem - 2px);
              &:hover {
                cursor: pointer;
                background-color: hsl(var(--accent));
                border-color: hsl(var(--primary));
                color: hsl(var(--foreground));
              }
            }
          }
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent {
  //! Dependencies
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  //! Inputs
  headerTemplate: InputSignal<TemplateRef<any> | null> = input(null, { transform: (x) => x });
  footerTemplate: InputSignal<TemplateRef<any> | null> = input(null, { transform: (x) => x });
  data: InputSignal<any> = input.required();
  filters: InputSignal<any> = input([], {
    transform: (x: string[]) => {
      return x.map((y: string) => {
        return {
          name: y.charAt(0).toUpperCase() + y.slice(1),
          type: y,
        };
      });
    },
  });
  actions: InputSignal<any> = input(null, {
    transform: (x: string[]) => {
      return x.map((y: string) => {
        return {
          name: y.charAt(0).toUpperCase() + y.slice(1).toLocaleLowerCase(),
          type: y,
        };
      });
    },
  });
  //! Outputs
  actionTriggered: OutputEmitterRef<{ row: any; type: string }> = output();

  fields: any;
  data$?: Observable<any>;
  selectedData$?: Observable<any>;
  sortAction$: BehaviorSubject<null> = new BehaviorSubject<null>(null);
  filterAction$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  availableFilters$?: Observable<any>;
  refetchFilters$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  availableFilter$?: Observable<any>;
  activeFilterSource$: ReplaySubject<any> = new ReplaySubject<any>(1);
  activeFilter$: Observable<any> = this.activeFilterSource$.pipe(
    scan(
      (accumulator: any[], currentValue: any) => {
        return accumulator.some(
          (e) => e[Object.keys(currentValue)[0]] === Object.values(currentValue)[0]
        )
          ? [
              ...accumulator.filter(
                (x: any) =>
                  Object.keys(x).length && Object.values(x)[0] !== Object.values(currentValue)[0]
              ),
            ]
          : [...accumulator.filter((x: any) => Object.keys(x).length), currentValue];
      },
      [{}]
    ),
    tap((x) => {
      this.filterAction$.next(x);
    }),
    startWith([]),
    shareReplay(1)
  );
  toggleSelectedRows$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  toggleSelectedRowAction$: BehaviorSubject<null> = new BehaviorSubject<null>(null);
  paginate$: BehaviorSubject<number> = new BehaviorSubject<number>(10);

  rowsPerPage: number = 10;
  availablePages: number = -1;
  currentPageIndex: number = 0;
  selectedAllRows: boolean = false;
  actionIcon: IconDefinition = faEllipsis;
  sortOrder?: 'ASC' | 'DESC';
  tempSortIndex: number = -1;
  sortIndex: number = -1;
  actionIndex: number = -1;
  filterIndex: number = -1;
  showActions: boolean = false;
  showTableHeadSorting: boolean = false;
  showToggleColumns: boolean = false;
  showFilter: boolean = false;
  filterValues: Map<string, Set<any>> = new Map<string, Set<any>>();

  ngOnInit(): void {
    this.availablePages = ~~(this.data().length / this.rowsPerPage);

    // Transform field names to title case
    this.fields = Object.keys(this.data()[0]).map((x: string) => {
      return {
        name: x[0].toUpperCase() + x.slice(1),
        type: x,
        showInTable: true,
        sort: true,
      };
    });

    this.data$ = merge(
      this.sortAction$,
      this.filterAction$,
      this.toggleSelectedRows$,
      this.paginate$
    ).pipe(
      switchMap((currentActiveFiltersOrSelectedRowsOrRowsPerPage: any) => {
        if (
          this.sortIndex !== -1 &&
          typeof currentActiveFiltersOrSelectedRowsOrRowsPerPage !== 'number'
        ) {
          this.data().sort((a: any, b: any) => {
            return a[this.fields[this.sortIndex].name.toLowerCase()] <
              b[this.fields[this.sortIndex].name.toLowerCase()]
              ? this.sortOrder === 'ASC'
                ? -1
                : 1
              : this.sortOrder === 'ASC'
              ? 1
              : -1;
          });
        }

        const filteredData = currentActiveFiltersOrSelectedRowsOrRowsPerPage?.length
          ? this.filterData(this.data(), currentActiveFiltersOrSelectedRowsOrRowsPerPage)
          : this.data();

        let mappedData = filteredData;

        if (typeof currentActiveFiltersOrSelectedRowsOrRowsPerPage === 'number') {
          this.rowsPerPage = currentActiveFiltersOrSelectedRowsOrRowsPerPage;
          this.availablePages = ~~(this.data().length / this.rowsPerPage);
        }
        mappedData = this.paginateData(mappedData, this.rowsPerPage);

        if (typeof currentActiveFiltersOrSelectedRowsOrRowsPerPage === 'boolean') {
          mappedData[this.currentPageIndex] = mappedData[this.currentPageIndex].map((x: any) => {
            x['selected'] = currentActiveFiltersOrSelectedRowsOrRowsPerPage;
            return x;
          });
        }

        return of(mappedData);
      }),
      shareReplay(1)
    );

    this.selectedData$ = combineLatest([this.toggleSelectedRowAction$]).pipe(
      switchMap(() => this.data$!),
      map((x: any[]) => {
        return {
          selected: x[this.currentPageIndex]
            .map((y: any) => y['selected'])
            .filter((z: boolean) => z).length,
          total: x[this.currentPageIndex].length,
        };
      })
    );
  }

  onTriggerAction(action: { name: string; type: string }, row: any): void {
    const { selected, ...rowObjCopy } = row;
    this.actionTriggered.emit({
      row: rowObjCopy,
      type: action.type,
    });
  }

  toggleSelectedRows(selected: boolean): void {
    this.toggleSelectedRows$.next(selected);
  }

  onChangeRowsPerPage(event: any): void {
    this.paginate$.next(event);
  }

  onChangePage(navigationType: 'FIRST' | 'PREV' | 'NEXT' | 'LAST'): void {
    switch (navigationType) {
      case 'FIRST':
        this.currentPageIndex = 0;
        break;
      case 'PREV':
        this.currentPageIndex > 0 ? this.currentPageIndex-- : null;
        break;
      case 'NEXT':
        this.currentPageIndex < this.data().length / this.rowsPerPage - 1
          ? this.currentPageIndex++
          : null;
        break;
      case 'LAST':
        this.currentPageIndex = ~~(this.data().length / this.rowsPerPage);
        break;
      default:
        break;
    }
    this.selectedAllRows = false;
  }

  onTogglePopover(type: PopoverType, index?: number, filterType?: any): void {
    switch (type) {
      case 'SORT':
        // Toggle sort popover
        this.showTableHeadSorting =
          this.tempSortIndex !== index ? true : !this.showTableHeadSorting;
        this.tempSortIndex = index!;
        // Close all other popovers
        this.showActions = false;
        this.actionIndex = -1;
        this.showToggleColumns = false;
        this.showFilter = false;
        this.filterIndex = -1;
        break;
      case 'ACTION':
        // Toggle actions popover
        this.showActions = this.actionIndex !== index ? true : !this.showActions;
        this.actionIndex = index!;
        // Close all other popovers
        this.showTableHeadSorting = false;
        this.tempSortIndex = -1;
        this.showToggleColumns = false;
        this.showFilter = false;
        this.filterIndex = -1;
        break;
      case 'TOGGLE_COLUMN':
        // Toggle columns popover
        this.showToggleColumns = !this.showToggleColumns;
        // Close all other popovers
        this.showTableHeadSorting = false;
        this.tempSortIndex = -1;
        this.showActions = false;
        this.actionIndex = -1;
        this.showFilter = false;
        this.filterIndex = -1;
        break;
      case 'FILTER':
        // Toggle columns popover
        this.showFilter = this.filterIndex !== index ? true : !this.showFilter;
        this.filterIndex = index!;
        // Close all other popovers
        this.showTableHeadSorting = false;
        this.tempSortIndex = -1;
        this.showActions = false;
        this.actionIndex = -1;
        this.showToggleColumns = false;

        //Reset input value
        this.refetchFilters$.next('');

        // Get all available distinct values for filtering based on the input data
        this.availableFilter$ = combineLatest([
          this.activeFilter$,
          this.refetchFilters$.pipe(
            switchMap((filterInputValue: string) =>
              from(this.data()).pipe(
                distinct((x: any) => x[filterType]),
                filter((x: any) =>
                  this.doesValueContainFilterInputValue(x[filterType], filterInputValue)
                ),
                map((x: any) => x[filterType]),
                toArray()
              )
            )
          ),
        ]).pipe(map((x: any[]) => [...new Set(x.flat(1)).values()]));
        break;
      default:
        break;
    }
  }

  onSortTableRows(order: 'ASC' | 'DESC'): void {
    this.sortOrder = order;
    this.sortIndex = this.tempSortIndex;
    this.sortAction$.next(null);
    this.showTableHeadSorting = false;
  }

  onToggleTableField(index: number): void {
    this.showTableHeadSorting = false;
    this.tempSortIndex = -1;
    // this.showToggleColumns = false;
    this.cdr.detectChanges();
    this.fields[index].showInTable = !this.fields[index].showInTable;
    this.cdr.detectChanges();
  }

  onFilterAutocomplete(inputValue: string): void {
    this.refetchFilters$.next(inputValue);
  }

  onFilterChange(filterValue: any, filterType: string): void {
    this.activeFilterSource$.next({ [filterType]: filterValue });
  }

  determineIfFilterIsChecked(activeFiltersArr: object[], filterToCheck: any): boolean {
    return activeFiltersArr.some((e) => Object.values(e)[0] === filterToCheck);
  }

  private doesValueContainFilterInputValue(string: string, substring: string): boolean {
    //TODO FIX SEARCH FOR FILTER VALUES
    return string.toLowerCase().includes(substring.toLowerCase());
  }

  private filterData(data: any[], currentActiveFilters: any[]): any {
    let filteredData: any[] = data;

    const allActiveFilterValues = [
      ...new Set(currentActiveFilters.map((x) => Object.values(x)[0])),
    ];

    currentActiveFilters.forEach((activeFilter: any) => {
      filteredData = filteredData.filter((value: any) => {
        return allActiveFilterValues.includes(value[Object.keys(activeFilter)[0]]);
      });
    });

    return filteredData;
  }

  private paginateData(data: any[], dataPerPage: number): any[][] {
    const pages: any[][] = [];

    for (let i = 0; i < data.length; i += dataPerPage) {
      const page: any[] = data.slice(i, i + dataPerPage);
      pages.push(page);
    }

    return pages;
  }
}

export type PopoverType = 'SORT' | 'ACTION' | 'TOGGLE_COLUMN' | 'FILTER';
