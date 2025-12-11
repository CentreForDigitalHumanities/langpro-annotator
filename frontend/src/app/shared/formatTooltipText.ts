import { ProblemLabel } from "@/types";
import { formatDate } from "@/util";

export default function getTooltipText(label: ProblemLabel): string {
    let tooltip = label.description;
    if (label.attachedInfo) {
        const dateStr = formatDate(label.attachedInfo.date);
        const attachedUser = label.attachedInfo.attachedByCurrentUser ? $localize`you` : label.attachedInfo.userName;
        tooltip += `\n\nAttached by ${attachedUser} on ${dateStr}`;
    }
    return tooltip;
}
