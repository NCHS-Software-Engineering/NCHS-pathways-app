import os
import json
import mysql.connector
from pathlib import Path
from dotenv import load_dotenv
DB_HOST="ec2-54-210-202-204.compute-1.amazonaws.com"
DB_USER="pathways"
DB_PASSWORD="GyAkDphsSCtE!2"
DB_NAME="pathways"
load_dotenv()

conn = mysql.connector.connect(
    host=DB_HOST,
    user=DB_USER,
    password=DB_PASSWORD,
    database=DB_NAME,
)
cursor = conn.cursor()

json_folder = Path(__file__).parent
inserted = 0
skipped = 0

for json_file in json_folder.glob("*.json"):
    course_name = json_file.stem  # filename without .json extension
    course_json = json.dumps(json.loads(json_file.read_text(encoding="utf-8")))

    try:
        cursor.execute(
            """
            INSERT INTO courses (course_name, course_json)
            VALUES (%s, %s)
            ON DUPLICATE KEY UPDATE course_json = VALUES(course_json)
            """,
            (course_name, course_json),
        )
        print(f"✓ Inserted: {course_name}")
        inserted += 1
    except Exception as e:
        print(f"✗ Skipped {course_name}: {e}")
        skipped += 1

conn.commit()
cursor.close()
conn.close()

print(f"\nDone — {inserted} inserted/updated, {skipped} skipped.")