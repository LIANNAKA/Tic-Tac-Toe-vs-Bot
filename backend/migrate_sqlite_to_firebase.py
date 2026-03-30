# migrate_sqlite_to_firebase.py
import sqlite3
import json
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
import os

# Load .env
load_dotenv()

firebase_key_str = os.environ.get("FIREBASE_KEY")
if not firebase_key_str:
    raise ValueError("FIREBASE_KEY not found in .env")

firebase_key = json.loads(firebase_key_str)
cred = credentials.Certificate(firebase_key)

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Connect to SQLite
conn = sqlite3.connect("users.db")
c = conn.cursor()
c.execute("SELECT username, password, score FROM users")
users = c.fetchall()
conn.close()

print(f"Found {len(users)} users in SQLite")

# Write to Firestore
for user in users:
    username, password, score = user
    db.collection("users").document(username).set({
        "username": username,
        "password": password,
        "score": score
    })
    print(f"Migrated {username} -> Firestore")

print("Migration completed!")