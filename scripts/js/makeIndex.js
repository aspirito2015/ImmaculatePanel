import { get_data_by_id, check_cat_combo } from './firebase.js';
import { filterFunction, grid_btn, give_up } from './myScript.js';
import { getCat, getCha, getEdg } from './getData.js';

var bank_ = [
    'iDHGJtOZNHuipFp2YKRX', //0 Alpha Flight
    'DRZELgRKR51pqUaKIvWl', //1 Avengers
    '0IJa3D28KqAPr9ol3Vzi', //2 Brotherhood of Evil Mutants
    '1uGadGEN8MXgc78H0YAD', //3 Excalibur
    'p4t2NEdrPMYVokGWjGnH', //4 Fantastic Four
    'SB117gHbKMi2w4b5tFtW', //5 Great Lakes Avengers
    'SytYLPdIYrGQC5pi6EXh', //6 Heralds of Galactus
    'JteSkfTAsrCo3l8joUlH', //7 Defenders
    '3zkEnWZvdPaHrxkkuM8l', //8 Howling Commandos
    'HgieD3fS2Mrq9LFDv0hG', //9 Illuminati
    'ZCxQazNHpoilh9dLUS0m', //10 Masters of Evil
    '20juN8R5VZVZ0vuehnBB', //11 New Avengers
    'YKWwf4BbbZLOQxk59r2T', //12 New Mutants
    'jijjfzi4w0DaSj1elyaL', //13 Pet Avengers
    'HW8yMxG241vruQ9Zr3Qe', //14 Runaways
    '1dDDjIxwkBgCbfSOKOCd', //15 X-Factor
    'YSrr6aZfJ7h7p5rKNDIV', //16 X-Men
    '4m8Cfi1fsmJXhkfS3Njk', //17 Young Avengers
    'vfhGxTKsesrDNv0ikOw5', //18 Young X-Men
    '2Jh55d1l5pLyh8Udg0nM', //19 Canadians
    'wlhSjijXbBkWcXsHxxOg', //20 Claws
    'DYMDdvqRcZDrrJY0W1Or', //21 Guardians of the Galaxy
    'DQVHaf2XonWNxSWYuVUl', //22 Worthy of Mjolnir
    'hRZdThueHtwMYD7E4j5C' //23 Flight
];

var bank = [
    9,  // Alpha Flight
    12, // Avengers
    17, // Brotherhood of Evil Mutants
    21, // Excalibur
    22, // Fantastic Four
    23, // Great Lakes Avengers
    25, // Heralds of Galactus
    20, // Defenders
    26, // Illuminati
    32, // New Mutants
    34, // Pet Avengers
    35, // Runaways
    49, // X-Factor
    51, // X-Men
    52, // Young Avengers
    119, // Canadians
    24, // Guardians of the Galaxy
    95, // Worthy of Mjolnir
    66, // Flight
];

export var cat_ids = [
        119, 66, 24,
    95,
    51,
    12
];
var cat_datas = [];

// Get category image elements
const cat_divs = document.getElementsByName('cat');
const cat_coll_name = 'categories_0';

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
    // cat_ids = shuffle(bank).slice(0, 6);
    // check if categories have enough valid answers
    // console.log(`Are categories good? ${areCategoriesGood()}`);

    // loop through ids and category headers
    for (let i=0; i<cat_ids.length; i++) {
        console.log(getCat(cat_ids[i]));
        console.log("S");
        cat_datas[i] = catJSON[getCat(cat_ids[i])];
        make_cat_btn(cat_datas[i], i);
    }
    fill_ans_grids();
    make_grid_btns();
    var giveup_button = document.getElementById("giveup");
    giveup_button.addEventListener("click", function () {
        give_up();
    });
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
    var html_chunk = [];
    if (data['image'] != "") {
        html_chunk = [
            `<div class="tooltip"><img src="${data['image']}" class="grid-content cat-img"><span class="tooltiptext">${data['help-text']}</span></div>`,
            `<div class="tooltip ans-grid-content"><img src="${data['image']}" class="cat-img"><span class="tooltiptext">${data['help-text']}</span></div>`
        ];
    }
    else {
        html_chunk = [
            `<div class="tooltip"><span class="grid-content cat-text">${data['name']}</span><span class="tooltiptext">${data['help-text']}</span></div>`,
            `<div class="tooltip ans-grid-content"><span class="grid-content cat-text">${data['name']}</span><span class="tooltiptext">${data['help-text']}</span></div>`
        ];
    }
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
        cells[i].setAttribute("onclick", `window.open('https://marvel.fandom.com${test_char['href']}', '_blank').focus();`);
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
