from flask import g

from . import app, config

import sqlite3
from contextlib import contextmanager, closing

@app.teardown_appcontext
def close_connection(exc):
    """Closes any database connection opened in this request."""
    db = getattr(g, '_database', None)
    if db is not None:
        db.commit()
        db.close()

def get_db():
    """Opens a connection to the database for this request."""
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(config.get()['DATABASE_PATH'])
    return db

@contextmanager
def cursor():
    db = get_db()
    with closing(db.cursor()) as cursor:
          yield cursor

def with_cursor(wrapped):
    """Decorates a function so it allocates a database connection and
    opens a cursor. The cursor and connection are automatically
    cleaned up when control leaves the function."""
    def wrapper(*args, **kwargs):
        db = get_db()
        with closing(db.cursor()) as cursor:
            return wrapped(cursor, *args, **kwargs)
    wrapper.__name__ = wrapped.__name__
    return wrapper

@contextmanager
def transaction():
    with get_db():
        yield

def with_transaction(wrapped):
    """Decorates a function so it performs a transaction."""
    def wrapper(*args, **kwargs):
        with transaction():
            return wrapped(*args, **kwargs)
    wrapper.__name = wrapped.__name__
    return wrapper
