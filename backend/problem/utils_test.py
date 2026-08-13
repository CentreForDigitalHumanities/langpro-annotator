from problem.utils import prepare_kb_for_parser


def test_single_item_equal():
    result = prepare_kb_for_parser(
        [{"entity1": "cat", "entity2": "kitty", "relationship": "equal"}]
    )
    assert result == ["isa_wn(cat, kitty)"]


def test_single_item_subset():
    result = prepare_kb_for_parser(
        [{"entity1": "dog", "entity2": "pooch", "relationship": "subset"}]
    )
    assert result == ["isa_wn(dog, pooch)"]


def test_multiple_items():
    items = [
        {"entity1": "cat", "entity2": "kitty", "relationship": "equal"},
        {"entity1": "elephant", "entity2": "duck", "relationship": "disjoint"},
    ]
    assert prepare_kb_for_parser(items) == [
        "isa_wn(cat, kitty)",
        "disj(elephant, duck)",
    ]


def test_empty_list():
    assert prepare_kb_for_parser([]) == []


def test_unknown_relationship_is_skipped():
    items = [
        {"entity1": "cat", "entity2": "kitty", "relationship": "unknown"},
        {"entity1": "elephant", "entity2": "duck", "relationship": "disjoint"},
    ]
    result = prepare_kb_for_parser(items)
    assert result == ["disj(elephant, duck)"]


def test_all_unknown_relationships_returns_empty():
    items = [{"entity1": "a", "entity2": "b", "relationship": "bogus"}]
    assert prepare_kb_for_parser(items) == []


def test_entity_with_spaces():
    result = prepare_kb_for_parser(
        [
            {
                "entity1": "domestic cat",
                "entity2": "house plant",
                "relationship": "disjoint",
            }
        ]
    )
    assert result == ["disj(domestic cat, house plant)"]
