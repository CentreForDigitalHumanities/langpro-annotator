from langpro_annotator.logger import logger

RELATIONSHIP_MAPPING = {
    "equal": "isa_wn",
    "not_equal": "ant_wn",
    # TODO: confirm these with Lasha
    "subset": "subset",
    "superset": "superset",
}


def _prepare_kb_item_for_parser(kb_item: dict) -> str:
    entity1 = kb_item.get("entity1", None)
    entity2 = kb_item.get("entity2", None)
    rel = RELATIONSHIP_MAPPING.get(kb_item["relationship"], None)

    if not rel:
        raise ValueError(f"Unknown relationship: {kb_item['relationship']}")

    if not entity1 or not entity2:
        raise ValueError(f"Missing entity in KB item: {kb_item}")

    return f"{rel}({kb_item['entity1']}, {kb_item['entity2']})"


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
        ...
    ]

    """
    prepared_kb = []

    for kb_item in kb_items:
        try:
            kb_item_string = _prepare_kb_item_for_parser(kb_item)
        except ValueError as e:
            logger.error(
                f"Error preparing KB item {kb_item}: {e}. KB item will not be included in parser input."
            )
            continue
        prepared_kb.append(kb_item_string)

    return prepared_kb
