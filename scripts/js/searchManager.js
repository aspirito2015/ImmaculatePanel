import {
    getBadGuesses,
    getUsedCharTags,
    clearActiveCell,
    getCharactersPage,
    isCharacterValid,
    fillActiveCell,
    addBadGuess,
    decrementGuesses
} from "./gameManager.js";

var searchBar_tag = document.getElementById("srch_bar");
var search_tag = document.getElementById("search");
var body_tag = document.body;
var character_tags = {};
const characters = [];

main();

async function main() {
    setUpSearchFilter();
    createCharacterTags();
}

export function search_on() {
    document.getElementById("overlay").style.display = "block";
    searchBar_tag.style.display = "";
    document.getElementById("search").focus();
    body_tag.classList.add('noscroll');
    // set all bad btns
    var bad_ids = getBadGuesses();
    if (bad_ids != null) {
        for (var i = 0; i < bad_ids.length; i++) {
            setButtonState(bad_ids[i], 2);
        }
    }
    var used_chars = getUsedCharTags();
    if (used_chars != null) {
        for (var i = 0; i < used_chars.length; i++) {
            setButtonState(used_chars[i], 1);
        }
    }
    console.log("searchManager | search toggled on");
}

export function search_off() {
    if (document.getElementById("srch_bar").style.display == "none") {
        return;
    }
    // set all bad btns to good
    var bad_ids = getBadGuesses();
    if (bad_ids != null) {
        for (var i = 0; i < bad_ids.length; i++) {
            setButtonState(bad_ids[i], 0);
        }
    }
    document.getElementById("overlay").style.display = "none";
    document.getElementById("srch_bar").style.display = "none";
    body_tag.classList.remove('noscroll');
    clearActiveCell();
    filterClear();
    // console.log("searchManager | search toggled off");
}

function setButtonState(characterID, i) {
    var li = document.getElementsByName(characterID)[0];
    if (!li) { return; }
    li.setAttribute('style', 'color: white;');
    switch (i) {
        case 0: // set unused
            li.getElementsByTagName('button')[0].style.display = "";
            li.getElementsByClassName('used')[0].style.display = "none";
            break;
        case 1: // set right
            li.getElementsByTagName('button')[0].style.display = "none";
            li.getElementsByClassName('used')[0].style.display = "";
            break;
        case 2: // set wrong
            li.setAttribute('style', 'color: rgb(248 113 113);');
            li.getElementsByTagName('button')[0].style.display = "none";
            li.getElementsByClassName('used')[0].style.display = "none";
            break;
    }
}



async function createCharacterTags() {
    // get json list of characters from gameManager.js and loop through
    let page = 1;
    let pageSize = 1000;
    while (true) {
        let newCharacters = await getCharactersPage(page, pageSize);
        if (newCharacters.length < 1) break;
        // find html template to use for search entries
        let template = document.getElementById("template-search");
        let item = template.content.querySelector("li");
        for (let i = 0; i < newCharacters.length; i++) {
            let id = newCharacters[i].charID;
            let name = newCharacters[i].name;
            let alias = newCharacters[i].alias;
            // if there's no alias, replace w/ name
            if (alias === undefined || alias === null || alias === "") { alias = name; }
            // create new node from template
            var html_object = document.importNode(item, true);
            html_object.setAttribute('name', id);
            html_object.querySelector('[name="name"]').innerHTML = name;
            html_object.querySelector('[name="alias"]').innerHTML = alias;
            // store the html object in an array for future creation/destruction
            character_tags[id] = html_object;
            // set up the Select button inside the html object
            var button = html_object.querySelector('button');
            button.addEventListener('click', function () {
                tryGuess(id);
            })
        }
        characters.push(...newCharacters);
        if (newCharacters.length < pageSize) break;
        pageSize = 7000;
        page++;
    }
}

function setUpSearchFilter() {
    search_tag.addEventListener("input", function () {
        filterFunction();
    });
    // console.log("searchManager | set up search filter");
}

const delay = ms => new Promise(res => setTimeout(res, ms));

async function filterFunction() {
    let old_search_value = search_tag.value;
    // wait t time and only perform filter if input hasn't changed.
    await delay(100);
    if (old_search_value != search_tag.value) { return; }
    // clear old search list
    clearList();
    if (search_tag.value < 1) { return; }
    var ul, li;
    // Get HTML <ul> tag and make visible
    ul = document.getElementById("charlist");
    ul.style.display = "";
    // Get list of matching chars
    var filter_results = filterObjectsByNameAlias(character_tags, search_tag.value);
    // Create HTML <li> tags for each of the matching chars
    for (var id in filter_results) {
        var li = character_tags[id];
        // Append the li element to the ul
        ul.appendChild(li);
    }
}

function clearList() {
    var ul = document.getElementById("charlist");
    ul.innerHTML = "";
}

// Function to filter objects based on the regex pattern
// returns array of objects that match name OR alias
function filterObjectsByNameAlias(data, nameAlias) {
    let results = {};
    // '\\b' = word boundary, 'i' = case-insensitive
    const pattern = new RegExp('\\b' + nameAlias, 'i');
    for (let i = 0; i < Object.keys(data).length; i++) {
        if (Object.keys(results).length > 25) break;
        let name = characters[i].name;
        let alias = characters[i].alias;
        if (pattern.test(name) || pattern.test(alias)) {
            results[characters[i].charID] = data[i];
        }
    }
    return results;
}

function filterClear() {
    let input = document.getElementById("search");
    input.value = "";
    let ul = document.getElementById("charlist");
    ul.style.display = "none";
}

async function tryGuess(characterID) {
    if (isLoading()) return;
    setLoading(true);
    if (await isCharacterValid(characterID) == false) {
        // add characterID to list of bad guesses for this cell
        addBadGuess(characterID);
        setButtonState(characterID, 2);
        decrementGuesses();
        setLoading(false);
        return;
    }
    await fillActiveCell(characterID);
    search_off();
    decrementGuesses();
    setLoading(false);
}
