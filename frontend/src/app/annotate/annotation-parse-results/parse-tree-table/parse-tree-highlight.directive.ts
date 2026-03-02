import { Directive, ElementRef, Renderer2, AfterViewInit, OnDestroy } from '@angular/core';

interface CellPosition {
    element: HTMLElement;
    rowIndex: number;
    colStart: number;
    colEnd: number;
}

@Directive({
    selector: '[laParseTreeHighlight]',
    standalone: true
})
export class ParseTreeHighlightDirective implements AfterViewInit, OnDestroy {
    private cellPositions: CellPosition[] = [];
    // Lists 'unlisten' functions returned by Renderer2, used to clean up event
    // listeners on destroy.
    private listeners: (() => void)[] = [];

    constructor(
        private el: ElementRef<HTMLTableElement>,
        private renderer: Renderer2
    ) { }

    ngAfterViewInit(): void {
        this.initializeCellPositions();
        this.attachEventListeners();
    }

    ngOnDestroy(): void {
        this.listeners.forEach(unsubscribe => unsubscribe());
    }

    private initializeCellPositions(): void {
        const table = this.el.nativeElement;
        const rows = table.querySelectorAll('tbody > tr');

        rows.forEach((row, rowIndex) => {
            const cells = row.querySelectorAll('td');
            let colStart = 0;

            cells.forEach(cell => {
                const colspan = parseInt(cell.getAttribute('colspan') || '1', 10);
                const colEnd = colStart + colspan - 1;

                this.cellPositions.push({
                    element: cell,
                    rowIndex,
                    colStart,
                    colEnd
                });

                colStart += colspan;
            });
        });
    }

    private attachEventListeners(): void {
        this.cellPositions.forEach(cellPos => {
            const mouseEnterListener = this.renderer.listen(
                cellPos.element,
                'mouseenter',
                () => this.onCellMouseEnter(cellPos)
            );

            const mouseLeaveListener = this.renderer.listen(
                cellPos.element,
                'mouseleave',
                () => this.onCellMouseLeave()
            );

            this.listeners.push(mouseEnterListener, mouseLeaveListener);
        });
    }

    private onCellMouseEnter(hoveredCell: CellPosition): void {
        // Clear previous highlights
        this.clearHighlights();

        // Highlight the hovered cell.
        this.renderer.addClass(hoveredCell.element, 'highlight');

        // Highlight child cells (in rows above).
        this.cellPositions.forEach(cellPos => {
            if (cellPos.rowIndex >= hoveredCell.rowIndex) {
                // Cell is on a row below or the same as the hovered cell.
                // Do not highlight.
                return;
            }
            if (cellPos.colStart >= hoveredCell.colStart && cellPos.colEnd <= hoveredCell.colEnd) {
                this.renderer.addClass(cellPos.element, 'highlight');
            }
        });
    }

    private onCellMouseLeave(): void {
        this.clearHighlights();
    }

    private clearHighlights(): void {
        this.cellPositions.forEach(cellPos => {
            this.renderer.removeClass(cellPos.element, 'highlight');
        });
    }
}
