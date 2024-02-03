import json, os, re

def remove_duplicate_items(_api_data, _key):
    print("Initial items in list: {}".format(len(_api_data)))
    unique_elements = []
    cleaned_data = []
    keys = []
    for i, j in enumerate(_api_data):
        if _api_data[i][_key] not in unique_elements:
            unique_elements.append(_api_data[i][_key])
            keys.append(i)

    for key in keys:
        cleaned_data.append(_api_data[key])

    print(
        "Total duplicates removed: {}, Total items: {}, Final items:{}".format(
            (len(_api_data) - len(unique_elements)),
            len(_api_data), len(unique_elements)))
    print("Final items in list: {}".format(len(cleaned_data)))

    return cleaned_data


def fix_images(data):
    for d in data:
        url = re.sub(r"\/revision.*", "", d["img"])
        d["img"] = url
    return data

f = open('char_ALL.json')
data = json.load(f)


""" Fix img urls
new_data = fix_images(data)

with open('char_ALL_new.json', 'w', encoding='utf-8') as f:
    json.dump(new_data, f, indent=4)
"""

""" REMOVE DUPES
unique_data = remove_duplicate_items(data, "name")

with open('char_ALL_new.json', 'w', encoding='utf-8') as f:
    json.dump(unique_data, f, indent=4)
"""