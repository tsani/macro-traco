# Nutrition calculator

An offshoot idea of macro traco.
Imagine being able to express recipes and foods in a nice language.

```
1 tbsp butter = 12 g fat + 0.1 g protein + 1.6 mg sodium + 3.4 mg potassium
# defines a new food together with a volumetric unit for it using its basic nutrients

# the energy content of a food is automatically calculated from its macros

# the weight of a volumetric unit is automatically calculated by summing macros,
# but this is often an underapproximation of the true weight
# To set a weight for a volumetric unit, use the `weighs` operator.

1 tbsp butter weighs 14.2 g

# we could have equivalently defined butter like this:
100 g butter = 81 g fat + 215 mg cholesterol + 11 mg sodium + 24 mg potassium \
    + 0.1 g carbs + 0.9 g protein

# and then connected weight and volume in the same way:
1 tbsp butter weighs 14.2 g

# In this case, the `weighs` operator will define a new volumetric unit for the food.

# Plenty of basic foods can be defined in the above way.

# Then we can define compound foods, made of basic foods:
2 whole 'jake loaf' = 600 g flour + 80 g butter + 1 tsp salt

# The nutrition facts of a compound food is just the sum of the constituent foods
# and the weight is just the sum of the constituent weights.

# However, a jake loaf has a bunch of water in it that evaporates during baking.
# We can again set the weight for the food using the `weighs` operator

1 whole 'jake loaf' weighs 450 g # made up numbers

# New units for foods can be defined based on existing units
12 slice 'jake loaf' = 1 whole 'jake loaf'

# Since that's redundant, we can leave off the name of the food the second time
12 slice 'jake loaf' = 1 whole

# This is the same as saying:
1 slice 'jake loaf' weighs (450 / 12) g

# Of course you can do basic arithmetic anywhere that a number is expected.
```

# Implementation

Basic model works and can calculate correct nutrition facts of compound foods composed of further
compound foods. Tested only with macronutrients.

Next steps:
- Make all references to foods indirect (via name), going thru a central table of Food objects.
- Imperative operations: defining new foods and units by extending this table.
- Parser: according to syntax below; investigate `parsy` library
- `import` to bring in foods from the USDA database
- Rational numbers instead of floats?

## Syntax (Parser: TODO)

```
Statement stmt ::= "eval" expr | qfood "=" (expr | number weight food?)
Quantified Food qfood ::= number unit food
Expressions expr ::= qfood | expr "+" expr
Nutrient nut ::= "fat" | "protein" | "carbs" | "sodium" | "potassium" | ...
Weight weight ::= "g" | "mg" | "kg" | "oz" | "lb" | ...
Volume volume ::= "ml" | "L" | "tbsp" | "tsp" | "cup" | ...
Unit unit ::= weight | volume | ident
Food food ::= nut | ident
```

## 'actually weighs' (TODO)

This is a bit complicated.
If we construct a unit by summing the constituent weights and later decide that that was wrong,
then we use 'actually weighs' to change the weight of the constructed unit post hoc.
However, when we construct the CompoundFood, we compute a normalized portion of 100g (the reference
quantity).

Let's take 'jake loaf' as an example.

```
2 whole 'jake loaf' = 600 g flour + 80 g butter
1 whole 'jake loaf' actually weighs 450 g
```

The first line ends up defining the weight of `1 whole 'jake loaf'` as (680 / 2) g, i.e. 340 g, and
computing the normalized constituents for a `100 g` portion as (100/340) times the count of the
quantity of each constituent.

The second line wants to recalculate this. To do so, just recover the input constituent weights by
multiplying by 340/100, then renormalizing with the ratio 100/450.
