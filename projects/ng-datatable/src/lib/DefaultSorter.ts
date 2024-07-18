import { Component, inject, input, OnInit } from "@angular/core";
import { DataTable, SortBy, SortEvent } from "./DataTable";

@Component({
  selector: "mfDefaultSorter",
  template: ` <a
    (click)="sort()"
    (keydown.enter)="sort()"
    (keydown.space)="sort()"
    class="text-nowrap text-decoration-none"
    tabindex="0"
  >
    <ng-content></ng-content>
    @if (isSortedByMeAsc) {
    <span aria-hidden="true" aria-label="asc">▲</span>
    } @if (isSortedByMeDesc) {
    <span aria-hidden="true" aria-label="desc">▼</span>
    }
  </a>`,
  styles: ["a { cursor: pointer; }"],
  standalone: true,
})
export class DefaultSorter implements OnInit {
  sortBy = input.required<SortBy>({ alias: "by" });

  isSortedByMeAsc = false;
  isSortedByMeDesc = false;

  readonly #mfTable = inject(DataTable);

  ngOnInit(): void {
    this.#mfTable.onSortChange.subscribe((event: SortEvent) => {
      /* eslint-disable eqeqeq */
      this.isSortedByMeAsc =
        event.sortBy == this.sortBy() && event.sortOrder === "asc";
      this.isSortedByMeDesc =
        event.sortBy == this.sortBy() && event.sortOrder === "desc";
      /* eslint-enable eqeqeq */
    });
  }

  sort() {
    if (this.isSortedByMeAsc) {
      this.#mfTable.setSort(this.sortBy(), "desc");
    } else {
      this.#mfTable.setSort(this.sortBy(), "asc");
    }
    return false;
  }
}
