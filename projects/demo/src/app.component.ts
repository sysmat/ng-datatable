import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { DataTableModule, SortBy, SortOrder } from "ng-datatable";
import { FormsModule } from "@angular/forms";
import { DataFilterPipe } from "./data-filter.pipe";
import { CommonModule } from "@angular/common";

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
  imports: [CommonModule, DataTableModule, FormsModule, DataFilterPipe],
})
export class AppComponent implements OnInit {
  public data: Person[];
  public filterQuery = "";
  public rowsOnPage = 10;
  public sortBy: SortBy = "email";
  public sortOrder: SortOrder = "asc";

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Person[]>("/data.json").subscribe((data) => {
      setTimeout(() => {
        this.data = data;
      }, 2000);
    });
  }

  public toInt(num: string) {
    return +num;
  }

  public sortByWordLength = (a: Person) => {
    return a.city.length;
  };

  public remove(item: Person) {
    const index = this.data.indexOf(item);
    if (index > -1) {
      this.data.splice(index, 1);
    }
  }
}
