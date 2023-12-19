import {get_data_by_id} from './firebase.js';
import { filterFunction, grid_btn } from './myScript.js';

var bank = [
    'HxEWtCgTUviXeJb4a8Lh', // Alpha Flight
    'cGohF3PEZQ37Kzo2Rlug', // Avengers
    'IrJ1aCXbsxMZRMZYFhcj', // Brotherhood of Evil Mutants
    'odgwYihG60Md7ESzDVr2', // Excalibur
    's0rR6gF8nYHubhs2Cqay', // Fantastic Four
    'gonCJ4Rj8J9URIYZ4ywd', // Great Lakes Avengers
    'q4ZnZ4cim1Hwx3prKFoS', // Heralds of Galactus
    'UPRtOdf18rKMRDhT2vaK', // Defenders
    'qbhbH9IxPZ3lmjZYjWFp', // Howling Commandos
    '7b8OjBbBuqIFolLiVnCM', // Illuminati
    'l8aYNQt912q8X4ZVSmrD', // Masters of Evil
    'rzgsgVj7yJPlkY0F6urC', // New Avengers
    'ztmo0XqvSEmCJEJVKJhS', // New Mutants
    'w07hXOOoR1xLTdFQkGN1', // Pet Avengers
    'c5Vuok18dzH84GpfY2Ou', // Runaways
    'fda34cCgApXg9kqRAkEi', // X-Factor
    'M4Laqo7eT0kqhmkyKWXK', // X-Men
    'JxnhFuO5JaWFjpkk1Bkv', // Young Avengers
    'kM6xTp12Maw9pGuAN5AU', // Young X-Men
    'nfw8Dj6gXwLJCYY7qcSH', // Canadians
    'sTat9kHvNBC0VZ7RSI8E', // Claws
    'Rh2X9fgULuC86Gm9FHLI', // GotG
    'CGXOtVRFb8gdswbB0hPs', // Mjolnir
    'RwxBlt4Uo6gtgBdJsqWe' // Flight
];

export var cat_ids = [
    'nfw8Dj6gXwLJCYY7qcSH',
    'RwxBlt4Uo6gtgBdJsqWe',
    'Rh2X9fgULuC86Gm9FHLI',
    'CGXOtVRFb8gdswbB0hPs',
    'M4Laqo7eT0kqhmkyKWXK',
    'cGohF3PEZQ37Kzo2Rlug'
];
var cat_datas = [];

// Get category image elements
const cat_divs = document.getElementsByName('cat');

var test_char = {
    "href": "/wiki/01100010_01110010_01110101_01110100_01100101_(Earth-616)",
    "name": "01100010 01110010 01110101 01110100 01100101",
    "image": "https://static.wikia.nocookie.net/marveldatabase/images/b/b9/01100010_01110010_01110101_01110100_01100101_%28Earth-616%29_from_Rocket_Raccoon_Vol_2_6_001.png",
    "alias": "Brute",
    "cat_arr": [
        "Characters",
        "Single Characters",
        "Robots",
        "No Dual Identity Characters",
        "Skottie Young/Creator",
        "Jake Parker/Creator",
        "Living Characters",
        "Earth-616/Characters",
        "2014 Character Debuts",
        "Metal Body"
    ],
    "collection": "characters"
}

main();

async function main() {
    // get six random ids from bank
    //cat_ids = shuffle(bank).slice(0, 6);
    // loop through ids
    for (let i=0; i<cat_ids.length; i++) {
        cat_datas[i] = await get_data_by_id(cat_ids[i], 'categories');
        make_cat_btn(cat_datas[i], i);
    }
    fill_ans_grids();
    make_grid_btns();
    setup_searchFilter();
}


function shuffle(array) {
    var m = array.length, t, i;
    // While there remain elements to shuffle…
    while (m) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);
        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

function randomize_grid() {
    shuffle(cat_ids);
    // Get json categories & make cat btns
    for (let i=0; i<cat_ids.length; i++) {
        fetch("./groups"+cat_ids[i]).then( function(u){ return u.json(); } ).
            then( function(json){ make_cat_btn(json, i); } )
    }
}


function make_cat_btn(data, i) {
    var html_chunk = [
        '<div class="tooltip"><img src="'+data['image']+'" class="grid-content cat-img"><span class="tooltiptext">'+data['help-text']+'</span></div>',
        '<div class="tooltip ans-grid-content"><img src="'+data['image']+'" class="cat-img"><span class="tooltiptext">'+data['help-text']+'</span></div>'
    ];
    cat_divs[i].innerHTML = html_chunk[0];
    cat_divs[i+6].innerHTML = html_chunk[1];
    cat_divs[i+6+6].innerHTML = html_chunk[1];
    cat_divs[i+6+6+6].innerHTML = html_chunk[1];
}


function fill_ans_grids() {
    var grid = document.getElementById("answer-grid");
    var cells = grid.getElementsByClassName("ans-grid-content");
    for (let i = 0; i < cells.length; i++) {
        var element = cells[i].getElementsByTagName('a')[0];
        
        // Check if element is defined before performing operations
        if (element) {
            var s = `answers.html?team1=${cat_ids[i%3]}&team2=${cat_ids[Math.floor(i/3)+3]}`
            element.setAttribute('href', s);
            cells[i].getElementsByClassName("ans-num")[0].innerHTML = Math.floor(Math.random() * 100) + 1;
        }
    }

    grid = document.getElementById("percentage-grid");
    cells = grid.getElementsByClassName("ans-grid-cell");
    for (let i=0; i<cells.length; i++) {
        cells[i].innerHTML = 
            '<img src="'+test_char['image']+'" class="grid-content char-cell-full">'+
            '<div class="grid-percent">100%</div><div class="grid-label">'+
            test_char['alias']+'</div>';
    }

    grid = document.getElementById("accuracy-grid");
    cells = grid.getElementsByClassName("ans-num");
    for (let i=0; i<cells.length; i++) {
        var randomNum = Math.floor(Math.random() * 101);
        cells[i].innerHTML = randomNum + "%";
    }
}

function make_grid_btns() {
    let grid = document.getElementById("main-grid");
    let cells = grid.querySelectorAll('[name="btn"]');
    for (let i=0; i<cells.length; i++) {
        let x = i % 3;
        let y = Math.floor(i / 3);
        cells[i].addEventListener("click", function () {
            grid_btn(x, y);
        });
    }
    console.log('made grid btns');
}

function setup_searchFilter() {
    console.log('setting up search filter');
    let search = document.getElementById("search");
    search.addEventListener("keyup", function () {
        filterFunction();
    });
}
