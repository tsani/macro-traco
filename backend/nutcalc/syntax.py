from __future__ import annotations
from dataclasses import dataclass
from typing import NewType

Row = NewType('Row', int)
Col = NewType('Col', int)

@dataclass
class SourceSpan:
    start: (Row, Col)
    end: (Row, Col)

@dataclass
class FoodStmt:
    lhs: QuantifiedFood
    weight: Quantity | None
    body: Expr

    location: SourceSpan | None = None

@dataclass
class WeightStmt:
    lhs: QuantifiedFood
    rhs: QuantifiedFood

    location: SourceSpan | None = None

@dataclass
class PrintStmt:
    body: Expr

    location: SourceSpan | None = None

# @dataclass
# class EatStmt:
#     body: Expr
#
# @dataclass
# class SleepStmt:
#     pass

Stmt = FoodStmt | WeightStmt | PrintStmt

@dataclass
class Quantity:
    count: float
    unit: str

    location: SourceSpan | None = None

@dataclass
class QuantifiedFood:
    quantity: Quantity
    food: str

    location: SourceSpan | None = None

Expr = list[QuantifiedFood]
