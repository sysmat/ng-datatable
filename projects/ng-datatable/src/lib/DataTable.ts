import {
  Directive,
  Input,
  EventEmitter,
  SimpleChange,
  OnChanges,
  DoCheck,
  IterableDiffers,
  IterableDiffer,
  Output,
} from "@angular/core";
import { ReplaySubject } from "rxjs";

export type SortOrder = "asc" | "desc";
export type SortByFunction = (data: any) => any;
export type SortBy = string | SortByFunction | (string | SortByFunction)[];

export interface SortEvent {
  sortBy: SortBy;
  sortOrder: string;
}

export interface PageEvent {
  activePage: number;
  rowsOnPage: number;
  dataLength: number;
}

export interface DataEvent {
  length: number;
}

@Directive({
  selector: "table[mfData]",
  exportAs: "mfDataTable",
  standalone: true,
})
export class DataTable implements OnChanges, DoCheck {
  @Input("mfData") inputData: any[] = [];

  @Input("mfSortBy") sortBy: SortBy = "";
  @Input("mfSortOrder") sortOrder: SortOrder = "asc";
  @Output("mfSortByChange") sortByChange = new EventEmitter<SortBy>();
  @Output("mfSortOrderChange") sortOrderChange = new EventEmitter<SortOrder>();

  @Input("mfRowsOnPage") rowsOnPage = 1000;
  @Input("mfActivePage") activePage = 1;

  #mustRecalculateData = false;
  #diff: IterableDiffer<any>;

  data: any[];

  onSortChange = new ReplaySubject<SortEvent>(1);
  onPageChange = new EventEmitter<PageEvent>();

  constructor(differs: IterableDiffers) {
    this.#diff = differs.find([]).create();
  }

  getSort(): SortEvent {
    return { sortBy: this.sortBy, sortOrder: this.sortOrder };
  }

  setSort(sortBy: SortBy, sortOrder: SortOrder): void {
    if (this.sortBy !== sortBy || this.sortOrder !== sortOrder) {
      this.sortBy = sortBy;
      this.sortOrder =
        ["asc", "desc"].indexOf(sortOrder) >= 0 ? sortOrder : "asc";
      this.#mustRecalculateData = true;
      this.onSortChange.next({
        sortBy: this.sortBy,
        sortOrder: this.sortOrder,
      });
      this.sortByChange.emit(this.sortBy);
      this.sortOrderChange.emit(this.sortOrder);
    }
  }

  getPage(): PageEvent {
    return {
      activePage: this.activePage,
      rowsOnPage: this.rowsOnPage,
      dataLength: this.inputData.length,
    };
  }

  setPage(activePage: number, rowsOnPage: number): void {
    if (this.rowsOnPage !== rowsOnPage || this.activePage !== activePage) {
      this.activePage =
        this.activePage !== activePage
          ? activePage
          : this.#calculateNewActivePage(this.rowsOnPage, rowsOnPage);
      this.rowsOnPage = rowsOnPage;
      this.#mustRecalculateData = true;
      this.onPageChange.emit({
        activePage: this.activePage,
        rowsOnPage: this.rowsOnPage,
        dataLength: this.inputData ? this.inputData.length : 0,
      });
    }
  }

  #calculateNewActivePage(
    previousRowsOnPage: number,
    currentRowsOnPage: number
  ): number {
    const firstRowOnPage = (this.activePage - 1) * previousRowsOnPage + 1;
    const newActivePage = Math.ceil(firstRowOnPage / currentRowsOnPage);
    return newActivePage;
  }

  #recalculatePage() {
    const lastPage = Math.ceil(this.inputData.length / this.rowsOnPage);
    this.activePage = lastPage < this.activePage ? lastPage : this.activePage;
    this.activePage = this.activePage || 1;

    this.onPageChange.emit({
      activePage: this.activePage,
      rowsOnPage: this.rowsOnPage,
      dataLength: this.inputData.length,
    });
  }

  ngOnChanges(changes: { [key: string]: SimpleChange }): any {
    if (changes["rowsOnPage"]) {
      this.rowsOnPage = changes["rowsOnPage"].previousValue;
      this.setPage(this.activePage, changes["rowsOnPage"].currentValue);
      this.#mustRecalculateData = true;
    }
    if (changes["sortBy"] || changes["sortOrder"]) {
      if (["asc", "desc"].indexOf(this.sortOrder) < 0) {
        console.warn(
          "ng-datatable: value for input mfSortOrder must be one of ['asc', 'desc'], but is:",
          this.sortOrder
        );
        this.sortOrder = "asc";
      }
      if (this.sortBy) {
        this.onSortChange.next({
          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
        });
      }
      this.#mustRecalculateData = true;
    }
    if (changes["inputData"]) {
      this.inputData = changes["inputData"].currentValue || [];
      this.#diff.diff(this.inputData); // Update diff to prevent duplicate update in ngDoCheck
      this.#recalculatePage();
      this.#mustRecalculateData = true;
    }
  }

  ngDoCheck(): any {
    const changes = this.#diff.diff(this.inputData);
    if (changes) {
      this.#recalculatePage();
      this.#mustRecalculateData = true;
    }
    if (this.#mustRecalculateData) {
      this.#fillData();
      this.#mustRecalculateData = false;
    }
  }

  #fillData(): void {
    // this.activePage = this.activePage;
    // this.rowsOnPage = this.rowsOnPage;

    const offset = (this.activePage - 1) * this.rowsOnPage;
    // let data = this.inputData;
    // const sortBy = this.sortBy;
    // if (typeof sortBy === "string" || sortBy instanceof String) {
    //     data = orderBy(data, this.caseInsensitiveIteratee(sortBy as string), [this.sortOrder]);
    // } else {
    //     data = orderBy(data, sortBy, [this.sortOrder]);
    // }
    // data = slice(data, offset, offset + this.rowsOnPage);

    this.data = [...this.inputData]
      .sort(this.#sorter(this.sortBy, this.sortOrder))
      .slice(offset, offset + this.rowsOnPage);
  }

  #caseInsensitiveIteratee(sortBy: string | SortByFunction) {
    return (row: any): any => {
      let value = row;
      if (typeof sortBy === "string" || sortBy instanceof String) {
        for (const sortByProperty of sortBy.split(".")) {
          if (value) {
            value = value[sortByProperty];
          }
        }
      } else if (typeof sortBy === "function") {
        value = sortBy(value);
      }

      if ((value && typeof value === "string") || value instanceof String) {
        return value.toLowerCase();
      }

      return value;
    };
  }

  #compare(left: any, right: any): number {
    if (left === right) {
      return 0;
    }
    if (left == null && right != null) {
      return -1;
    }
    if (right == null) {
      return 1;
    }
    return left > right ? 1 : -1;
  }

  #sorter<T>(
    sortBy: SortBy,
    sortOrder: SortOrder
  ): (left: T, right: T) => number {
    const order = sortOrder === "desc" ? -1 : 1;
    if (Array.isArray(sortBy)) {
      const iteratees = sortBy.map((entry) =>
        this.#caseInsensitiveIteratee(entry)
      );
      return (left, right) => {
        for (const iteratee of iteratees) {
          const comparison =
            this.#compare(iteratee(left), iteratee(right)) * order;
          if (comparison !== 0) {
            return comparison;
          }
        }
        return 0;
      };
    } else {
      const iteratee = this.#caseInsensitiveIteratee(sortBy);
      return (left, right) =>
        this.#compare(iteratee(left), iteratee(right)) * order;
    }
  }
}
