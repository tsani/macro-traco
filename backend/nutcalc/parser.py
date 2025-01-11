from .syntax import *

from parsy import generate, string, regex, alt, seq, char_from, digit

space = string(' ')

lexeme = lambda p: p << space.many()
point = string('.')
digits = digit.at_least(1).concat()

number = (digits + (point + digits).optional(default='.')) \
    .map(lambda parts: ''.join(parts)) \
    .map(float)
number = lexeme(number).desc('number')

operator = lambda c: lexeme(string(c))

add_op = operator("+").map(lambda _: lambda y: lambda x: x + y).desc('plus')
mul_op = operator("*").map(lambda _: lambda y: lambda x: x * y).desc('times')
div_op = operator("/").map(lambda _: lambda y: lambda x: x / y).desc('slash')

@generate('arithmetic expression')
def arith():
    first = yield term
    fns = yield seq(add_op, term).map(lambda l: l[0](l[1])).many()
    for f in fns:
        first = f(first)
    return first

@generate('term')
def term():
    first = yield factor
    fns = yield seq(mul_op | div_op, factor).map(lambda l: l[0](l[1])).many()
    for f in fns:
        first = f(first)
    return first

factor = number | (operator("(") >> arith << operator(")")).desc(
    'parenthesized expression',
)

quote = {
    'single': string("'"),
    'double': string('"'),
}

@generate
def string_literal():
    pquote = lambda name: quote[name].tag(name)
    (name, _) = yield alt(pquote('single'), pquote('double'))
    body = yield (space | regex('[0-9a-zA-Z]')).until(quote[name]).concat()
    yield quote[name]
    return body

ident = alt(
    regex('[a-zA-Z][0-9a-zA-Z]*').desc('bare name'),
    string_literal.desc('quoted name'),
)
ident = lexeme(ident)

quantity = seq(arith, ident).combine(Quantity)
quantified_food = seq(quantity, ident).combine(QuantifiedFood)
expr = quantified_food.sep_by(operator('+'), min=1)

@generate
def definition_stmt():
    lhs = yield quantified_food
    yield operator('=')
    rhs = yield expr | quantity

    match rhs:
        case Quantity():
            rhs = [QuantifiedFood(rhs, lhs.food)]

    if len(rhs) == 1 and rhs[0].food == lhs.food:
        return WeightStmt(lhs, rhs[0])
    else:
        return FoodStmt(lhs, rhs)

stmt = (operator('eval') >> expr.map(EvalStmt)) | definition_stmt
