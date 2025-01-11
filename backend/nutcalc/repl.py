from . import parser, interpret, model
from .syntax import WeightStmt, FoodStmt, EvalStmt

import readline
import sys
import os
import atexit

from parsy import ParseError

HISTORY_FILE_PATH = os.path.join(os.path.expanduser("~"), ".nutcalc_history")

def load_history():
    try:
        readline.read_history_file(HISTORY_FILE_PATH)
    except FileNotFoundError:
        pass

def save_history():
    readline.write_history_file(HISTORY_FILE_PATH)

def start():
    load_history()
    try:
        while True:
            user_input = input("nutcalc> ")
            if user_input.strip().lower() == "exit":
                break
            execute(user_input)
    except (EOFError, KeyboardInterrupt):
        pass
    finally:
        save_history()

def execute(line: str):
    try:
        stmt = parser.stmt.parse(line)
    except ParseError as e:
        print('error:', e)
        return

    try:
        match stmt:
            case FoodStmt():
                execute_food_stmt(stmt)
            case WeightStmt():
                execute_weight_stmt(stmt)
            case EvalStmt():
                execute_eval_stmt(stmt)
            case _:
                print('error: unhandled statement type')
    except interpret.InterpretationError as e:
        print('error:', e)
        return

def execute_eval_stmt(stmt: EvalStmt):
    qfs = [interpret.quantified_food(part) for part in stmt.body]
    print(sum(
        (qf.nutrition_facts for qf in qfs),
        start=model.NutritionFacts.empty(),
    ).pretty)

def execute_food_stmt(stmt: FoodStmt):
    if not interpret.is_new_food(stmt.lhs):
        print('error: food already exists')
        return

    lhs_qty = interpret.quantity(stmt.lhs.quantity)
    rhs = [interpret.quantified_food(part) for part in stmt.body]
    runtime.register_food(
        model.CompoundFood.from_constituent_sum(
            name=stmt.lhs.food,
            units=model.ALL_WEIGHTS,
            constituents=rhs,
            quantity=lhs_qty,
        ),
    )

    nuts = model.nutrition_facts(
        stmt.lhs.quantity,
        interpret.food(stmt.lhs.food)
    )
    print(nuts.pretty)

def execute_weight_stmt(stmt: WeightStmt):
    lhs_food = interpret.food(stmt.lhs.food)
    lhs_qty = interpret.quantity(stmt.lhs.quantity)
    interpret.define_unit(
        lhs_food,
        lhs_qty,
        interpret.quantified_food(stmt.rhs).weight,
    )

    one = model.Quantity(1, stmt.lhs.quantity.unit)
    w = one.weigh(lhs_food)
    print(f'{one} weighs {w:.2f} g')
    print(model.nutrition_facts(one, lhs_food).pretty)
