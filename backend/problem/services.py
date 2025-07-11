import xml.etree.ElementTree as ET
from typing import Literal


class SickData:
    @staticmethod
    def import_data(problem: dict) -> dict:
        """
        Import SICK-specific data from a problem dictionary.
        """
        pair_id = problem.get("pair_ID", "")
        relatedness_score = float(problem.get("relatedness_score", 0.0))

        return {
            "pair_id": pair_id,
            "relatedness_score": relatedness_score,
        }

    @staticmethod
    def serialize(extra_data: dict) -> dict:
        """
        Serialize SICK-specific data from a Problem instance.
        """
        return {
            "pairId": extra_data.get("pair_id", ""),
            "relatednessScore": extra_data.get("relatedness_score", 0.0),
        }


class FracasData:

    @staticmethod
    def _text_from_element(element: ET.Element) -> str:
        """
        Extracts stripped text from an XML element, returning an empty string if the element is None or has no text.
        """
        return element.text.strip() if element is not None and element.text else ""

    @staticmethod
    def import_data(problem: dict) -> dict:
        problem_id = problem.get("id")
        question = FracasData._text_from_element(problem.find("q"))
        answer = FracasData._text_from_element(problem.find("a"))
        note = FracasData._text_from_element(problem.find("note"))

        section = problem.get("section")
        subsection = problem.get("subsection")
        fracas_nonstandard = problem.get("fracas_nonstandard", False) == "true"

        return {
            "fracas_id": int(problem_id),
            "question": question,
            "answer": answer,
            "note": note,
            "section_name": section,
            "subsection_name": subsection,
            "fracas_non_standard": fracas_nonstandard,
        }

    @staticmethod
    def serialize(extra_data: dict) -> dict:
        """
        Serialize FraCaS-specific data from a Problem instance.
        """
        return {
            "fracasId": extra_data.get("fracas_id", 0),
            "question": extra_data.get("question", ""),
            "answer": extra_data.get("answer", ""),
            "note": extra_data.get("note", ""),
            "sectionName": extra_data.get("section_name", ""),
            "subsectionName": extra_data.get("subsection_name", ""),
            "fracasNonStandard": extra_data.get("fracas_non_standard", False),
        }


class SNLIData:
    @staticmethod
    def import_data(problem: dict, subset: Literal["dev", "train", "test"]) -> dict:
        return {
            "pair_id": problem["pairID"],
            "subset": subset,
            "label1": problem["label1"],
            "label2": problem["label2"],
            "label3": problem["label3"],
            "label4": problem["label4"],
            "label5": problem["label5"],
        }

    @staticmethod
    def serialize(extra_data: dict) -> dict:
        """
        Serialize SNLI-specific data from a Problem instance.
        """
        return {
            "pairId": extra_data.get("pair_ID", ""),
            "subset": extra_data.get("subset", ""),
            "label1": extra_data.get("label1", ""),
            "label2": extra_data.get("label2", ""),
            "label3": extra_data.get("label3", ""),
            "label4": extra_data.get("label4", ""),
            "label5": extra_data.get("label5", ""),
        }
