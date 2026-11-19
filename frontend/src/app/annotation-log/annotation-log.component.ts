import { AnnotationListComponent } from '@/shared/annotation-list/annotation-list.component';
import { CombinedAnnotation } from '@/types';
import { httpResource } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
    imports: [AnnotationListComponent],
    selector: 'la-annotation-log',
    styleUrl: './annotation-log.component.scss',
    templateUrl: './annotation-log.component.html',
})
export class AnnotationLogComponent {
    public annotations = httpResource<CombinedAnnotation[]>(() => `/api/annotations/`);
}
