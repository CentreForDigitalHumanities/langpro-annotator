import { LabelAnnotation } from "./types";

/**
 * Make sure that the user's own labels are always last.
 */
function sortAnnotations(labelAnnotations: LabelAnnotation[]): LabelAnnotation[] {
    const userLabels = labelAnnotations.filter(annotation => annotation.attachedByCurrentUser);
    const otherLabels = labelAnnotations.filter(annotation => !annotation.attachedByCurrentUser);
    return [...otherLabels, ...userLabels];
}

/**
 * Get the tooltip text for a problem label.
 */
function getLabelTooltipText(annotation: LabelAnnotation): string {
    const label = annotation.label;
    let tooltip = label.description;
    const dateStr = formatDate(annotation.createdAt);
    const attachedUser = annotation.attachedByCurrentUser ? $localize`you` : annotation.createdBy;
    tooltip += `\n\nAttached by ${attachedUser} on ${dateStr}`;
    return tooltip;
}

/**
 *  Calculate the sum of a list of numbers.
 */
function sum(list: number[]) {
    return list.reduce((sum: number, h: number) => sum + h, 0);
}

/**
 * Format a date string into a human-readable format.
 * Uses en-GB locale for consistent formatting across environments.
 */
function formatDate(date: string | null | undefined): string {
    if (!date) {
        return '';
    }
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
        return '';
    }
    return Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }).format(dateObj);
}

export { sum, formatDate, sortAnnotations, getLabelTooltipText };
