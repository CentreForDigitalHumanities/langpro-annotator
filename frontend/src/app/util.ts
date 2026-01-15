import { ProblemLabel } from "./types";

/**
 * Make sure that the user's own labels are always last.
 */
function sortLabels(labels: ProblemLabel[]): ProblemLabel[] {
    const userLabels = labels.filter(label => label.attachedInfo?.attachedByCurrentUser);
    const otherLabels = labels.filter(label => !label.attachedInfo?.attachedByCurrentUser);
    return [...otherLabels, ...userLabels];
}

/**
 * Get the tooltip text for a problem label.
 */
function getLabelTooltipText(label: ProblemLabel): string {
    let tooltip = label.description;
    if (label.attachedInfo) {
        const dateStr = formatDate(label.attachedInfo.date);
        const attachedUser = label.attachedInfo.attachedByCurrentUser ? $localize`you` : label.attachedInfo.userName;
        tooltip += `\n\nAttached by ${attachedUser} on ${dateStr}`;
    }
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
 */
function formatDate(date: string): string {
    const dateStr = new Date(date);
    return Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'long', day: 'numeric' }).format(dateStr);
}

export { sum, formatDate, sortLabels, getLabelTooltipText };
