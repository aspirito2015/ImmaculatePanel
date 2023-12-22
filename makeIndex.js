import { get_data_by_id, check_cat_combo } from './firebase.js';
import { filterFunction, grid_btn } from './myScript.js';

var bank = [
    'HxEWtCgTUviXeJb4a8Lh', //0 Alpha Flight
    'cGohF3PEZQ37Kzo2Rlug', //1 Avengers
    'IrJ1aCXbsxMZRMZYFhcj', //2 Brotherhood of Evil Mutants
    'odgwYihG60Md7ESzDVr2', //3 Excalibur
    's0rR6gF8nYHubhs2Cqay', //4 Fantastic Four
    'gonCJ4Rj8J9URIYZ4ywd', //5 Great Lakes Avengers
    'q4ZnZ4cim1Hwx3prKFoS', //6 Heralds of Galactus
    'UPRtOdf18rKMRDhT2vaK', //7 Defenders
    'qbhbH9IxPZ3lmjZYjWFp', //8 Howling Commandos
    '7b8OjBbBuqIFolLiVnCM', //9 Illuminati
    'l8aYNQt912q8X4ZVSmrD', //10 Masters of Evil
    'rzgsgVj7yJPlkY0F6urC', //11 New Avengers
    'ztmo0XqvSEmCJEJVKJhS', //12 New Mutants
    'w07hXOOoR1xLTdFQkGN1', //13 Pet Avengers
    'c5Vuok18dzH84GpfY2Ou', //14 Runaways
    'fda34cCgApXg9kqRAkEi', //15 X-Factor
    'M4Laqo7eT0kqhmkyKWXK', //16 X-Men
    'JxnhFuO5JaWFjpkk1Bkv', //17 Young Avengers
    'kM6xTp12Maw9pGuAN5AU', //18 Young X-Men
    'nfw8Dj6gXwLJCYY7qcSH', //19 Canadians
    'sTat9kHvNBC0VZ7RSI8E', //20 Claws
    'Rh2X9fgULuC86Gm9FHLI', //21 GotG
    'CGXOtVRFb8gdswbB0hPs', //22 Mjolnir
    'RwxBlt4Uo6gtgBdJsqWe' //23 Flight
];

export var cat_ids = [
            bank[19], bank[23], bank[21],
    bank[22],
    bank[16],
    bank[1]
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
    // check if categories have enough valid answers
    console.log(`Are categories good? ${areCategoriesGood()}`);
    // loop through ids and category headers
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

function areCategoriesGood() {
    check_cat_combo(cat_ids[0], cat_ids[3]);
    return false;
}

function make_cat_btn(data, i) {
    var html_chunk = [
        '<div class="tooltip"><img src="'+data['image']+'" class="grid-content cat-img"><span class="tooltiptext">'+data['help-text']+'</span></div>',
        '<div class="tooltip ans-grid-content"><img src="'+data['image']+'" class="cat-img"><span class="tooltiptext">'+data['help-text']+'</span></div>'
    ];
    // make cat headers for main grid
    cat_divs[i].innerHTML = html_chunk[0];
    // make cat headers for summary grids
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
