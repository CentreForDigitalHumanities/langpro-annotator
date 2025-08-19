import { Dataset, EntailmentLabel } from "@/types";

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
