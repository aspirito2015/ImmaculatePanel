import {get_data_by_id} from './firebase.js';
import {cat_ids} from './makeIndex.js';
//import {charObjects} from './makeIndex.js';
//import {char_search_entries} from './makeIndex.js';
var body = document.body;
var srch_bar = document.getElementById('srch_bar');

const btns_html = document.getElementsByName('btn');
const char_coll_name = 'characters_2';
var btn_active_html;
var btn_active_x, btn_active_y;
var guesses = 9;
var bad_guesses = [[],[],[],[],[],[],[],[],[]];
var used_chars = [];
var sum_bools = Array(9).fill(false);
var guessdiv = document.getElementById("guesses");
var char_search_entries = {};
var catObjects, charObjects;
var catDict = {};


// Get json list of characters
fetch("./scraping/results/done-list-20240101.json").then( function(u){ return u.json(); } ).
    then( function(json){
        import_all_cats(json);
        import_all_chars(json); 
    })


// Handle search bar enable/disable
srch_bar.addEventListener("click", function(e) { e.stopPropagation(); } );
document.getElementById('sum').addEventListener("click", function(e) { e.stopPropagation(); } );

document.getElementById('overlay').addEventListener("click", function() {
    search_off();
    summary_off();
});

updateGuesses(guesses);


function import_all_cats(jsonData) {
    catObjects = Object.keys(jsonData)
    .filter(key => jsonData[key].type === "cat")
    .map(key => ({ id: key, ...jsonData[key] }));
    //console.log(catObjects);
    for (const cat of catObjects) {
        catDict[cat.id] = cat.name;
    }
    console.log(catDict);
}

function import_all_chars(jsonData) {
    // Get objects with "type": "char"
    charObjects = Object.keys(jsonData)
    .filter(key => jsonData[key].type === "char")
    .map(key => ({ id: key, ...jsonData[key] }));
    
    for (const char of charObjects) {
        addToCharList(char.id, char);
    }
    //console.log(char_search_entries);
}

function addToCharList(id, jsonData) {
    // If no alias, set to name
    let name, alias;
    name = jsonData.name;
    alias = jsonData.alias;
    if (alias === undefined) {
        alias = name;
    }
    // fill char_search_entries w/ html
    var html_object = document.createElement('li');
    html_object.setAttribute('name', jsonData.id);
    html_object.innerHTML = `<div>${alias}<div class='sub'>${name}</div></div><button>Select</button><div class='sub used' style='display: none;'>Already Used</div>`;
    char_search_entries[id] = html_object;

    const button = html_object.querySelector('button');
    button.addEventListener('click', function() {
        // Handle the button click using filter_results[index].id
        srch_btn(jsonData.id);
    });
}


// Filter list while searching
export function filterFunction() {
    var input, ul, li;
    input = document.getElementById("search");
    if (input.value.length < 3) return;
    // clear old search list
    clearList();
    //console.log("filterFunction() triggered");
    // Get HTML <ul> tag and make visible
    ul = document.getElementById("charlist");
    ul.style.display = "";
    // Get list of matching chars
    var filter_results = filterObjectsByNameAlias(charObjects, input.value);
    // Create HTML <li> tags for each of the matching chars
    for (var i = 0; i < filter_results.length; i++) {
        var li = char_search_entries[filter_results[i].id];
        // Append the li element to the ul
        ul.appendChild(li);
    }
}

function btnPrevGrids() { search_on(); }

function get_bad_btns() {
    var bad_btns = bad_guesses[btn_active_x+3*btn_active_y];
    if (bad_btns === undefined) return null;
    return bad_btns;
}

function search_on() {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("srch_bar").style.display = "";    
    document.getElementById("search").focus();
    body.classList.add('noscroll');
    // set all bad btns
    var bad_btns = get_bad_btns();
    for (var i=0; i < bad_btns.length; i++) {
        setBtnBad(bad_btns[i]);
    }
    for (var i=0; i < used_chars.length; i++) {
        setBtnUsed(used_chars[i]);
    }
}

function search_off() {
    // set all bad btns to good
    var bad_btns = get_bad_btns();
    if (bad_btns == null) { return; }
    for (var i=0; i < bad_btns.length; i++) {
        setBtnGood(bad_btns[i]);
    }
    document.getElementById("overlay").style.display = "none";
    document.getElementById("srch_bar").style.display = "none";
    body.classList.remove('noscroll');
    btn_active_html.classList.remove('highlighted');
    search = document.getElementById("search");
    filterClear();
}


export function give_up() {
    console.log("given up");
    updateGuesses(0);
    summary_on();
}

function summary_on() {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("sum").style.display = "";
    body.classList.add('noscroll');
}

function summary_off() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("sum").style.display = "none";
    body.classList.remove('noscroll');
}


export function grid_btn(x, y) {
    if (guesses <= 0) return;
    btn_active_x = x;
    btn_active_y = y;
    btn_active_html = btns_html[x+(3*y)];
    btn_active_html.classList.add('highlighted');
    search_on();
}

async function is_choice_good(char_data, cat_id_x, cat_id_y) {
    //return true;
    //var char_data = await get_data_by_id(char_id, 'characters');
    var catArrIds = char_data.cat_arr.map(entry => entry.id);
    //console.log(catArrIds);
    var x_bool = catArrIds.includes(cat_id_x);
    var y_bool = catArrIds.includes(cat_id_y);
    console.log(`cat_id_x: ${cat_id_x} - ${x_bool}\ncat_id_y: ${cat_id_y} - ${y_bool}`);
    return x_bool && y_bool;
}

// Function to remove all event listeners from an element
function removeAllEventListeners(element) {
    var clone = element.cloneNode(true);
    element.parentNode.replaceChild(clone, element);
    return clone;
}

function addLink (btn, href) {
    btn.addEventListener('click', function() {
        window.open(`https://marvel.fandom.com${href}`, '_blank').focus();
    });
}

async function srch_btn(char_id) {
    //console.log(char_id);
    var cat_id_x = cat_ids[btn_active_x];
    var cat_id_y = cat_ids[btn_active_y+3];
    var char_data = await get_data_by_id(char_id, char_coll_name);
    var b = await is_choice_good(char_data, cat_id_x, cat_id_y);
    //console.log(b);
    var grid_index = btn_active_x+3*btn_active_y;
    if (b) {
        btn_active_html.setAttribute("style", "background-color: #59d185;")
        search_off();
        // filled cell with answer
        var sum_grid = document.getElementsByClassName("sum-grid-cell");
        var name_to_display = char_data.name;
        let pattern = /\..*\.$/
        if (pattern.test(char_data.alias)) {
            name_to_display = char_data.alias;
        }
        var image_to_display = "https://upload.wikimedia.org/wikipedia/en/archive/b/b1/20210811082420%21Portrait_placeholder.png";
        if (char_data.image) {
            image_to_display = char_data.image;
        }
        btn_active_html.innerHTML = '<img src="'+image_to_display+'" class="grid-content" style="width: 90%; height: 100%; object-fit: cover;"><div class="grid-percent">100%</div><div class="grid-label">'+name_to_display+'</div>';
        sum_grid[grid_index].setAttribute("style", "background-color: #59d185;");
        sum_bools[grid_index] = true;
        // replace event listener on button to one that opens link to wiki
        var new_btn_active = removeAllEventListeners(btn_active_html);
        new_btn_active.addEventListener('click', function() {
            console.log(`opening ${char_data.href}`);
            window.open(`https://marvel.fandom.com${char_data.href}`, '_blank').focus();
        });
        // add to 'already used' list
        used_chars.push(char_id);
        setBtnUsed(char_id);
    } else {
        var btn_bad_guess_list = bad_guesses[grid_index];
        btn_bad_guess_list.push(char_id);
        setBtnBad(char_id);
    }
    console.log('search button has been pressed');
    decrementGuesses();

}

function setBtnBad (char_id) {
    var li = document.getElementsByName(char_id)[0];
    if (!li) { return; }
    li.setAttribute('style', 'color: rgb(248 113 113);');
    li.getElementsByTagName('button')[0].style.display = "none";
    li.getElementsByClassName('used')[0].style.display = "none";
}

function setBtnGood (char_id) {
    var li = document.getElementsByName(char_id)[0];
    if (!li) { return; }
    li.setAttribute('style', 'color: white;');
    li.getElementsByTagName('button')[0].style.display = "";
    li.getElementsByClassName('used')[0].style.display = "none";
}

function setBtnUsed (char_id) {
    var li = document.getElementsByName(char_id)[0];
    if (!li) { return; }
    li.setAttribute('style', 'color: white;');
    li.getElementsByTagName('button')[0].style.display = "none";
    li.getElementsByClassName('used')[0].style.display = "";
}

function clearList() {
    var ul = document.getElementById("charlist");
    ul.innerHTML = "";
}


// Function to filter objects based on the regex pattern
// returns array of objects that match name OR alias
function filterObjectsByNameAlias(data, nameAlias) {
    // '\\b' = word boundary, 'i' = case-insensitive
    const pattern = new RegExp('\\b' + nameAlias, 'i');
    return Object.keys(data)
        .filter(key => {
            const object = data[key];
            // Test 'name' or 'alias' against the regex pattern
            return pattern.test(object.name) || (object.alias && pattern.test(object.alias));
        })
        .map(key => ({ id: key, ...data[key] }));
}

function filterClear() {
    let input = document.getElementById("search");
    input.value = "";
    let ul = document.getElementById("charlist");
    ul.style.display = "none";
}


function copy_sum() {
    let txt = "";
    let count = 0;
    for (let y=0; y < 3; y++) {
        for (let x=0; x < 3; x++) {
            if (sum_bools[x+3*y]) {
                // Green Square: 🟩 Dec: &#129001	Hex: &#x1F7E9
                txt += "&#129001";
                count++;
            } else {
                // White Square: ⬜ Dec: &#11036 Hex:	&#x2B1C
                txt += "&#11036";
            }
        }
        txt += "\n";
    }
    txt = "Immaculate Inning 999 "+count+"/9:\nRarity: 999\n"+txt+"Play at https://aspirito2015.github.io/MarvelGrid_HTML/";
    let copy_tmp = document.getElementById("copy-tmp");
    copy_tmp.innerHTML = txt;
    navigator.clipboard.writeText(copy_tmp.innerHTML);
    alert("Copied to clipboard");
}

function decrementGuesses() {
    console.log('decrementing Guesses');
    updateGuesses(guesses-1);
}

function updateGuesses(i) {
    guesses = i;
    animate_guesses(guessdiv, 0, guesses, 300);
    if (guesses <= 0) lose();
}

function lose() {
    search_off();
    summary_on();
    document.getElementById("giveup").innerHTML = "Show Summary";
    for (let i=0; i < btns_html.length; i++) {
        btns_html[i].classList.remove("grid-item");
        btns_html[i].classList.add("grid-item-no-hover");
    }
}

function animate_guesses(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}
