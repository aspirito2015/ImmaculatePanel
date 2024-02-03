import warnings, re, json, time, scrapinglib, logging
import pandas as pd
from datetime import datetime
from pprint import pprint


# Suppress the specific warning about positional arguments
message = "Detected filter using positional arguments."
warnings.filterwarnings("ignore", category=UserWarning, message=message)
d = {}

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

def scrape_all_members(url):
    member_tags = scrapinglib.scrape_cat(url, {'class': 'category-page__member-link'})
    count = 0
    for tag in member_tags:
        name = tag.contents[0]
        is_616 = bool(re.search(r'\(Earth-616\)', name))
        if is_616:
            count += 1
    return count


def do_cat(href):
    soup = scrapinglib.get_soup(f'https://marvel.fandom.com{href}')
    name = scrape_cat_name(soup).strip()
    #m_tag = soup.find('p', {'class': 'category-page__total-number'})
    foo = scrape_all_members(f'https://marvel.fandom.com{href}')
    #members_str = m_tag.get_text()
    #members = int(re.search(r'([0-9])+', members_str)[0])
    d[name] = foo
    print(f'{name}: {d[name]}')


def main():
    filter = {'class': 'category-page__member-link'}
    url = f'https://marvel.fandom.com/wiki/Category:Subjects_by_Creator'
    things = scrapinglib.scrape_cat(url, filter)
    for thing in things:
        do_cat(thing['href'])
    df = pd.DataFrame.from_dict(d, orient="index")
    df.to_csv("data1.csv")
    print("done!")


if __name__ == '__main__':
    main()
