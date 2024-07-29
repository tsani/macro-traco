from flask import (
    Flask, send_from_directory, render_template, url_for, request,
    redirect, flash, session, abort, jsonify, g
)

from functools import reduce
from datetime import datetime, timedelta
import json
import sys

from .types import FoodNutFact
from . import app, db

### ROUTES ####################################################################

@app.route('/nutrition-facts')
def macros():
    """Calculates the nutrition facts for a given quantity of an edible.

    GET params:
        - type: 'food' or 'recipe'
        - id: the id of the type of edible
        - seq_num: the identifier for the edible weight
        - amount: the amount of such units
    """
    edible = {
        'id': int(request.args.get('id')),
        'type': request.args.get('type'),
    }
    weight = {
        'seq_num': int(request.args.get('seq_num')),
        'amount': float(request.args.get('amount')),
    }
    return jsonify(
        calculate_edible_nutrients_and_weight(
            edible,
            weight,
        )[0].to_dict()
    )

@app.route('/nutrients')
def nutrients():
    name = request.args.get('search')
    if name is None:
        return (
            'missing required parameter `search`',
            400,
        )

    with db.cursor() as cursor:
        cursor.execute(
            'SELECT id, units, name FROM nutrient WHERE name LIKE ?',
            ('%' + name + '%',),
        )
        results = [
            { "id": row[0], "unit": row[1], "name": row[2] }
            for row
            in cursor
        ]

    return jsonify(results)

@app.route('/search', methods=['GET'])
def search():
    search_for = request.args.get('for')
    if search_for is None:
        return jsonify({'message': 'missing query string parameter "for"'}), 400

    results = list_foods_recipes(
        search_for.split(' '),
        restrict_to=request.args.get('restrict_to')
    )

    return jsonify({ 'results': results })

@app.route('/recipes', methods=['POST'])
def recipes():
    """Creates a new recipe."""
    recipe = request.json
    if recipe is None:
        return 'invalid POST body', 400
    add_recipe(recipe)
    return jsonify({})

@app.route('/food', methods=['POST'])
@db.with_cursor
def food(cursor):
    """Creates a new food."""
    body = request.json
    assert body is not None

    food = body['food']
    ref_amount = int(body['amount'])
    nutrient_multiplier = 100 / ref_amount
    if len(food['name']) == 0:
        return jsonify({'message': 'food name must be nonempty'}), 400

    cursor.execute('BEGIN')
    cursor.execute(
        'INSERT INTO food '
        '( food_group_id, long_desc, nitrogen_factor, '
        'protein_factor, fat_factor, calorie_factor, refuse ) '
        'VALUES '
        # 2200 is the food group id for meals
        '( 2200, ?, 0, 0, 0, 0, 0)',
        (food['name'],)
    )
    food_id = cursor.lastrowid
    for nutrient in food['nutrients']:
        scaled_amount = float(nutrient['amount']) * nutrient_multiplier
        nut_id = nutrient['id']
        cursor.execute(
            'INSERT INTO nutrition '
            '( food_id, nutrient_id, amount, num_data_points, source_code ) '
            'VALUES ( ?, ?, ?, 0, \'\' ) ',
            ( food_id, nut_id, scaled_amount, ),
        )
    for seq_num, unit in enumerate(body['units']):
        cursor.execute(
            'INSERT INTO weight '
            '( food_id, sequence_num, amount, description, gm_weight ) '
            'VALUES ( ?, ?, ?, ?, ? )',
            ( food_id, seq_num + 1, 1, unit['name'], unit['gramEquivalent'] ),
        )

    cursor.execute('COMMIT')

    return jsonify({ 'id': food_id })

@app.route('/food/<food_id>/weights')
def weights(food_id):
    return jsonify(get_weights(int(food_id)))

@app.route('/history', methods=['GET'])
def history():
    consumer = request.args['consumer']
    strptime = lambda s: datetime.fromisoformat(s.replace('Z', '+00:00'))
    date_start = strptime(request.args['start'])
    date_end = strptime(request.args['end'])

    return jsonify(list(
        json.loads(x)
        for x in
        consumed_history(consumer, date_start, date_end)
    ))

@app.route('/eat', methods=['GET', 'POST'])
def eat():
    if request.method == 'POST':
        return eat_post()
    else:
        assert request.method == 'GET'
        consumer = request.args['consumer']
        strptime = lambda s: datetime.fromisoformat(s.replace('Z', '+00:00'))
        date_start = strptime(request.args['start'])
        date_end = strptime(request.args['end'])
        return jsonify(sum_day_macro(consumer, date_start, date_end).to_dict())

### ROUTE IMPLEMENTATIONS #####################################################

# adds nutrients to someone's daily tally
@db.with_cursor
def add_macro_traco(c, consumer, python_nutrients):
    """Adds a FoodNutFact to a consumer's eaten foods for today."""
    query = "INSERT INTO macro_traco (consumer, nutrients_json) VALUES (?, ?)"
    params = (consumer, json.dumps(python_nutrients.nut_fact))
    app.logger.info('SQL query: %s with %s', query, str(params))
    c.execute(query, params)

def consumed_history(consumer, date_start, date_end):
    """Generates a sequence of JSON-encoded strings representing what the given
    consumer consumed between the given time points."""
    result = []
    with db.cursor() as c:
        query = """SELECT nutrients_json FROM macro_traco
            WHERE timestamp BETWEEN (?) AND (?) AND consumer=(?)"""
        params = (date_start, date_end, consumer)
        app.logger.info('SQL query %s with %s', query, str(params))
        c.execute(query, params)

        for row in c:
            data = row[0]
            yield data

# this function will sum all the nutrients recorded on a certain day
# paramaters: consumer, year, month, day
def sum_day_macro(consumer, date_start, date_end):
    """Calculates the total macros consumed by the given consumer between the
    given time points."""
    return reduce(
        lambda x, y: x + y, (
            FoodNutFact(json.loads(x))
            for x in
            consumed_history(consumer, date_start, date_end)
        ),
        FoodNutFact(),
    )

@db.with_cursor
def get_weights(c, food_id):
    """Gets all available known weights for the given food."""
    c.execute("""
        SELECT sequence_num, gm_weight, description
        FROM weight
        WHERE food_id = (?)""",
        (food_id,),
    )
    return {
        'weights': [
            { 'name': row[2], 'seq_num': row[0], 'grams': row[1] }
            for row
            in c
        ],
    }

def calculate_food_nutrients_and_weight(food_id, seq_num, factor):
    """Calculates the nutrients in a given quantity of a food.

    This allows requests like "what are the nutrients in 2 cups of milk?"

    :food_id: The identifier for the food in the database.
    :seq_num: The identifier of the weight unit to calculate with.
    :factor: The count of such weight units to calculate for.
    """
    # e.g. calculate_nutrients(5000, 4, 2) might be specifying that we want to
    # calculate the nutrients for 2 units (of id 4) of food 5000
    # That might mean "two cups of milk".

    scaled_gm_w = seq_weight_in_g(food_id, seq_num)

    # Next, look up the nutrient values for the food.
    # Nutrient values are stored per 100g, so to get the nutrient
    # value for the consumed amount, divide the stored nutrient value
    # by 100 (to get nutrient value/g) and then multiply by the
    # consumed food weight to get the consumed nutrient value.
    # The consumed food weight is the weight of one unit in grams multiplied by
    # `factor`, the number of such units consumed.

    with db.cursor() as cursor:
        cursor.execute("""
        SELECT name, units, (amount/100 * (?))
        FROM nutrition JOIN nutrient JOIN common_nutrient
        ON nutrition.food_id = ?
        AND nutrition.nutrient_id = nutrient.id
        AND nutrient.id = common_nutrient.id
        """, (scaled_gm_w * factor, food_id))

        return (
            FoodNutFact({ row[0]: (row[2], row[1]) for row in cursor }),
            scaled_gm_w * factor,
        )

def seq_weight_in_g(food_id, seq_num):
    """Gets the weight in grams of one unit of weight specified by `seq_num`
    of the food specified by `food_id`."""

    # 0 is the identifier for grams; the weight in grams of 1 gram is simply 1
    if seq_num == 0:
        return 1
    elif seq_num < 0:
        raise RuntimeError('Weight seq_num must be nonnegative.')

    with db.cursor() as c:
        c.execute("""
        SELECT gm_weight/amount
        FROM weight
        WHERE food_id = (?) AND sequence_num = (?)""", (food_id, seq_num))

        for row in c:
            return row[0]

@db.with_cursor
def calculate_recipe_nutrients_and_weight(cursor, recipe_id, seq_num, factor):
    """Calculates the total nutrients of a given amount of a recipe.
    The amount of the recipe is specified as a seq_num (identifying a unit of
    measure) together with `factor`, a count of how many such units.
    """
    cursor.execute("""
    SELECT food_id, amount, seq_num, display_unit
    FROM ingredient
    WHERE recipe_id = (?)""", (recipe_id,))

    total_recipe_nut_fact = FoodNutFact({})
    total_recipe_weight = 0

    for row in cursor:
        ingredient_nut_fact, ingredient_weight = \
            calculate_food_nutrients_and_weight(
                row[0], row[2], row[1])
        app.logger.debug(
            '[calculate_recipe_nutrients_and_weight] '
            f'{ingredient_nut_fact.to_dict()} @ {ingredient_weight}',
        )
        if ingredient_nut_fact is None:
            return None # invalid food was given

        total_recipe_weight += ingredient_weight
        total_recipe_nut_fact += ingredient_nut_fact

    cursor.execute("""
    SELECT child_id, seq_num, amount
    FROM `meta_recipe`
    WHERE parent_id = (?)""", (recipe_id,))

    for row in cursor:
        nut_fact, ingredient_weight = \
            calculate_recipe_nutrients_and_weight(row[0], row[1], row[2])
        total_recipe_nut_fact += nut_fact
        total_recipe_weight += ingredient_weight

    if seq_num == 0: # recipe weight (factor) is in grams
        ratio = factor / total_recipe_weight
        return total_recipe_nut_fact * ratio, factor
    elif seq_num == -1: # recipe weight is a fraction of its total weight
        return total_recipe_nut_fact * factor, factor * total_recipe_weight
    else:
        raise RuntimeError('recipe seq_num can only be 0 or -1')

# inserts a new json recipe into the DB, including ingredients
@db.with_transaction
@db.with_cursor
def add_recipe(c, recipe):
    recipe_name = recipe["name"]

    c.execute("BEGIN")
    query = "INSERT INTO recipe (name) VALUES (?)"
    params = (recipe_name,)
    app.logger.info(
        "SQL query: %s with %s",
        query,
        str(params),
    )
    c.execute(query, params)
    recipe_id = c.lastrowid

    for ingredient in recipe["ingredients"]:
        if not ingredient['edible']: continue
        if ingredient['edible']['type'] == 'food':
            query = """INSERT INTO ingredient
                (recipe_id, food_id, amount, seq_num, display_unit)
                VALUES (?, ?, ?, ?, ?)
            """
            params = (recipe_id,
                ingredient['edible']["id"],
                ingredient['weight']["amount"],
                ingredient['weight']["seq_num"],
                '',
            )
        elif ingredient['edible']['type'] == 'recipe':
            query = """INSERT INTO meta_recipe
            (parent_id, child_id, amount, seq_num, display_unit)
            VALUES (?, ?, ?, ?, ?)"""
            params = (recipe_id,
                ingredient['edible']['id'],
                ingredient['weight']['amount'],
                ingredient['weight']['seq_num'],
                '',
            )
        else:
            raise RuntimeError('edible type must be `recipe` or `food`')

        app.logger.info(
            "SQL query: %s with %s",
            query,
            str((recipe_name,)),
        )
        c.execute(query, params)

    c.execute('COMMIT')

def calculate_edible_nutrients_and_weight(edible, weight):
    """Calculates nutrients for a given quantity of an edible (either
    a recipe or a food). Also computes the given weight of the edible in grams.
    Returns a tuple of a FoodNutFact and an integer.
    """
    f = None
    if(edible['type'] == 'food'):
        f = calculate_food_nutrients_and_weight
    else:
        assert edible['type'] == 'recipe'
        f = calculate_recipe_nutrients_and_weight

    return f(
        edible['id'],
        weight['seq_num'],
        weight['amount']
    )

def eat_post():
    # keys: edible, weight, consumer (string)
    # edible keys: type ('food' or 'recipe'), id
    # weight keys: seq_num, amount
    eaten = request.json
    assert eaten is not None

    app.logger.info(
        '/eat: %s ate %s in the amount of %s',
        eaten['consumer'],
        str(eaten['edible']),
        str(eaten['weight']),
    )

    nut, _weight = calculate_edible_nutrients_and_weight(
        eaten['edible'],
        eaten['weight']
    )
    if nut is None:
        return jsonify({'message': 'invalid edible'}), 400

    for consumer in eaten['consumer'].lower().split(' '):
        add_macro_traco(consumer, nut)
    return jsonify({})

def list_foods_recipes(search_terms, restrict_to=None):
    """Accepts a list of words that must appear in the long
    description of the generated results.
    Returns list of { id: number, type: 'food' | 'recipe', name: string }.
    """
    if restrict_to is None:
        restrict_to = ['food', 'recipe']
    else:
        restrict_to = [restrict_to]

    condition_usda = []
    condition_recipe = []
    for word in search_terms:
        word = word.lower()
        if not all('a' <= c <= 'z' for c in word):
            raise RuntimeError('search terms must be letters')
        condition_usda.append("long_desc LIKE '%" + word + "%'")
        condition_recipe.append("name LIKE '%" + word + "%'")
    condition_usda = " AND ".join(condition_usda)
    condition_recipe = " AND ".join(condition_recipe)

    results = []
    with db.cursor() as c:
        if 'recipe' in restrict_to:
            query = 'SELECT id, name FROM recipe WHERE ' \
                + condition_recipe \
                + ' ORDER BY id DESC LIMIT 100'
            app.logger.debug('SQL query: %s', query)
            c.execute(query)
            results.extend(
                {"id": row[0], "type": "recipe", "name":row[1]} for row in c
            )
        if 'food' in restrict_to:
            query = 'SELECT id, long_desc FROM food WHERE ' \
                + condition_usda \
                + ' ORDER BY id DESC LIMIT 100'
            c.execute(query)
            app.logger.debug('SQL query: %s', query)
            results.extend(
                {"id": row[0], "type": "food", "name":row[1]} for row in c
            )
    return results

