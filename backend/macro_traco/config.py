from os import environ

_VARS = [
    'DATABASE_PATH',
    'FLASK_ENV',
    'WEBPACK_DEV_SERVER_HOST',
]

def _load_env(name):
    """Loads a single configuration value from an environment variable of the
    given name. If the value is missing, raises an exception."""
    x = environ.get(name, default=None)
    if x is None:
        raise RuntimeError('Missing required configuration value: ' + name)
    return x

_config = None

def get():
    global _config
    if _config == None:
        _config = { var: _load_env(var) for var in _VARS }
    return _config
