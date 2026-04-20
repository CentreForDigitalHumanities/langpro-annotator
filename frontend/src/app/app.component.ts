import { Component, DestroyRef, Inject, afterRender, inject } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { MenuComponent } from "./menu/menu.component";
import { FooterComponent } from "./footer/footer.component";
import { DarkModeService } from "./services/dark-mode.service";
import { ToastContainerComponent } from "./toast-container/toast-container.component";
import { HttpClient } from "@angular/common/http";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
    selector: "la-root",
    standalone: true,
    imports: [
        RouterOutlet,
        MenuComponent,
        FooterComponent,
        ToastContainerComponent,
    ],
    templateUrl: "./app.component.html",
    styleUrl: "./app.component.scss",
})
export class AppComponent {
    title = "LangPro Annotator";
    http = inject(HttpClient);
    destroyRef = inject(DestroyRef);

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private darkModeService: DarkModeService
    ) {
        // Using the DOM API to only render on the browser instead of on the server
        afterRender(() => {
            const style = this.document.createElement("link");
            style.rel = "stylesheet";
            this.document.head.append(style);

            this.darkModeService.theme$.subscribe((theme) => {
                this.document.documentElement.setAttribute(
                    "data-bs-theme",
                    theme
                );
                style.href = `${theme}.css`;
            });
        });

        this.http.get("/api/csrf").pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe()
    }
}
