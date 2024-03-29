#!/usr/bin/env python

import sqlite3
import sys

if len(sys.argv) < 2:
  sys.exit('Must provide text to search for')

# hello SQL injection
condition = []
for word in sys.argv[1:]:
  word = word.lower()
  if not all('a' <= c <= 'z' for c in word):
    raise RuntimeError('search terms must be letters')
  condition.append("long_desc LIKE '%" + word + "%'")
condition = " AND ".join(condition)
print(condition)

conn = sqlite3.connect('usda.sql3')
c = conn.cursor()
c.execute('SELECT id, long_desc FROM food WHERE ' + condition)
for row in c:
  print(row[0], row[1])
