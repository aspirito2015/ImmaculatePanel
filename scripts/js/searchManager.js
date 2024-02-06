import {
    getBadGuesses,
    getUsedCharTags,
    clearActiveCell,
    getCharacters,
    isCharacterValid,
    fillActiveCell,
    getActiveCellIndex,
    addBadGuess,
    decrementGuesses
} from "./gameManager.js";

var overlay_tag = document.getElementById("overlay");
var searchBar_tag = document.getElementById("srch_bar");
var search_tag = document.getElementById("search");
var body_tag = document.body;
var character_tags = {};
var characters;

main();

async function main() {
    setUpSearchFilter();
    createCharacterTags();
    // set up giveup button
    document.getElementById("giveup").addEventListener("click", function () {
        search_off();
    });
}

export function search_on() {
    overlay_tag.style.display = "block";
    searchBar_tag.style.display = "";
    search_tag.focus();
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
    console.log("search toggled on");
}

export function search_off() {
    // set all bad btns to good
    var bad_ids = getBadGuesses();
    if (bad_ids != null) {
        for (var i = 0; i < bad_ids.length; i++) {
            setButtonState(bad_ids[i], 0);
        }
    }
    overlay_tag.style.display = "none";
    searchBar_tag.style.display = "none";
    body_tag.classList.remove('noscroll');
    clearActiveCell();
    filterClear(); // TODO
    console.log("search toggled off");
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
    characters = await getCharacters();
    for (const c in characters) {
        let id = c;
        let name = characters[c].name;
        let alias = characters[c].alias;
        if (alias === undefined || alias === null) { alias = name; }
        // create an html object using the data grabbed from the json
        var html_object = document.createElement('li');
        html_object.setAttribute('name', id);
        let temp = `<div>${alias}<div class='sub'>${name}</div></div>`;
        temp += `<button>Select</button><div class='sub used' style='display: `;
        temp += `none;'>Already Used</div>`;
        html_object.innerHTML = temp;
        // store the html object in an array for future creation/destruction
        character_tags[c] = html_object;
        // set up the Select button inside the html object
        var button = html_object.querySelector('button');
        button.addEventListener('click', function () {
            tryGuess(c);
        })
    }
    console.log('created character tags');
}

function setUpSearchFilter() {
    search_tag.addEventListener("keyup", function () {
        filterFunction();
    });
    console.log("set up search filter");
}

function filterFunction() {
    if (search_tag.value < 1) return;
    var ul, li;
    // clear old search list
    clearList();
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
    for (const o in data) {
        let name = characters[o].name;
        let alias = characters[o].alias;
        if (pattern.test(name) || pattern.test(alias)) {
            results[o] = data[o];
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
    console.log(`${characterID} button pressed`);
    var active_index = getActiveCellIndex();
    if (await isCharacterValid(characterID) == false) {
        // add characterID to list of bad guesses for this cell
        addBadGuess(characterID);
        setButtonState(characterID, 2);
        decrementGuesses();
        return;
    }
    await fillActiveCell(characterID);
    search_off();
    decrementGuesses();
}
