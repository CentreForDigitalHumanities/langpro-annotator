from langpro_annotator.logger import logger

RELATIONSHIP_MAPPING = {
    "equal": "isa_wn",
    "subset": "isa_wn",
    "disjoint": "disj",
}


def _prepare_kb_item_for_parser(kb_item: dict) -> list[str]:
    entity1 = kb_item.get("entity1", None)
    entity2 = kb_item.get("entity2", None)
    relationship = kb_item.get("relationship", None)

    if not entity1 or not entity2:
        raise ValueError(f"Missing entity in KB item: {kb_item}")

    rel_symbol = RELATIONSHIP_MAPPING.get(kb_item["relationship"], None)
    if not rel_symbol:
        raise ValueError(f"Unknown relationship: {kb_item['relationship']}")

    forward_relationship = f"{rel_symbol}({entity1}, {entity2})"
    if relationship == "equal":
        return [
            forward_relationship,
            f"{rel_symbol}({kb_item['entity2']}, {kb_item['entity1']})"
        ]

    return [forward_relationship]


def prepare_kb_for_parser(kb_items: list[dict]) -> list[str]:
    """
    Validates and converts knowledge base items (dicts) to a list of strings,
    as expected by LangPro Container.

    Expected input (cf. KnowledgeBaseAnnotation in frontend/src/app/types.ts).
    [
        {
            "id": "1",
            "entity1": "Hesperus",
            "entity2": "Phosphorus",
            "relationship": "equal"
        },
        ...
    ]

    Expected output (cf. langpro-container/LangPro_demo/server.py::prepare_kb):

    [
        "isa_wn(Hesperus, Phosphorus)",
        "isa_wn(Phosphorus, Hesperus)",
        ...
    ]

    """
    prepared_kb = []

    for kb_item in kb_items:
        try:
            kb_item_strings = _prepare_kb_item_for_parser(kb_item)
        except ValueError as e:
            logger.error(
                f"Error preparing KB item {kb_item}: {e}. KB item will not be included in parser input."
            )
            continue
        prepared_kb.extend(kb_item_strings)

    return prepared_kb
