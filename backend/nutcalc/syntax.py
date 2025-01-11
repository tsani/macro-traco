from __future__ import annotations
from dataclasses import dataclass

@dataclass
class FoodStmt:
    lhs: QuantifiedFood
    body: Expr

@dataclass
class WeightStmt:
    lhs: QuantifiedFood
    rhs: QuantifiedFood

@dataclass
class EvalStmt:
    body: Expr

Stmt = FoodStmt | WeightStmt | EvalStmt

@dataclass
class Quantity:
    count: float
    unit: str

@dataclass
class QuantifiedFood:
    quantity: Quantity
    food: str

Expr = list[QuantifiedFood]
