import {Component, OnInit} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {DataTableModule, SortBy, SortOrder} from "ng-datatable";
import { FormsModule } from "@angular/forms";
import { DataFilterPipe } from "./data-filter.pipe";
import { CommonModule } from "@angular/common";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    standalone: true,
    imports: [
        CommonModule,
        DataTableModule,
        FormsModule,
        
// TODO: `HttpClientModule` should not be imported into a component directly.
// Please refactor the code to add `provideHttpClient()` call to the provider list in the
// application bootstrap logic and remove the `HttpClientModule` import from this component.
HttpClientModule,
        DataFilterPipe
    ]
})
export class AppComponent implements OnInit {

    public data: any[];
    public filterQuery = "";
    public rowsOnPage = 10;
    public sortBy: SortBy = "email";
    public sortOrder: SortOrder = "asc";

    constructor(private http: HttpClient) {
    }

    ngOnInit(): void {
        this.http.get<any[]>("/data.json")
            .subscribe((data) => {
                setTimeout(() => {
                    this.data = data;
                }, 2000);
            });
    }

    public toInt(num: string) {
        return +num;
    }

    public sortByWordLength = (a: any) => {
        return a.city.length;
    }

    public remove(item: any) {
        const index = this.data.indexOf(item);
        if (index > -1) {
            this.data.splice(index, 1);
        }
    }

}
