from __future__ import annotations

from parsy import string
from dataclasses import dataclass
from typing import NewType

UnitName = NewType('UnitName', str)

@dataclass
class Unit:
    """A unit represents an amount of a particular food."""
    name: UnitName
    gram_equivalent: float

# The weights are special units, in that they are independent of any food.
# This is expressed by making every food have these units as a basis, plus any
# extra units that might be defined for that food.
G = Unit(name=UnitName('g'), gram_equivalent=1)
KG = Unit(name=UnitName('kg'), gram_equivalent=1000)
MG = Unit(name=UnitName('mg'), gram_equivalent=0.001)
OZ = Unit(name=UnitName('oz'), gram_equivalent=28)
LB = Unit(name=UnitName('lb'), gram_equivalent=454)

ALL_WEIGHTS = [G, KG, MG, OZ, LB]
WEIGHTS = { w.name: w for w in ALL_WEIGHTS }

NutrientName = NewType('NutrientName', str)

@dataclass
class Nutrient:
    name: NutrientName
    energy: float
    natural_unit: UnitName

    def unit_weight(self, name: UnitName) -> float:
        if name != self.natural_unit:
            raise ValueError(
                f"Cannot retrieve weight of {self.name} in {name}; it's "
                f"natural unit is {self.natural_unit}.",
            )
        unit = WEIGHTS.get(name)
        if unit is None:
            raise ValueError(f"Nutrient natural unit must be a weight")
        return unit.gram_equivalent

    @property
    def reference_quantity(self):
        return Quantity(count=1, unit=self.natural_unit)

    @property
    def nutrition_facts(self):
        return NutritionFacts(
            data={ self.name: self.reference_quantity },
        )

PROTEIN = Nutrient(name=NutrientName('protein'), energy=4, natural_unit=G.name)
CARBS = Nutrient(name=NutrientName('carbs'), energy=4, natural_unit=G.name)
FAT = Nutrient(name=NutrientName('fat'), energy=9, natural_unit=G.name)

MACRONUTRIENTS = [PROTEIN, FAT, CARBS]
ALL_NUTRIENTS = MACRONUTRIENTS

NUTRIENTS = { nut.name: nut for nut in ALL_NUTRIENTS }

@dataclass
class CompoundFood:
    """A food consisting of several constituent foods, and possessing several
    units. The constituent amounts are for a normalized quantity of 100 g of
    this compound food."""
    units: list[Unit] # TODO use a dict keyed on names
    name: str
    constituents: list[QuantifiedFood]

    def unit_weight(self, name: UnitName) -> float:
        """Retrieves the weight in grams of the given unit for this food."""
        unit = next(
            (u for u in self.units if u.name == name),
            None,
        )
        if unit is None:
            raise ValueError(
                f'No such unit {name} for CompoundFood {self.name}',
            )
        return unit.gram_equivalent

    @property
    def reference_quantity(self):
        return Quantity(count=100, unit=G.name)

    @property
    def nutrition_facts(self):
        nut = NutritionFacts.empty()
        for constituent in self.constituents:
            nut += constituent.nutrition_facts
        return nut

    @staticmethod
    def from_reference_quantity(
        name: str,
        units: list[Unit],
        constituents: list[QuantifiedFood],
        reference: Quantity,
    ):
        """Constructs a compound food from the constituents of a given
        reference quantity, normalizing to the standard 100g reference."""
        reference_unit = next(
            (u for u in units if u.name == reference.unit),
            None,
        )
        if reference_unit is None:
            raise ValueError(
                f'Unit of reference quantity `{reference}` is not among '
                f'units `{units}` of food to construct, `{name}`',
            )
        scale_factor = 100 / (reference.count * reference_unit.gram_equivalent)
        food = CompoundFood(
            name=name,
            units=units,
            constituents=[food*scale_factor for food in constituents],
        )
        return food

    @staticmethod
    def from_constituent_sum(
        name: str,
        units: list[Unit],
        constituents: list[QuantifiedFood],
        quantity: Quantity,
    ):
        """Constructs a compound food together with a new unit for it whose
        gram equivalent is computed from the sum of the weights of the
        constituent foods."""
        total_weight = sum(c.weight for c in constituents)
        unit = Unit(
            name=UnitName(quantity.unit),
            gram_equivalent=total_weight / quantity.count,
        )
        return CompoundFood.from_reference_quantity(
            name,
            units=units + [unit],
            constituents=constituents,
            reference=quantity,
        )

Food = Nutrient | CompoundFood

@dataclass
class Quantity:
    """A quantity can only be interpreted relative to some food, into which we
    can look up the name of the unit and determine its gram equivalent.
    A quantity can be multiplied by a scalar."""
    count: float
    unit: UnitName

    @staticmethod
    def zero(unit: UnitName):
        return Quantity(count=0, unit=unit)

    def __mul__(self, k):
        match k:
            case float:
                return Quantity(count=self.count*k, unit=self.unit)
        raise ValueError(f"Quantity cannot be multiplied by {type(k)}")

    def __add__(self, other):
        """Adds two quantities, provided they have the exact same unit."""
        if self.unit != other.unit:
            raise ValueError(
                f'Quantity of {self.unit} cannot be added to quantity of '
                f'{other.unit}',
            )
        return Quantity(self.count + other.count, self.unit)

    def weigh(self, food: Food) -> float:
        """Computes the weight in grams of this quantity of the given food."""
        return self.count * food.unit_weight(self.unit)

@dataclass
class QuantifiedFood:
    """A Quantity together with a Food.
    The unit name contained in the Quantity is valid for the Food.
    For a Nutrient, that means it's the same as the Nutrient's natural unit.
    For a CompoundFood, that means it's among the units of that food.
    A QuantifiedFood can be multiplied by a scalar."""
    quantity: Quantity
    food: Food

    def __mul__(self, k):
        return QuantifiedFood(quantity=self.quantity * k, food=self.food)

    @property
    def weight(self):
        """The weight of this quantity of food, in grams."""
        return self.quantity.weigh(self.food)

    @property
    def nutrition_facts(self):
        nut = self.food.nutrition_facts
        reference_weight = self.food.reference_quantity.weigh(self.food)
        scale_factor = self.weight / reference_weight
        return nut * scale_factor

ONE_CUP = Quantity(count=1, unit='cup')

FLOUR = CompoundFood.from_reference_quantity(
    name='flour',
    units=ALL_WEIGHTS + [Unit(name=UnitName('cup'), gram_equivalent=125)],
    constituents=[
        QuantifiedFood(quantity=Quantity(count=12.9, unit=G.name), food=PROTEIN),
        QuantifiedFood(quantity=Quantity(count=1.2, unit=G.name), food=FAT),
        QuantifiedFood(quantity=Quantity(count=95.4, unit=G.name), food=CARBS),
    ],
    reference=ONE_CUP,
)

ONE_TBSP = Quantity(count=1, unit='tbsp')

BUTTER = CompoundFood.from_reference_quantity(
    name='butter',
    units=ALL_WEIGHTS + [Unit(name=UnitName('tbsp'), gram_equivalent=14.2)],
    constituents=[
        QuantifiedFood(quantity=Quantity(count=81, unit=G.name), food=FAT),
        QuantifiedFood(quantity=Quantity(count=0.9, unit=G.name), food=PROTEIN),
        QuantifiedFood(quantity=Quantity(count=0.1, unit=G.name), food=CARBS),
    ],
    reference=Quantity(count=100, unit=G.name),
)

ONE_WHOLE = Quantity(count=1, unit='whole')

JAKE_LOAF = CompoundFood.from_constituent_sum(
    name='jake loaf',
    units=ALL_WEIGHTS,
    constituents=[
        QuantifiedFood(quantity=Quantity(count=80, unit=G.name), food=BUTTER),
        QuantifiedFood(quantity=Quantity(count=600, unit=G.name), food=FLOUR),
    ],
    quantity=Quantity(count=2, unit=UnitName('whole')),
)

@dataclass
class NutritionFacts:
    data: dict[NutrientName, Quantity]

    @staticmethod
    def empty():
        return NutritionFacts(data={})

    def __add__(self, other: NutritionFacts) -> NutritionFacts:
        nut = NutritionFacts(data=dict(self.data))
        for name, qty in other.data.items():
            nut.data[name] = nut.data.get(name, Quantity.zero(qty.unit)) + qty
        return nut

    def __mul__(self, k) -> NutritionFacts:
        match k:
            case float:
                return NutritionFacts(
                    { name: qty*k for name, qty in self.data.items() },
                )
        raise ValueError(
            f'NutritionFacts cannot be multiplied by {type(k)}, only `float`.',
        )

    @property
    def energy(self):
        """The energy content in kcal of these nutrition facts."""
        raise RuntimeError('todo')

def nutrition_facts(q: Quantity, food: Food):
    return QuantifiedFood(quantity=q, food=food).nutrition_facts

print(
    nutrition_facts(
        Quantity(count=2, unit=UnitName('whole')),
        JAKE_LOAF,
    ),
)
