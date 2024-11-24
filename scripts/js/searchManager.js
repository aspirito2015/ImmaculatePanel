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
const startTime = new Date();

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
    for (let i = 0; i < characters.length; i++) {
        let id = characters[i].charID;
        let name = characters[i].name;
        let alias = characters[i].alias;
        // if there's no alias, replace w/ name
        if (alias === undefined || alias === null || alias === "") { alias = name; }
        // create an html object using the character data
        var html_object = document.createElement('li');
        html_object.setAttribute('name', id);
        let temp = `<div>${alias}<div class='sub'>${name}</div></div>
            <button class="caption" style="background-color:rgb(22 163 74); color:white;">Select</button><div class='sub used' style='display: 
            none;'>Already Used</div>`;
        html_object.innerHTML = temp;
        // store the html object in an array for future creation/destruction
        character_tags[id] = html_object;
        // set up the Select button inside the html object
        var button = html_object.querySelector('button');
        button.addEventListener('click', function () {
            tryGuess(id);
        })
    }
    let now = new Date();
    console.log(`${now.toLocaleTimeString()} | created character tags, took ${now - startTime} ms`);
}

function setUpSearchFilter() {
    search_tag.addEventListener("input", function () {
        filterFunction();
    });
    console.log("set up search filter");
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
    console.log(`${characterID} button pressed`);
    // var active_index = getActiveCellIndex();
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
