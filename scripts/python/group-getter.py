from bs4 import BeautifulSoup
import requests
import json

def get_list(url, filter):
    req = requests.get(url)
    soup = BeautifulSoup(req.text, 'html.parser')
    things = soup.find_all('a', class_='category-page__member-link')

    next_btn = soup.find('a', class_='category-page__pagination-next')
    if next_btn:
        print('found a NEXT button')
        things += get_list(next_btn['href'], filter)

    list = [thing for thing in things if filter in thing['title']]
    return list

def do_list(name, url, filter):
    print('starting ' + name)
    members = get_list(url, filter)
    print('gathered ' + name)
    a = []
    for m in members:
        a.append({"name": m['title'], "href": m['href']})
    j = {
        "name": name,
        "image": "",
        "source": url,
        "members": a
    }
    save_list(j, name)

def save_list(jsonlist, filename):
    with open('group_'+filename+'.json', 'w', encoding='utf-8') as f:
        json.dump(jsonlist, f, indent=4)

"""
p_list = do_list("POWERS",
    "https://marvel.fandom.com/wiki/Category:Powers",
    'Category')

do_list("X-men",
    "https://marvel.fandom.com/wiki/Category:X-Men_(Earth-616)/Members", 
    'Earth-616')

do_list("Avengers",
    "https://marvel.fandom.com/wiki/Category:Avengers_(Earth-616)/Members", 
    'Earth-616')

do_list("Canadians",
    "https://marvel.fandom.com/wiki/Category:Canadians",
    'Earth-616')

do_list("Worthy of Mjolnir",
    "https://marvel.fandom.com/wiki/Category:Worthy_of_Mjolnir",
    'Earth-616')

do_list("Guardians",
    "https://marvel.fandom.com/wiki/Category:Guardians_of_the_Galaxy_(Earth-616)/Members",
    'Earth-616')

do_list("Electrokinesis",
    "https://marvel.fandom.com/wiki/Category:Electrokinesis",
    'Earth-616')
"""


def intersection (lst1, lst2):
    return [value for value in lst1 if value in lst2]

#list of lists
#lol = [m_list, g_list, e_list, x_list, a_list, c_list]
#lol = [p_list, x_list, a_list]

"""
print("Electricians who are worthy of Mjolnir")
for i in intersection(e_list['members'], m_list['members']):
    print(i['name'])
"""

"""
f = open('group_POWERS.json')
data = json.load(f)
for i in data['members']:
    do_list(i['name'][9:], "https://marvel.fandom.com"+i['href'], "Earth-616")
"""