import { bootstrapApplication, BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from "@angular/common/http";

const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    importProvidersFrom(
      CommonModule,
      BrowserModule,
      FormsModule,
      ReactiveFormsModule
    ),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
  ],
};

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
