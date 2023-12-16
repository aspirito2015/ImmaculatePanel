import firebase_admin, requests, re, json, base64, os
from firebase_admin import credentials, firestore
from bs4 import BeautifulSoup
import warnings

# Suppress the specific warning about positional arguments
warnings.filterwarnings("ignore", category=UserWarning, message="Detected filter using positional arguments.")

# use the private key file of the service account directly
cert_path = r".\.cert\firebase-cert.json" # for local use
cred = credentials.Certificate(cert_path)
app = firebase_admin.initialize_app(cred)
db = firestore.client()
cat_pool = {}
char_pool = {}


def make_doc (collection, fields):
    # add new doc (id auto-generated) to collection
    create_time, doc_ref = collection.add(fields)
    # print auto-generated id and creation timestamp
    print(f"{doc_ref.id} is created at {create_time}")


def read_coll(collection):
    # get list of docs from coll (.stream() is more efficient than .get())
    return collection.stream()


def query_search(coll_ref, field, value):
    print(f'querying {field} == {value}')
    query_ref = coll_ref.where(field, "==", value)
    print('done querying')
    return query_ref.stream()


def get_soup(url):
    req = requests.get(url)
    return BeautifulSoup(req.text, 'html.parser')


def innerHTML(html_tag):
    text = ""
    for c in html_tag.contents:
        text+=str(c)
    return text


def get_list(url, filter):
    soup = get_soup(url)
    things = soup.find_all('a', filter)
    next_btn = soup.find('a', class_='category-page__pagination-next')
    if next_btn:
        print('going to next page')
        things += get_list(next_btn['href'], filter)
    return things


def do_list(url, filter):
    # set s to last chunk of url
    s = re.search(r'([^\/]+$)', url)[0]
    print(f'Starting {s}')
    res = get_list(url, filter)
    print(f'Grabbed {s}')
    return res


def find_seeAlso_num(expression, soup):
    pattern = re.compile(expression, re.IGNORECASE)
    results = soup.find_all('a', {'title': pattern})
    n = None
    for r in results:
        t = innerHTML(r)
        # '^(\d+)' looks for any number of digits at the beginning of the string
        num_search = re.search(r'^(\d+)', t, re.IGNORECASE)
        if (num_search):
            n = int(num_search.group(1))
            break
    return n


def check_seeAlso_num(value, min):
    b_valid = False
    if value is None:
        b_valid = True
    elif value >= min:
        b_valid = True
    return b_valid


def add_doc(coll_name, fields):
    coll_ref = db.collection(coll_name)
    make_doc(coll_ref, fields)

def get_cat_name(soup):
    name_tag = soup.find('h2', class_='pi-item pi-item-spacing pi-title pi-secondary-background')
    if name_tag is None:
        name_tag = soup.find('h1', {'id': 'firstHeading'})
        if name_tag is None:
            return ""
    name_str = re.sub('/Creator', "", name_tag.get_text())
    return name_str


def get_image(soup):
    img_tag = soup.find('img', class_='pi-image-thumbnail')
    if img_tag is None:
        parent = soup.find('div', class_='mw-parser-output')
        img_tag = parent.find('img')
    if img_tag is None:
        return ""
    return re.sub(r"\/revision.*", "", img_tag['src'])


def get_help_text(href, soup, name_str):
    help_tag = soup.find('div', {'id': 'messageBox'})
    if help_tag is None:
        href_short = re.sub(r'/wiki/', "", href)
        new_soup = get_soup(f'https://marvel.fandom.com/wiki/Category:{href_short}/Members')
        help_tag = new_soup.find('div', {'id': 'messageBox'})
        help_str = ""
        if help_tag is not None:
            help_str = re.sub(r' \(Earth-616\).$', "", help_tag.get_text())
        return help_str
    help_str = help_tag.get_text()
    expression = r'[\s\S]*'+re.escape(name_str)+'+,'
    help_str = re.sub(expression, "", help_str)
    first_sentence = re.search(r'^.*?(\w\w)\.', help_str)
    if first_sentence:
        help_str = first_sentence[0]
    return help_str


def document_exists(coll_name, cat_name):
    srch_stream = query_search(
        db.collection(coll_name),
        'name',
        cat_name
    )
    return len(list(srch_stream)) > 0


def do_cat(href, min_members=5, min_appearances=5, category_type='misc'):
    soup = get_soup(f'https://marvel.fandom.com{href}')

    j = {'href': href}
    j['name'] = get_cat_name(soup).strip()
    if document_exists('categories', j['name']):
        print(f"{j['name']} is a duplicate")
        return
    print(f"{j['name']}...")

    # Find number of members in category and number of appearances
    appearances = find_seeAlso_num(r'/Appearances$', soup)
    members = find_seeAlso_num(r'/Members$', soup)
    if not check_seeAlso_num(appearances, min_appearances):
        return
    if not check_seeAlso_num(members, min_members):
        return
    if members is None:
        m_tag = soup.find('p', {'class': 'category-page__total-number'})
        if m_tag is None:
            print(f"{j['name']} has no members tag")
            return
        members_str = m_tag.get_text()
        members = int(re.search(r'([0-9])+', members_str)[0])
        if members < min_members:
            print(f'{j['name']} has {members} out of the min {min_members}. Skipping')
            return
    
    j['image'] = get_image(soup)
    j['help-text'] = get_help_text(href, soup, j['name'])
    j['type'] = category_type

    add_doc('categories', j)


def do_category(url, filter = {'class': 'category-page__member-link'}, min_members=5, min_appearances=5, category_type='misc'):
    things = do_list(url, filter)
    for x in things:
        do_cat(x['href'], min_members=min_members, min_appearances=min_appearances, category_type=category_type)


def do_teams():
    url = "https://marvel.fandom.com/wiki/Category:Earth-616/Teams"
    pattern = re.compile(r'Earth-616\)$', re.IGNORECASE)
    filter = {'class': 'category-page__member-link', 'title': pattern}
    do_category(url, filter=filter, category_type='team')


def do_powers():
    url = "https://marvel.fandom.com/wiki/Category:Characters_by_Power"
    do_category(url, category_type='power')


def do_nations():
    url = "https://marvel.fandom.com/wiki/Category:Characters_by_Nationality"
    do_category(url, category_type='nationality')


def do_creator():
    url = "https://marvel.fandom.com/wiki/Category:Subjects_by_Creator"
    do_category(url, category_type='creator')


def do_killer():
    url = "https://marvel.fandom.com/wiki/Category:Characters_by_Killer"
    do_category(url, category_type='killer')


def do_identity():
    url = "https://marvel.fandom.com/wiki/Category:Characters_by_Identity"
    do_category(url, category_type='identity')


def do_type():
    url = "https://marvel.fandom.com/wiki/Category:Characters_by_Species,_Race_or_Type"
    do_category(url, category_type='type')


def do_features():
    url = "https://marvel.fandom.com/wiki/Category:Characters_by_Physical_Features"
    do_category(url, category_type='feature')


# Category groupings
"""
do_teams()
do_powers()
do_nations()
do_creator()
do_killer()
do_identity()
do_type()
do_features()

# Standalone categories
do_cat("/wiki/Category:Characters_Displaced_to_Earth-616")
do_cat("/wiki/Category:Formerly_Deceased")
"""

def get_alias(soup):
    alias_str = None
    alias_div = soup.find('div', {'data-source': 'CurrentAlias'})
    if alias_div is None:
        return ""
    alias_div = alias_div.find('div', class_='pi-data-value')
    if alias_div is None:
        return ""
    alias_str = re.sub(r'\[.*\]', "", alias_div.get_text())
    return alias_str


def get_cats(soup):
    cat_list = soup.find_all('li', class_ = 'category normal')
    coll_cat = db.collection("categories")
    cat_arr = []
    for cat in cat_list:
        cat_name = cat.find('a').get_text()
        if cat_name in cat_pool:
            cat_arr.append(cat_pool[cat_name])
            continue
        
        cat_srch_stream = query_search(coll_cat, 'name', cat_name)
        if cat_srch_stream:
            for doc in cat_srch_stream:
                cat_arr.append(db.collection('categories').document(doc.id))
                cat_pool[cat_name, doc.id]
        else:
            print(f'could not find {cat_name}')
    return cat_arr


def get_char_name(soup):
    name_tag = soup.find('h1', {'id': 'firstHeading'})
    if name_tag is None:
        return ""
    name_str = re.sub(r'\s\(Earth.*\)', "", name_tag.get_text())
    return name_str


def do_char(href):
    url = f'https://marvel.fandom.com{href}'
    soup = get_soup(url)
    #appearances = find_seeAlso_num(r'/Appearances$', soup)
    j = {'href': href}
    j['name'] = get_char_name(soup).strip()
    if j['name'] in char_pool:
        print(f'{j['name']} is a duplicate')
        return
    appearances = find_seeAlso_num(r'/Appearances$', soup)
    if appearances is None:
        print(f'{j['name']} has less than 1 appearance. Skipping')
        return
    print(f'{j['name']}...')
    j['image'] = get_image(soup)
    j['alias'] = get_alias(soup)
    j['cat_arr'] = get_cats(soup)
    add_doc('characters', j)
    char_pool.append(j['name'])
    print(f'finished {j['name']}')


def do_chars():
    print('Starting do_chars()')
    filter = {'class': 'category-page__member-link'}
    url = "https://marvel.fandom.com/wiki/Category:Earth-616/Characters"
    char_hrefs = do_list(url, filter)
    for char_href in char_hrefs:
        do_char(char_href['href'])
    print('finished chars')


def fill_pool_dict(coll_name, pool_dict):
    print('filling dict pool')
    docs = read_coll(db.collection(coll_name))
    for doc in docs:
        doc_name = doc.get('name')
        pool_dict[doc_name] = doc.id
    print('filled dict pool')


def fill_pool_arr(coll_name, pool_arr):
    print('filling arr pool')
    docs = read_coll(db.collection(coll_name))
    for doc in docs:
        pool_arr.append(doc.get('name'))
    print('filled arr pool')



fill_pool_dict('categories', cat_pool)
fill_pool_dict('characters', char_pool)
do_chars()
