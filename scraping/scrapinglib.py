import requests, re, json, os
from bs4 import BeautifulSoup

def add_doc(coll_name, fields, pool):
    fields['collection'] = coll_name
    pool[fields['name']] = fields
    print(f'added {fields['name']} to {coll_name}')


def get_soup(url):
    req = requests.get(url)
    return BeautifulSoup(req.text, 'html.parser')


def innerHTML(html_tag):
    text = ""
    for c in html_tag.contents:
        text+=str(c)
    return text


def scrape_cat_page(url, filter):
    soup = get_soup(url)
    things = soup.find_all('a', filter)
    next_btn = soup.find('a', class_='category-page__pagination-next')
    if next_btn:
        print('going to next page')
        things += scrape_cat_page(next_btn['href'], filter)
    return things


def scrape_cat(url, filter):
    # set s to last chunk of url
    s = re.search(r'([^\/]+$)', url)[0]
    print(f'Starting {s}')
    res = scrape_cat_page(url, filter)
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


def scrape_image(soup):
    img_tag = soup.find('img', class_='pi-image-thumbnail')
    if img_tag is None:
        parent = soup.find('div', class_='mw-parser-output')
        img_tag = parent.find('img')
    if img_tag is None:
        return ""
    return re.sub(r"\/revision.*", "", img_tag['src'])


def save_list(jsonlist, filename):
    directory = './scrape-results/'
    if not os.path.exists(directory):
        os.makedirs(directory)
    with open(f'{directory}{filename}.json', 'w', encoding='utf-8') as f:
        json.dump(jsonlist, f, indent=4)

