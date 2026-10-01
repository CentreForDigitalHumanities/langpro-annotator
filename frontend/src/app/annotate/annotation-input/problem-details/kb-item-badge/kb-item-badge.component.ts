import { KnowledgeBaseRelationship, KnowledgeBaseItem } from '@/types';
import { Component, computed, input } from '@angular/core';

const RELATION_SYMBOL_MAP: Record<KnowledgeBaseRelationship, string> = {
    [KnowledgeBaseRelationship.EQUAL]: '≡',
    [KnowledgeBaseRelationship.SUBSET]: '⊑',
    [KnowledgeBaseRelationship.DISJOINT]: '∥',
};

const RELATION_COLOR_MAP: Record<KnowledgeBaseRelationship, string> = {
    [KnowledgeBaseRelationship.EQUAL]: 'bg-primary',
    [KnowledgeBaseRelationship.SUBSET]: 'bg-success',
    [KnowledgeBaseRelationship.DISJOINT]: 'bg-danger',
};

@Component({
    selector: 'la-kb-item-badge',
    templateUrl: './kb-item-badge.component.html',
    styleUrl: './kb-item-badge.component.scss'
})
export class KbItemBadgeComponent {
    public readonly usedKbItem = input.required<KnowledgeBaseItem>();

    public relationSymbol = computed(() => RELATION_SYMBOL_MAP[this.usedKbItem().relationship]);

    public badgeClass = computed(() => {
        const color = RELATION_COLOR_MAP[this.usedKbItem().relationship];
        return `label-pill ${color} fw-bold`;
    });
}

