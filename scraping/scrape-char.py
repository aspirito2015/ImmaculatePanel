import re, scrapinglib, warnings, time, csv
from datetime import datetime

# Suppress the specific warning about positional arguments
warnings.filterwarnings("ignore", category=UserWarning, message="Detected filter using positional arguments.")

done_chars = {}
todo_pool = []

tags_to_ignore_arr = [
    r'\(.*LMD.*\)',
    r'\(.*Heroes Reborn.*\)',
    r'\(.*Onslaught Reborn.*\)',
    r'\(.*Doppelganger.*\)',
    r'\(.*Android.*\)',
    r'\(.*Age of X-Man.*\)',
    r'\(.*Legion Personality.*\)',
    r'\(.*Clone.*\)',
    r'\(.*Tsum Tsum.*\)',
    r'\(.*Counter-Earth.*\)',
    r'\(.*Impostor.*\)',
    r'\(.*A.I.vengers.*\)',
    r'\(.*Cosmic Cube Construct.*\)',
    r'\(.*Battleworld.*\)',
    r'\(.*Zombie Facsimile.*\)',
    r'\(.*Skrull.*\)',
    r'\(.*Sentinel.*\)',
    r'\(.*Duplicate.*\)'
]
tags_to_ignore = combined = "(" + ")|(".join(tags_to_ignore_arr) + ")"


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


def scrape_appearances(soup):
    app_tag = soup.find('a', {'title': re.compile(r'/Appearances')})
    if app_tag:
        appearances = app_tag.get_text()
        appearances = int(re.search(r'\d+', appearances).group(0))
    else:
        appearances = 0
    app_tag_minor = soup.find('a', {'title': re.compile(r'/Minor Appearances')})
    if app_tag_minor:
        minor_appearances = app_tag_minor.get_text()
        minor_appearances = int(re.search(r'\d+', minor_appearances).group(0))
    else:
        minor_appearances = 0
    total_appearances = appearances + minor_appearances
    return total_appearances


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
    if j['name'] in done_chars:
        print(f'{j['name']} is a duplicate')
        return
    if re.search(tags_to_ignore, j['name']):
        print(f'{j['name']} is in `tags_to_ignore`')
        return
    appearances = scrapinglib.find_seeAlso_num(r'/Appearances$', soup)
    if appearances is None:
        print(f'{j['name']} has less than 1 appearance. Skipping')
        return
    print(f'{j['name']}...')
    j['image'] = scrapinglib.scrape_image(soup)
    j['alias'] = scrape_alias(soup)
    j['cat_arr'] = scrape_cats(soup)
    j['appearances'] = scrape_appearances(soup)
    todo_pool.append(j)
    done_chars[j['name']] = j
    print(f'finished {j['name']}')


def write_to_csv(filename):
    field_names = ['href', 'name', 'image', 'alias', 'cat_arr', 'appearances'] 
    
    with open(f'{filename}.csv', 'w', encoding="utf-8") as csvfile: 
        writer = csv.DictWriter(csvfile, fieldnames = field_names) 
        writer.writeheader() 
        writer.writerows(todo_pool) 


def do_cat(url, filter = {'class': 'category-page__member-link'}):
    char_hrefs = scrapinglib.scrape_cat(url, filter)
    for char_href in char_hrefs:
        do_char(char_href['href'])


def main():
    startTime = datetime.now()
    print(f'{startTime}\tStarting do_char()')
    do_cat("https://marvel.fandom.com/wiki/Category:Earth-616/Characters")
    do_cat("https://marvel.fandom.com/wiki/Category:Characters_Displaced_to_Earth-616")
    do_char("/wiki/Nathaniel_Richards_(Iron_Lad)_(Earth-6311)")
    time_str = time.strftime("%Y%m%d-%H%M%S")
    write_to_csv(f'char-results-{time_str}')
    endTime = datetime.now()
    duration = endTime - startTime
    print(f'{endTime}\tFinished chars in {duration}!')


if __name__ == '__main__':
    main()
