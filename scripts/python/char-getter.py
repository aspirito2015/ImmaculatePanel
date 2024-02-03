import json
import os
from bs4 import BeautifulSoup
import requests

dir_path = os.path.dirname(os.path.realpath(__file__))
os.chdir(dir_path)
#print(os.listdir(dir_path+'/groups'))
a = []
dir_path+='\\groups'
os.chdir(dir_path)
skips = 0
adds = 0


for d in os.listdir(os.getcwd()):
    print(os.getcwd()+'\\'+d)
    if os.path.isdir(os.getcwd()+'\\'+d):
        for fn in os.listdir(os.getcwd()+'\\'+d):
            if fn[-5:] == ".json":
                f = open(os.getcwd()+'\\'+d+'\\'+fn)
                data = json.load(f)
                for m in data['members']:
                    print('working on '+m['name'])
                    j = {"name": m['name'], "href": m['href']}
                    if j in a:
                        print(j['name'] + ' skipped')
                        skips += 1
                    else:
                        req = requests.get("https://marvel.fandom.com"+j['href'])
                        soup = BeautifulSoup(req.text, 'html.parser')
                        img = soup.find('img', class_='pi-image-thumbnail')
                        if img:
                            src = img.get('src')
                        else:
                            src = ""
                        j.update({"img":src})
                        div = soup.find('div', {"data-source" : "CurrentAlias"})
                        if div is None:
                            alias = j['name']
                        elif div.find('a'):
                            alias = div.find('a').text
                        else:
                            alias = div.find('h3').text
                        j.update({"alias":alias})
                        a.append(j)
                        print(j['alias']+ ' AKA ' + j['name'] + ' added')


"""
j = {"name": "Akihiro (Earth-616)", "href": "/wiki/Akihiro_(Earth-616)"}

req = requests.get("https://marvel.fandom.com"+j['href'])
soup = BeautifulSoup(req.text, 'html.parser')
img = soup.find('img', class_='pi-image-thumbnail')
src = img.get('src')
j.update({"img":src})
div = soup.find('div', {"data-source" : "CurrentAlias"})
alias = div.find('a', class_="mw-disambig").text
j.update({"alias":alias})
"""


def save_list(jsonlist, filename):
    with open(filename+'.json', 'w', encoding='utf-8') as f:
        json.dump(jsonlist, f, indent=4)

save_list(a, "char_ALL")


#print('skips: '+str(skips))
#print('chars: '+str(len(a)))