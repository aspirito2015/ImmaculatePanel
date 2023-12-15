import re, scrapinglib, warnings, time, json
from datetime import datetime

# Suppress the specific warning about positional arguments
warnings.filterwarnings("ignore", category=UserWarning, message="Detected filter using positional arguments.")

cat_pool = {}
char_pool = {}
todo_pool = {}


def scrape_alias(soup):
    alias_str = None
    alias_div = soup.find('div', {'data-source': 'CurrentAlias'})
    if alias_div is None:
        return ""
    alias_div = alias_div.find('div', class_='pi-data-value')
    if alias_div is None:
        return ""
    alias_str = re.sub(r'\[.*\]', "", alias_div.get_text())
    return alias_str


def scrape_cats(soup):
    cat_list = soup.find_all('li', class_ = 'category normal')
    cat_arr = []
    for cat in cat_list:
        cat_name = cat.find('a').get_text()
        cat_arr.append(cat_name)
    return cat_arr


def scrape_char_name(soup):
    name_tag = soup.find('h1', {'id': 'firstHeading'})
    if name_tag is None:
        return ""
    name_str = re.sub(r'\s\(Earth.*\)', "", name_tag.get_text())
    return name_str


def do_char(href):
    url = f'https://marvel.fandom.com{href}'
    soup = scrapinglib.get_soup(url)
    j = {'href': href}
    j['name'] = scrape_char_name(soup).strip()
    if j['name'] in char_pool:
        print(f'{j['name']} is a duplicate')
        return
    appearances = scrapinglib.find_seeAlso_num(r'/Appearances$', soup)
    if appearances is None:
        print(f'{j['name']} has less than 1 appearance. Skipping')
        return
    print(f'{j['name']}...')
    j['image'] = scrapinglib.scrape_image(soup)
    j['alias'] = scrape_alias(soup)
    j['cat_arr'] = scrape_cats(soup)
    scrapinglib.add_doc('characters', j, todo_pool)
    char_pool[j['name']] = j
    print(f'finished {j['name']}')


def main():
    cat_pool = json.load(open('./cats-scrape-20231210.json'))
    startTime = datetime.now()
    print(f'{startTime}\tStarting do_char()')
    filter = {'class': 'category-page__member-link'}
    url = "https://marvel.fandom.com/wiki/Category:Earth-616/Characters"
    char_hrefs = scrapinglib.scrape_cat(url, filter)
    for char_href in char_hrefs:
        do_char(char_href['href'])
    time_str = time.strftime("%Y%m%d-%H%M%S")
    scrapinglib.save_list(todo_pool, f'char-scrape-{time_str}')
    endTime = datetime.now()
    duration = endTime - startTime
    print(f'{endTime}\tFinished chars in {duration}!')


if __name__ == '__main__':
    main()
