import firebase_admin, requests, re
from firebase_admin import credentials, firestore
from bs4 import BeautifulSoup
from tqdm import tqdm

# site used for firebase help: 
# https://towardsdatascience.com/essentials-for-working-with-firestore-in-python-372f859851f7

# use the private key file of the service account directly
cert_path = r".\.cert\firebase-cert.json"
cred = credentials.Certificate(cert_path)
app = firebase_admin.initialize_app(cred)
firestore_client = firestore.client()

# get reference to collection
# coll_ref = firestore_client.collection("laptops")

# THIS WORKS!
def make_doc (collection, fields):
    # add new doc (id auto-generated) to collection
    create_time, doc_ref = collection.add(fields)
    # print auto-generated id and creation timestamp
    print(f"{doc_ref.id} is created at {create_time}")


def read_coll(collection):
    # get list of docs from coll (.stream() is more efficient than .get())
    docs = collection.stream()
    for doc in docs:
        print(f'{doc.id} => {doc.to_dict()}')

"""
def query_coll(collection):
    # list of query operators found here: 
    # https://firebase.google.com/docs/firestore/query-data/queries#query_operators
    
    # simple 'get all laptops whose brand is Apple' query
    # query_ref = collection.where("brand", "==", "Apple")

    # 'in' returns docs where the given field matches ANY specified value (either/or)
    # query_ref = collection.where("brand", "in", ["HP", "Lenovo"])

    # 'array_contains' seems straightforward enough
    # query_ref = collection.where("tags", "array_contains", "Popular")

    for doc in query_ref.stream():
        print(f'{doc.id} => {doc.to_dict()}')
"""
def query_search(collection, field, value):
    query_ref = collection.where(field, "==", value)
    return query_ref.stream()


# id should be doc id like "swfMnQwhXCwAHxZEqA5Q"
# update_doc("swfMnQwhXCwAHxZEqA5Q", {"name": "Bear", "address": "Big Blue House"})
def update_doc(collection, doc_id, fields):
    doc_ref = collection.document(doc_id)
    doc_ref.update(fields)
    # nested fields are specified w/ dot notation (see below)
    # doc_ref.update({"order.quantity": 5})

    # array elements to add or remove are specified as an array itself (see below)
    # doc_ref.update({'tags': firestore.ArrayUnion(["In Stock"])})
    # doc_ref.update({'tags': firestore.ArrayRemove(["Latest"])})


# id should be doc id like "swfMnQwhXCwAHxZEqA5Q"
def delete_doc(collection, doc_id):
    doc_ref = collection.document(doc_id)
    doc_ref.delete()



# we only care about scraping two categories for our list of characters:
# - https://marvel.fandom.com/wiki/Category:Earth-616/Characters
# - https://marvel.fandom.com/wiki/Category:Characters_Displaced_to_Earth-616

# when we're in there, we want to grab/save the following
# - name
#       e.g. "Doreen Green (Earth-616)"
# - alias
#       e.g. "Squirrel Girl"
# - wiki page url (or at least the post-"wiki" segment)
#       e.g. "Doreen_Green_(Earth-616)"
# - image url (or at least the post-"imagaes" segment)
#       e.g. "3/30/Unbeatable_Squirrel_Girl_Vol_2_7_Classic_Variant_Textless.jpg"
# - list of categories as references

# category values
# https://marvel.fandom.com/wiki/Category:Earth-616/Teams
# https://marvel.fandom.com/wiki/Category:Characters_by_Power
# https://marvel.fandom.com/wiki/Category:Characters_Displaced_to_Earth-616
# https://marvel.fandom.com/wiki/Category:Characters_by_Nationality
# https://marvel.fandom.com/wiki/Category:Floating_Super-Hero_Poker_Game_participants
# https://marvel.fandom.com/wiki/Category:Characters_by_Nationality
# could use list of all categories to see which should be whitelisted, but do NOT use this as 
# but do NOT scrape this whole thing in the workflow https://tinyurl.com/hbvnfsjj 
# - name: e.g. "Avengers"
# - image
# - source
# - help-text
# number of members (don't save this. just for processing)


def get_soup(url):
    req = requests.get(url)
    return BeautifulSoup(req.text, 'html.parser')


def innerHTML(html_tag):
    text = ""
    for c in html_tag.contents:
        text+=str(c)
    return text


counter = 0
cap = 3


def get_list(url, filter, bar):
    global counter
    counter = 1 + counter
    bar.update(1)
    soup = get_soup(url)
    things = soup.find_all('a', filter)
    next_btn = soup.find('a', class_='category-page__pagination-next')
    if next_btn and counter < cap:
        #print('going to next page')
        things += get_list(next_btn['href'], filter, bar)
    return things


def do_list(url, filter):
    # set s to last chunk of url
    s = re.search(r'([^\/]+$)', url).group(0)
    print(f'Starting {s}')
    with tqdm(bar_format="on page #{n_fmt} [{elapsed}] elapsed at{rate_fmt}") as bar:
        res = get_list(url, filter, bar)
    return res


def find_seeAlso_num(expression, soup):
    pattern = re.compile(expression, re.IGNORECASE)
    results = soup.find_all('a', {'title': pattern})
    n = 0
    for r in results:
        t = innerHTML(r)
        # '^(\d+)' looks for any number of digits at the beginning of the string
        num_search = re.search(r'^(\d+)', t, re.IGNORECASE)
        if (num_search):
            n = int(num_search.group(1))
            break
    return n


def add_cat(fields):
    coll_ref = firestore_client.collection("categories")
    make_doc(coll_ref, fields)


def do_teams():
    url = "https://marvel.fandom.com/wiki/Category:Earth-616/Teams"
    # set pattern to strings ending in "Earth-616)", ignoring case
    # i.e. go for https://marvel.fandom.com/wiki/$_Cult_(Earth-616)
    #     and not https://marvel.fandom.com/wiki/Category:$_Cult_(Earth-616)/Members
    pattern = re.compile(r'Earth-616\)$', re.IGNORECASE)
    filter = {'class': 'category-page__member-link', 'title': pattern}
    # get list of teams using url & filter
    things = do_list(url, filter)[:10]
    min_members = 3
    min_appearances = 10

    a = []
    j = {}
    for x in tqdm(things):
        url = x['href']
        url_short = re.sub(r'/wiki/', "", url)
        soup = get_soup(f'https://marvel.fandom.com{url}')
        # find number of members in category and number of appearances
        # do this first so we can break if too small
        appearances = find_seeAlso_num(r'/Appearances$', soup)
        members = find_seeAlso_num(r'/Members$', soup)
        if members < min_members or appearances < min_appearances:
            continue
            
        j = { 'href': url }

        # find name str
        name_tag = soup.find('h2', class_='pi-item pi-item-spacing pi-title pi-secondary-background') # TODO: this gets the wrong tag on /wiki/198_(Earth-616)
        name_str = ""
        if name_tag is not None:
            name_str = name_tag.get_text()
        j['name'] = 'TEST_'+name_str
        
        # find category image
        img_tag = soup.find('img', class_='pi-image-thumbnail')
        img_url = ""
        if img_tag is not None:
            img_url = re.sub(r"\/revision.*", "", img_tag['src'])
        j['image'] = img_url
        
        # find category help text
        new_soup = get_soup(f'https://marvel.fandom.com/wiki/Category:{url_short}/Members')
        help_tag = new_soup.find('div', {'id': 'messageBox'})
        help_str = ""
        if help_tag is not None:
            help_str = re.sub(r' \(Earth-616\).$', "", help_tag.get_text())
        j['help-text'] = help_str
        #srch = query_search(firestore_client.collection("categories"),'name',j['name'])
        srch = firestore_client.collection('categories').where('name', '==', j['name']).get()
        if len(srch) > 0:
            print("\nduplicate")
            print(srch[0].to_dict())
            continue
        add_cat(j)
        # TODO: actually send this data to firestore
    #print(a)


def do_powers():
    print("do_powers")

do_teams()
