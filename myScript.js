import {get_data_by_id} from './firebase.js';
import {get_ref} from './firebase.js';
import {cat_ids} from './makeIndex.js';
var body = document.body;
var srch_bar = document.getElementById('srch_bar');

const btns_html = document.getElementsByName('btn');
var catdirs = [
    '/nations/group_Canadians.json',
    '/powers/group_Electrokinesis.json',
    '/teams/group_Guardians.json',
    '/feats/group_WorthyOfMjolnir.json',
    '/teams/group_X-men.json',
    '/teams/group_Avengers.json'
];
var cats = [6];
var btn_active_html;
var btn_active_x, btn_active_y;
var all_chars = {};
var char_search_entries = {};
var guesses = 9;
var bad_guesses = [[],[],[],[],[],[],[],[],[]];
var used_chars = [];
var sum_bools = Array(9).fill(false);
var guessdiv = document.getElementById("guesses");
var charObjects;

//console.log(cat_ids);
// Get json list of characters
fetch("./scraping/done-list-v2.json").then( function(u){ return u.json(); } ).
    then( function(json){
        import_all_chars(json); 
    })

function import_all_chars(jsonData) {
    // Get objects with "type": "char"
    charObjects = Object.keys(jsonData)
    .filter(key => jsonData[key].type === "char")
    .map(key => ({ id: key, ...jsonData[key] }));
    for (const char of charObjects) {
        addToList(char.id, char);
    }
    //console.log(char_search_entries);
}

function addToList(id, jsonData) {
    // If no alias, set to name
    let name, alias;
    name = jsonData.name;
    alias = jsonData.alias;
    if (alias === undefined) {
        alias = name;
    }
    // fill char_search_entries w/ html
    char_search_entries[id] = `<div>${alias}<div class='sub'>${name}</div></div><button>Select</button><div class='sub used' style='display: none;'>Already Used</div>`;
}

// Handle search bar enable/disable
srch_bar.addEventListener("click", function(e) { e.stopPropagation(); } );
document.getElementById('sum').addEventListener("click", function(e) { e.stopPropagation(); } );

document.getElementById('overlay').addEventListener("click", function() {
    search_off();
    summary_off();
});

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


function give_up() {
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
    // alert('Column: '+x+' - '+cats[x].name+'\nRow: '+y+' - '+cats[y+3].name);
}

async function is_choice_good(char_id, cat_id_x, cat_id_y) {
    var char_data = await get_data_by_id(char_id, 'characters');
    console.log(char_data);
    var ref_x = get_ref(cat_id_x, 'characters');
    var ref_y = get_ref(cat_id_y, 'characters');
    var x_bool = char_data['cat_arr'].includes(ref_x);
    var y_bool = char_data['cat_arr'].includes(ref_y);
    return x_bool && y_bool;
}

// TODO: refactor srch_btn (and probably this whole script) to use id instead of name
// TODO: have list add and remove tags as necessary instead of just hiding and showing them
async function srch_btn(char_id) {
    console.log(char_id);
    var cat_id_x = cat_ids[btn_active_x];
    var cat_id_y = cat_ids[btn_active_y+3];
    var b = await is_choice_good(char_id, cat_id_x, cat_id_y);
    console.log(b);


/*
    char = all_chars[charname];
    // is char in column list and row list?
    is_in_x = cats[btn_active_x].members.some(item => item.name == charname);
    is_in_y = cats[3+btn_active_y].members.some(item => item.name == charname);
    grid_index = btn_active_x+3*btn_active_y;
    // alert("Is "+charname+" in "+cats[btn_active_x].name+"?\n"+is_in_x+"\n"+"Is "+charname+" in "+cats[3+btn_active_y].name+"?\n"+is_in_y);
    if (is_in_x && is_in_y) {
        btn_active_html.innerHTML = '<img src="'+char.img+'" class="grid-content" style="width: 90%; height: 100%; object-fit: cover;"><div class="grid-percent">100%</div><div class="grid-label">'+char.name.substring(0, char.name.length-12)+'</div>';
        btn_active_html.setAttribute("style", "background-color: #59d185;")
        btn_active_html.setAttribute("onclick", "window.open('https://marvel.fandom.com"+char.href+"', '_blank')");
        search_off();
        sum_grid = document.getElementsByClassName("sum-grid-cell");
        sum_grid[grid_index].setAttribute("style", "background-color: #59d185;");
        sum_bools[grid_index] = true;
        // add to global 'already used' list
        used_chars.push(charname);
        setBtnUsed(charname);
    } else {
        // add to button-specific 'already guessed' list
        btn_bad_guess_list = bad_guesses[grid_index];
        btn_bad_guess_list.push(charname);
        setBtnBad(charname);
    }
    decrementGuesses();
    */
}

function setBtnBad (charname) {
    li = document.getElementsByName(charname)[0];
    li.setAttribute('style', 'color: rgb(248 113 113);');
    li.getElementsByTagName('button')[0].style.display = "none";
    li.getElementsByClassName('used')[0].style.display = "none";
}

function setBtnGood (charname) {
    li = document.getElementsByName(charname)[0];
    li.setAttribute('style', 'color: white;');
    li.getElementsByTagName('button')[0].style.display = "";
    li.getElementsByClassName('used')[0].style.display = "none";
}

function setBtnUsed (charname) {
    li = document.getElementsByName(charname)[0];
    li.setAttribute('style', 'color: white;');
    li.getElementsByTagName('button')[0].style.display = "none";
    li.getElementsByClassName('used')[0].style.display = "";
}

function clearList() {
    var ul = document.getElementById("charlist");
    ul.innerHTML = "";
}

// Filter list while searching
export function filterFunction() {
    // TODO: clear old search list
    clearList();
    var input, ul, li;
    //console.log("filterFunction() triggered");
    input = document.getElementById("search");
    // Get HTML <ul> tag and make visible
    ul = document.getElementById("charlist");
    ul.style.display = "";
    // Get list of matching chars
    var filter_results = filterObjectsByNameAlias(charObjects, input.value);
    //console.log(filter_results);
    // Create HTML <li> tags for each of the matching chars
    for (var i = 0; i < filter_results.length; i++) {
        let li = document.createElement("li");
        li.setAttribute('name', filter_results[i].name);
        // Add the content to the li element
        li.innerHTML += char_search_entries[filter_results[i].id];
        // Append the li element to the ul
        ul.appendChild(li);
        // Add click event listener to the button inside the li
        const button = li.querySelector('button');
        if (button) {
            (function (index) {
                button.addEventListener('click', function() {
                    // Handle the button click using filter_results[index].id
                    srch_btn(filter_results[index].id);
                });
            })(i);
        }
    }
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


updateGuesses(guesses);

function decrementGuesses() {
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