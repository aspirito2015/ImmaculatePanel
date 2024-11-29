import sqlite3
import random

# SET UP CONNECTION
db_path = 'C:/Users/aspir/PythonScripts/MarvelGrid_HTML/data/ip.db'
connection_obj = sqlite3.connect(db_path)
cursor_obj = connection_obj.cursor()
difficulty_mins = {
    'hardest': 1,
    'hard': 3,
    'medium': 10,
    'easy': 20,
    'easiest': 50
}

def main():
    print("Hello, world!")
    query = """SELECT intersectionID, intersectionSize, difficulty
        FROM intersections LIMIT 1000"""
    cursor_obj.execute(query)
    result = cursor_obj.fetchall()
    print(result[0])
    for r in result:
        id = r[0]
        size = r[1]
        cur_difficulty = r[2]
        new_difficulty = calcDifficulty(size)
        # print(f"{cur_difficulty} | {new_difficulty}")
        if (cur_difficulty == new_difficulty):
            continue
        print(f"""UPDATE intersections SET difficulty = '{new_difficulty}' WHERE intersectionID = {id};""")


def calcDifficulty(size):
    difficulty = None
    for d in difficulty_mins:
        if size >= difficulty_mins[d]:
            difficulty = d
    return difficulty



main()

connection_obj.commit()

connection_obj.close()

