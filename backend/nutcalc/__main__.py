from .model import *
from .interpret import register_food, food

### BASIC DEFINITIONS ###

ONE_CUP = Quantity(count=1, unit=UnitName('cup'))

register_food(
    CompoundFood.from_reference_quantity(
        name='flour',
        units=ALL_WEIGHTS + [Unit(name=UnitName('cup'), gram_equivalent=125)],
        constituents=[
            QuantifiedFood(Quantity(count=12.9, unit=G.name), PROTEIN),
            QuantifiedFood(Quantity(count=1.2, unit=G.name), FAT),
            QuantifiedFood(Quantity(count=95.4, unit=G.name), CARBS),
        ],
        reference=ONE_CUP,
    ),
)

ONE_TBSP = Quantity(count=1, unit=UnitName('tbsp'))

register_food(
    CompoundFood.from_reference_quantity(
        name='butter',
        units=ALL_WEIGHTS + [Unit(name=UnitName('tbsp'), gram_equivalent=14.2)],
        constituents=[
            QuantifiedFood(quantity=Quantity(count=81, unit=G.name), food=FAT),
            QuantifiedFood(quantity=Quantity(count=0.9, unit=G.name), food=PROTEIN),
            QuantifiedFood(quantity=Quantity(count=0.1, unit=G.name), food=CARBS),
        ],
        reference=Quantity(count=100, unit=G.name),
    ),
)

ONE_WHOLE = Quantity(count=1, unit='whole')

register_food(
    CompoundFood.from_constituent_sum(
        name='jake loaf',
        units=ALL_WEIGHTS,
        constituents=[
            QuantifiedFood(Quantity(count=80, unit=G.name), food('butter')),
            QuantifiedFood(Quantity(count=600, unit=G.name), food('flour')),
        ],
        quantity=ONE_WHOLE * 2,
    ),
)

### REAL MAIN ###

from . import repl

repl.start()
