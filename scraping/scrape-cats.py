import warnings, re, json, time, scrapinglib, logging, sys
from datetime import datetime
from pprint import pprint


# Suppress the specific warning about positional arguments
message = "Detected filter using positional arguments."
warnings.filterwarnings("ignore", category=UserWarning, message=message)

todo_pool = {}
time_str = time.strftime("%Y%m%d-%H%M%S")
log_file_path = f'./logs/{time_str}_categories.log'
logging.basicConfig(
    filename=log_file_path, 
    level=logging.INFO, 
    format='%(asctime)s - %(message)s')

# Create a console handler and set the level to INFO
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)

# Create a formatter and add it to the handler
formatter = logging.Formatter('%(asctime)s - %(message)s')
console_handler.setFormatter(formatter)

# Add the console handler to the root logger
logging.getLogger().addHandler(console_handler)

# Redirect print statements to the log file
def print_to_log(*args, **kwargs):
    log_message = ' '.join(map(str, args))
    logging.info(log_message)
    # Print to the console using the original print function
    original_print(*args, **kwargs)

# Save the original print function
original_print = print

# Redirecting print to the log file and the console
print = print_to_log


def check_seeAlso_num(value, min):
    b_valid = False
    if value is None:
        b_valid = True
    elif value >= min:
        b_valid = True
    return b_valid



def scrape_cat_name(soup):
    name_tag = soup.find('h1', {'id': 'firstHeading'})
    if name_tag is None:
        c = 'pi-item pi-item-spacing pi-title pi-secondary-background'
        name_tag = soup.find('h2', class_ = c)
        if name_tag is None:
            return ""
    name_str = re.sub('/Creator', "", name_tag.get_text())
    name_str = re.sub(r' \(Earth-616\)', "", name_str)
    return name_str


def scrape_help_text(href, soup, name_str):
    help_tag = soup.find('div', {'id': 'messageBox'})
    if help_tag is None:
        href_short = re.sub(r'/wiki/', "", href)
        url = f'https://marvel.fandom.com/wiki/Category:{href_short}/Members'
        new_soup = scrapinglib.get_soup(url)
        help_tag = new_soup.find('div', {'id': 'messageBox'})
        help_str = ""
        if help_tag is not None:
            help_str = re.sub(r' \(Earth-616\).$', "", help_tag.get_text())
        return help_str
    help_str = help_tag.get_text()
    """
    expression = r'[\s\S]*'+re.escape(name_str)+'+,'
    help_str = re.sub(expression, "", help_str)
    first_sentence = re.search(r'^.*?(\w\w)\.', help_str)
    if not first_sentence:
        return ""
    first_sentence_2 = first_sentence = re.search(r'^.*?(\)\.)', first_sentence[0])
    if first_sentence_2:
        help_str = first_sentence_2[0]
    elif first_sentence:
        help_str = first_sentence[0]
    """
    if help_tag is not None:
        help_str = re.sub(r' \(Earth-616\).*$', "", help_tag.get_text())
    return help_str


def do_cat(href, min_members=5, min_appearances=5, category_type='misc'):
    soup = scrapinglib.get_soup(f'https://marvel.fandom.com{href}')

    j = {'href': href}
    j['name'] = scrape_cat_name(soup).strip()
    print(f"{j['name']}...")

    # Find number of members in category and number of appearances
    appearances = scrapinglib.find_seeAlso_num(r'/Appearances$', soup)
    members = scrapinglib.find_seeAlso_num(r'/Members$', soup)
    if not check_seeAlso_num(appearances, min_appearances):
        print(f"... has {appearances} appearances out of min {min_appearances}")
        return
    if not check_seeAlso_num(members, min_members):
        print(f"... has {members} members out of min {min_members}")
        return
    if members is None:
        m_tag = soup.find('p', {'class': 'category-page__total-number'})
        if m_tag is None:
            print("... has no members tag")
            return
        members_str = m_tag.get_text()
        members = int(re.search(r'([0-9])+', members_str)[0])
        if members < min_members:
            print(f'... has {members} out of min {min_members}')
            return
    
    j['image'] = scrapinglib.scrape_image(soup)
    j['help-text'] = scrape_help_text(href, soup, j['name'])
    j['type'] = category_type
    scrapinglib.add_doc('categories', j, todo_pool)

def do_categories(href_short, filter=None, cat_type=None):
    if filter is None:
        filter = {'class': 'category-page__member-link'}
    if cat_type is None:
        cat_type = 'misc'
    url = f'https://marvel.fandom.com/wiki/Category:{href_short}'
    things = scrapinglib.scrape_cat(url, filter)
    for thing in things:
        do_cat(thing['href'], category_type=cat_type)


def get_subcats(href):
    url = f'https://marvel.fandom.com{href}'
    filter = {'class': 'category-page__member-link', 'href': re.compile(r'/wiki/Category:')}
    subcat_tags = scrapinglib.scrape_cat(url, filter)
    subcat_names = []
    done_cats = []
    for tag in subcat_tags:
        name = tag.get_text()
        name = name.replace('Category:', '')
        pprint(name)
        pprint(done_cats)
        if name in done_cats:
            continue
        subcat_names.append(name)
        done_cats.append(name)
        #subcat_names.extend(get_subcats(tag['href']))
    return subcat_names


def iterate_through_todo_list(json_data):
    # for each category in the json...
    for cat in json_data:
        # ...create an object for the category
        # we already have name, href, and image fields in cats_todo_YYYYMMDD.json
        # so we only need to get help-text and our list of subcategories
        if 'href' in cat:
            done_cats = []
            soup = scrapinglib.get_soup(f'https://marvel.fandom.com{cat["href"]}')
            cat['help-text'] = scrape_help_text(cat["href"], soup, cat["name"])
            # get any subcategories
            cat['sub-cats'] = get_subcats(cat["href"])


def main():
    startTime = datetime.now()
    print(f'{startTime}\tStarted!')
    file_path = 'scraping/todo/cats_todo_20240106.json'
    # open todo_list.json scraping\todo\cats_todo_20240106.json
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
            iterate_through_todo_list(data)
    except FileNotFoundError:
        print(f"File not found: {file_path}")
    except json.JSONDecodeError:
        print(f"Error decoding JSON in file: {file_path}")
    
    #scrapinglib.save_list(todo_pool, f'cats-scrape-{time_str}')
    print('Done!')

if __name__ == '__main__':
    main()
    logging.shutdown()
