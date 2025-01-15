from . import parser
from . import repl
from . import syntax
from .interpret import Interpreter, InterpretationError

import os.path as ospath
import sys

### REAL MAIN ###

interpreter = Interpreter()

def parse_and_execute(interpreter, path):
    with open(path) as f:
        body = parser.file(f)
        imports = []
        stmts = []
        for stmt in body:
            match stmt:
                case syntax.ImportStmt():
                    imports.append(stmt)
                case _:
                    stmts.append(stmt)
        for stmt in imports:
            parse_and_execute(
                interpreter,
                ospath.join(ospath.dirname(path), stmt.path + '.nut'),
            )
        for stmt in stmts:
            interpreter.execute(stmt)

try:
    for arg in sys.argv[1:]:
        parse_and_execute(interpreter, arg)
except InterpretationError as e:
    print('error:', e)
    sys.exit(1)
else:
    repl.start(interpreter)
