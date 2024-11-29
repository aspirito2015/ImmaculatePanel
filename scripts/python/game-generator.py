import sqlite3
import random

# SET UP CONNECTION
db_path = 'C:/Users/aspir/PythonScripts/MarvelGrid_HTML/data/ip.db'
connection_obj = sqlite3.connect(db_path)
cursor_obj = connection_obj.cursor()

# 0. generate 9 weighted random difficulties (one per cell)
difficulty_weights = {
    'easiest': 4,
    'easy': 3,
    'medium': 3,
    'hard':2,
    'hardest':1
    }
difficulty_lists = {}
difficulty_arr = random.choices(
    list(difficulty_weights.keys()), 
    list(difficulty_weights.values()),
    k=9)
intersection_arr = []
attempts = 0

def printGrid():
    s = ""
    for x in range(0, len(intersection_arr)):
        if x == 3 or x == 6:
            s += "\n"
        if intersection_arr[x] == None:
            s += "None"
        else:
            s += f"({intersection_arr[x][0]}, {intersection_arr[x][1]}, {intersection_arr[x][2]})\t"
    print(s)

def generateGrid():
    used_intersections = []
    intersection_arr.clear()
    global attempts
    attempts = attempts + 1
    print(f"attempt #{attempts}")
    for i in range(0, 9):
        used_string = "("
        used_string += ', '.join(str(x) for x in used_intersections)
        used_string += ")"
        statement = f"""SELECT intersectionID, catID_1, catID_2
            FROM intersections
            WHERE difficulty = '{difficulty_arr[0]}'
            AND intersectionID NOT IN {used_string}
            """
        if i % 3 != 0:
            statement += f" AND catID_1 = {intersection_arr[i-1][1]}"
        if i >= 3:
            statement += f" AND catID_2 = {intersection_arr[i-3][2]}"
        # print(statement)
        cursor_obj.execute(statement)
        output = cursor_obj.fetchall()
        if len(output) < 1:
            generateGrid()
            return
        else:
            r = random.choice(output)
            intersection_arr.append(r)
            used_intersections.append(r[0])
    # print()
    # printGrid()
    # print()
    used_catIDs = []
    for intersection in intersection_arr:
        if intersection[1] not in used_catIDs:
            used_catIDs.append(intersection[1])
        if intersection[2] not in used_catIDs:
            used_catIDs.append(intersection[2])
    # categories get generated in the wrong order, so this corrects it
    fixed_cats = [used_catIDs[1], used_catIDs[2], used_catIDs[3], used_catIDs[0], used_catIDs[4], used_catIDs[5]]
    print(fixed_cats)
    print(difficulty_arr)


generateGrid()

connection_obj.commit()

connection_obj.close()

