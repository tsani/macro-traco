from flask import (
    Flask, send_from_directory, render_template, url_for, request,
    redirect, flash, session, abort, jsonify, g
)

from os import environ
from contextlib import closing, contextmanager

import sqlite3
import requests

from . import config

IS_DEV = 'dev' == config.get()['FLASK_ENV']

app = Flask(__name__, static_folder=None if IS_DEV else '/static')

from . import (db, routes)

# When running in development mode, we set up a reverse proxy into the
# webpack development server.
if IS_DEV:
    def _proxy(host, path):
        """ Used to proxy a request for a resource to another server. """
        response = requests.get(f"{host}{path}")
        excluded_headers = [
            "content-encoding",
            "content-length",
            "transfer-encoding",
            "connection",
        ]
        headers = {
            name: value
            for name, value in response.raw.headers.items()
            if name.lower() not in excluded_headers
        }
        return (response.content, response.status_code, headers)

    app.logger.warn('Webpack dev server proxy enabled')

    _dev_server_host = config.get()['WEBPACK_DEV_SERVER_HOST']
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def catch_all(path):
        return _proxy(_dev_server_host, request.path)

