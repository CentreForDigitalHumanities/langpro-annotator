import { ProblemLabel } from "@/types";

/**
 * Make sure that the user's own labels are always last.
 */
export default function sortLabels(labels: ProblemLabel[]): ProblemLabel[] {
    const userLabels = labels.filter(label => label.attachedInfo?.attachedByCurrentUser);
    const otherLabels = labels.filter(label => !label.attachedInfo?.attachedByCurrentUser);
    return [...otherLabels, ...userLabels];
}
