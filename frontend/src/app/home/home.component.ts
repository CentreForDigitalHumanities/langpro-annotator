import { Component, ChangeDetectionStrategy } from "@angular/core";

@Component({
    selector: "la-home",
    templateUrl: "./home.component.html",
    styleUrls: ["./home.component.scss"],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
})
export class HomeComponent {}
