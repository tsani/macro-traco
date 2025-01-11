from . import syntax
from . import model

from dataclasses import dataclass

class InterpretationError(RuntimeError):
    def __init__(self, *args, **kwargs):
        super.__init__(*args, **kwargs)

@dataclass
class NoSuchFood(InterpretationError):
    name: str

    def __str__(self):
        return f'no such food {self.name}'

@dataclass
class NoSuchUnit(InterpretationError):
    unit_name: str
    food: model.Food

    def __str__(self):
        return f'{self.unit_name} is not a unit of {self.food.name}'

@dataclass
class FoodAlreadyRegistered(InterpretationError):
    food: model.Food

    def __str__(self):
        return 'food {self.food.name} already registered'

###############################################################################

FOODS : dict[model.FoodName, model.Food] = {}

def register_food(food: model.Food):
    if food.name in FOODS:
        raise FoodAlreadyRegistered(food)
    FOODS[food.name] = food

### Nutrients are the basic foods
for nutrient in model.ALL_NUTRIENTS:
    register_food(nutrient)

###############################################################################

def food(name: str) -> model.Food:
    if name not in FOODS:
        raise NoSuchFood(name)
    return FOODS[name]

def quantity(qty: syntax.Quantity, food: model.Food | None = None) -> model.Quantity:
    """Interprets a syntax quantity into a model quantity, optionally
    validating its unit against a supplied food."""
    if food is not None and qty.unit not in (u.name for u in food.units):
        raise NoSuchUnit(qty.unit, food)
    return model.Quantity(qty.count, qty.unit)

def quantified_food(syn: syntax.QuantifiedFood) -> model.QuantifiedFood:
    foodModel = food(syn.food)
    qty = quantity(syn.quantity, foodModel)
    return model.QuantifiedFood(qty, foodModel)

def is_new_food(syn: syntax.QuantifiedFood) -> bool:
    return syn.food not in FOODS

def define_unit(food: model.Food, qty: model.Quantity, w: float):
    match food:
        case model.Nutrient:
            raise InterpretationError('cannot define new units on nutrients')
    if qty.unit in (u.name for u in food.units):
        raise UnitAlreadyDefined(
            f'unit {qty.unit} already defined for food {food.name}',
        )
    gram_equivalent = w / qty.count
    food.units.append(model.Unit(qty.unit, gram_equivalent))
