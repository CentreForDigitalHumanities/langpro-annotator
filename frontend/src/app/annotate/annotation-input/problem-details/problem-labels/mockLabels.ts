import { ProblemLabel } from "../problem-details.component";

export const mockLabels: ProblemLabel[] = [
    {
        id: 1,
        text: "Important",
        description: "This problem is particularly important.",
        attachedInfo: {
            userName: "Xander",
            date: new Date("2023-01-01"),
            currentUser: true
        },
        removable: true
    },
    {
        id: 2,
        text: "Review Needed",
        description: "This problem needs to be reviewed by a senior annotator.",
        attachedInfo: null,
        removable: false,
    },
    {
        id: 3,
        text: "Ambiguous",
        description: "The problem statement is ambiguous and needs clarification.",
        attachedInfo: {
            userName: "Ben",
            date: new Date("2023-01-03"),
            currentUser: false
        },
        removable: false
    },
    {
        id: 4,
        text: "Well-Formed",
        description: "The problem is well-formed and clear.",
        attachedInfo: null,
        removable: false
    },
    {
        id: 5,
        text: "Challenging",
        description: "This problem is challenging and requires careful thought.",
        attachedInfo: null,
        removable: false
    }
];
