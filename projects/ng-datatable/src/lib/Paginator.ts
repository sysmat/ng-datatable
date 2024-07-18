import {
  Component,
  Input,
  SimpleChange,
  OnChanges,
  Optional,
} from "@angular/core";
import { DataTable, PageEvent } from "./DataTable";

@Component({
  selector: "mfPaginator",
  template: `<ng-content></ng-content>`,
  standalone: true,
})
export class Paginator implements OnChanges {
  @Input("mfTable") inputMfTable: DataTable;

  #mfTable: DataTable;

  activePage: number;
  rowsOnPage: number;
  dataLength = 0;
  lastPage: number;

  constructor(@Optional() private injectMfTable: DataTable) {}

  ngOnChanges(changes: { [key: string]: SimpleChange }): any {
    this.#mfTable = this.inputMfTable || this.injectMfTable;
    this.#onPageChangeSubscriber(this.#mfTable.getPage());
    this.#mfTable.onPageChange.subscribe(this.#onPageChangeSubscriber);
  }

  setPage(pageNumber: number): void {
    this.#mfTable.setPage(pageNumber, this.rowsOnPage);
  }

  setRowsOnPage(rowsOnPage: number): void {
    this.#mfTable.setPage(this.activePage, rowsOnPage);
  }

  #onPageChangeSubscriber = (event: PageEvent) => {
    this.activePage = event.activePage;
    this.rowsOnPage = event.rowsOnPage;
    this.dataLength = event.dataLength;
    this.lastPage = Math.ceil(this.dataLength / this.rowsOnPage);
  };
}
