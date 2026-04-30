from dataclasses import dataclass


@dataclass
class KnowledgeBase:
    id: str
    entity1: str
    entity2: str
    relationship: str
