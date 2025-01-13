from . import parser
from . import repl
from .interpret import Interpreter, InterpretationError

import sys

### REAL MAIN ###

interpreter = Interpreter()

try:
    for arg in sys.argv[1:]:
        with open(arg) as f:
            for stmt in parser.file(f):
                interpreter.execute(stmt)
except InterpretationError as e:
    print('error:', e)
    sys.exit(1)
else:
    repl.start(interpreter)
