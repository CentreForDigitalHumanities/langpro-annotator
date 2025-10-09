import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { AnnotationMenuComponent } from "./annotation-menu/annotation-menu.component";
import { NavigatorComponent } from "./navigator/navigator.component";
import { AnnotationInputComponent, ParseInput } from "./annotation-input/annotation-input.component";
import { SearchComponent } from "./search/search.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faTree } from "@fortawesome/free-solid-svg-icons";
import { ParseResponse, ParseService } from "@/services/parse.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ProblemResponse } from "@/types";
import { ProblemService } from "@/services/problem.service";
import { Tree } from "@/tree";

@Component({
    selector: "la-annotate",
    standalone: true,
    imports: [
        AnnotationMenuComponent,
        NavigatorComponent,
        AnnotationInputComponent,
        SearchComponent,
        FontAwesomeModule,
    ],
    templateUrl: "./annotate.component.html",
    styleUrl: "./annotate.component.scss",
})
export class AnnotateComponent implements OnInit {
    public faTree = faTree;
    private destroyRef = inject(DestroyRef);
    private parseService = inject(ParseService);
    private problemService = inject(ProblemService);

    public ccgTrees: Tree<string>[] = [];

    private problem: ProblemResponse | null = null;

    ngOnInit() {
        // TODO: This is wrong. It seems silly to keep a local copy of the problem,
        // and it's also not connected to the form, so any edits will not affect
        // the requests
        this.problemService.problem$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((problem) => {
                this.problem = problem;
            });
    }

    onParse(response: ParseResponse) {
        console.log("Parse response:", response);
        this.ccgTrees = response!.data.ccg_trees.map((tree: any) => new Tree(tree));
    }

    startParse() {
        let input: ParseInput = {
            premises: this.problem?.problem?.premises!,
            hypothesis: this.problem?.problem?.hypothesis!,
            kbItems: []
        };
        this.parseService.startParse(input, (r) => this.onParse(r));
    }
}
