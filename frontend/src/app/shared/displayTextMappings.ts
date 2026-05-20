import { Dataset, EntailmentLabel, ProblemStatus } from "@/types";

export const entailmentLabels: Record<EntailmentLabel, string> = {
    [EntailmentLabel.ENTAILMENT]: $localize`Entailment`,
    [EntailmentLabel.CONTRADICTION]: $localize`Contradiction`,
    [EntailmentLabel.NEUTRAL]: $localize`Neutral`,
    [EntailmentLabel.UNKNOWN]: $localize`Unknown`,
};

export const datasetLabels: Record<Dataset, string> = {
    [Dataset.SICK]: "SICK",
    [Dataset.FRACAS]: "FraCaS",
    [Dataset.SNLI]: "SNLI",
    [Dataset.USER]: "User",
};

export const statusLabels: Record<ProblemStatus, string> = {
    [ProblemStatus.GOLD]: $localize`Gold`,
    [ProblemStatus.SILVER]: $localize`Silver`,
    [ProblemStatus.BRONZE]: $localize`Bronze`,
};
