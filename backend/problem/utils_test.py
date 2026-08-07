from problem.utils import prepare_kb_for_parser


def test_single_item_equal():
    result = prepare_kb_for_parser(
        [{"entity1": "cat", "entity2": "feline", "relationship": "equal"}]
    )
    assert result == ["isa_wn(cat, feline)"]


def test_single_item_not_equal():
    result = prepare_kb_for_parser(
        [{"entity1": "hot", "entity2": "cold", "relationship": "not_equal"}]
    )
    assert result == ["ant_wn(hot, cold)"]


def test_single_item_subset():
    result = prepare_kb_for_parser(
        [{"entity1": "cat", "entity2": "animal", "relationship": "subset"}]
    )
    assert result == ["subset(cat, animal)"]


def test_single_item_superset():
    result = prepare_kb_for_parser(
        [{"entity1": "animal", "entity2": "cat", "relationship": "superset"}]
    )
    assert result == ["superset(animal, cat)"]


def test_multiple_items():
    items = [
        {"entity1": "cat", "entity2": "feline", "relationship": "equal"},
        {"entity1": "hot", "entity2": "cold", "relationship": "not_equal"},
    ]
    assert prepare_kb_for_parser(items) == ["isa_wn(cat, feline)", "ant_wn(hot, cold)"]


def test_empty_list():
    assert prepare_kb_for_parser([]) == []


def test_unknown_relationship_is_skipped():
    items = [
        {"entity1": "cat", "entity2": "feline", "relationship": "unknown"},
        {"entity1": "hot", "entity2": "cold", "relationship": "not_equal"},
    ]
    result = prepare_kb_for_parser(items)
    assert result == ["ant_wn(hot, cold)"]


def test_all_unknown_relationships_returns_empty():
    items = [{"entity1": "a", "entity2": "b", "relationship": "bogus"}]
    assert prepare_kb_for_parser(items) == []


def test_entity_with_spaces():
    result = prepare_kb_for_parser(
        [
            {
                "entity1": "domestic cat",
                "entity2": "wild animal",
                "relationship": "subset",
            }
        ]
    )
    assert result == ["subset(domestic cat, wild animal)"]
