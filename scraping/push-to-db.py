import firebase_admin, re, json, os, csv
from firebase_admin import credentials, firestore

writes_tally = 0
writes_limit = 4000
CATS_PATH = './scrape-results/cats-scrape-20231210.json'
CHAR_PATH = './scrape-results/char-scrape-20231215-101836.json'
DONE_PATH = './scraping/done-list.csv'

def get_db():
    cert_path = r".\.cert\firebase-cert.json"
    cred = credentials.Certificate(cert_path)
    app = firebase_admin.initialize_app(cred)   # looks unused, but is needed
    return firestore.client()

def make_doc(coll_ref, fields):
    global writes_limit, writes_tally
    create_time, doc_ref = coll_ref.add(fields)
    writes_tally += 1
    print(f'{fields['name']} (id: {doc_ref.id}) is created at {create_time}')
    print(f'{writes_tally}/{writes_limit} writes done')
    return doc_ref.id


def read_json(file_path):
    if not os.path.exists(file_path):
        return None
    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    return data

def read_csv_to_dict(file_path):
    if not os.path.exists(file_path):
        return None
    data = []
    with open(file_path, 'r', newline='', encoding='utf-8', errors='replace') as file:
        reader = csv.reader(file)
        data = dict(reader)
    return data

def load_done_list(file_path):
    done_arr = []
    try:
        with open(file_path, 'r', newline='', encoding='utf-8') as file:
            reader = csv.reader(file)
            next(reader, None)
            for row in reader:
                done_arr.append(row)
    except FileNotFoundError:
        print(f'File {file_path} not found. Returning an empty list')
    except Exception as e:
        print(f'Error loading done list: {e}')
    return done_arr

def save_done_list(done_list, file_path):
    try:
        with open(file_path, 'w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerows(done_list)
        print(f'Done list saved to {file_path}.')
    except Exception as e:
        print(f'Error saving done list: {e}')


# give data like:   data = ['David', 28, 'San Francisco']
def append_csv(file_path, data):
    with open(file_path, 'a', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(data)


def process_categories(collection_ref, categories_json, done_dict):
    for itm_name, itm_data in categories_json.items():
        # stop if at limit
        if writes_tally >= writes_limit:
            break
        # if itm_name is in done_csv, skip
        if itm_name in done_dict:
            #print(f'{itm_name} is in done list. Skipping.')
            continue
        # make document
        doc_id = ''
        itm_data.pop('collection')
        doc_id = make_doc(collection_ref, itm_data)
        # append to done csv
        done_data = [itm_name, doc_id]
        append_csv(DONE_PATH, done_data, 'cat')


def process_characters(collection_ref, characters_json, done_dict, db):
    for itm_name, itm_data in characters_json.items():
        # stop if at limit
        if writes_tally >= writes_limit:
            break
        # if itm_name is in done_csv, skip
        if itm_name in done_dict:
            #print(f'{itm_name} is in done list. Skipping.')
            continue
        # get category doc references
        good_cats = []
        bad_cats = []
        cat_refs = []
        for cat in itm_data['cat_arr']:
            cat_name = re.sub(r' \(Earth-616\).$', "", cat)
            cat_name = re.sub('/Creator', "", cat_name)
            if cat_name not in done_dict:
                bad_cats.append(cat_name)
                continue
            good_cats.append(cat_name)
            doc_ref = db.collection('categories').document(done_dict[cat_name])
            cat_refs.append(doc_ref)
        itm_data['cat_arr'] = cat_refs
        #print(f'Bad cats: {bad_cats}\nGood cats: {good_cats}\nCat refs: {cat_refs}\n')
        # make document
        doc_id = ''
        itm_data.pop('collection')   
        doc_id = make_doc(collection_ref, itm_data)
        # append to done csv
        done_data = [itm_name, doc_id, 'char', itm_data['alias']]
        append_csv(DONE_PATH, done_data)


def update_done_dict(done_dict, cats_json, char_json):
    rows = []
    for name, id in done_dict.items():
        data = [name, id]
        print(data)
        if name in cats_json:
            data += ['cat']
        elif name in char_json:
            alias = char_json[name].get('alias')
            data += ['char', alias]
        print(data)
        rows.append(data)
    with open(DONE_PATH, 'w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerows(rows)


def main():
    db = get_db()
    cats_coll_ref = db.collection('categories')
    char_coll_ref = db.collection('characters')
    
    cats_json = read_json(CATS_PATH)
    char_json = read_json(CHAR_PATH)
    done_dict = read_csv_to_dict(DONE_PATH)
    process_categories(cats_coll_ref, cats_json, done_dict)
    process_characters(char_coll_ref, char_json, done_dict, db)
    #update_done_dict(done_dict, cats_json, char_json)
    
    #save_done_list(done_csv, done_path)
    print('beep boop script is done')


if __name__ == '__main__':
    main()
