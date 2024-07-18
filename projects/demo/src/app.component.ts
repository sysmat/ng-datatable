import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { DataTableModule, SortBy, SortOrder } from "ng-datatable";
import { FormsModule } from "@angular/forms";
import { DataFilterPipe } from "./data-filter.pipe";
import { inject } from "@angular/core";
import { UpperCasePipe } from "@angular/common";

type Person = {
  name: string;
  email: string;
  regDate: Date;
  city: string;
  age: number;
};

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  standalone: true,
  imports: [DataTableModule, FormsModule, DataFilterPipe, UpperCasePipe],
})
export class AppComponent implements OnInit {
  data: Person[];
  filterQuery = "";
  rowsOnPage = 10;
  sortBy: SortBy = "email";
  sortOrder: SortOrder = "asc";
  readonly #http = inject(HttpClient);

  ngOnInit(): void {
    this.#http.get<Person[]>("/data.json").subscribe((data) => {
      setTimeout(() => {
        this.data = data;
      }, 2000);
    });
  }

  toInt(num: string) {
    return +num;
  }

  cast = (a: any): Person[] => {
    return a as Person[];
  };

  sortByWordLength = (a: Person) => {
    return a.city.length;
  };

  remove(item: Person) {
    const index = this.data.indexOf(item);
    if (index > -1) {
      this.data.splice(index, 1);
    }
  }
}
