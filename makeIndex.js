var catdirs = [
    '/nations/group_Canadians.json',
    '/powers/group_Electrokinesis.json',
    '/teams/group_Guardians.json',
    '/feats/group_WorthyOfMjolnir.json',
    '/teams/group_X-men.json',
    '/teams/group_Avengers.json'
];
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

function main() {
    // Get json categories & make cat btns
    for (let i=0; i<catdirs.length; i++) {
        fetch("./groups"+catdirs[i]).then( function(u){ return u.json(); } ).
            then( function(json){ make_cat_btn(json, i); } )
    }
    fill_grids();
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
    shuffle(catdirs);
    // Get json categories & make cat btns
    for (let i=0; i<catdirs.length; i++) {
        fetch("./groups"+catdirs[i]).then( function(u){ return u.json(); } ).
            then( function(json){ make_cat_btn(json, i); } )
    }
}


function make_cat_btn(json, i) {
    cats[i] = json;
    var html_chunk = []
    html_chunk[0] = '<div class="tooltip"><img src="'+cats[i].image+'" class="grid-content cat-img"><span class="tooltiptext">'+cats[i].name+'</span></div>';
    html_chunk[1] = '<div class="tooltip ans-grid-content"><img src="'+cats[i].image+'" class="cat-img"><span class="tooltiptext">'+cats[i].name+'</span></div>';
    cat_divs[i].innerHTML = html_chunk[0];
    cat_divs[i+6].innerHTML = html_chunk[1];
    cat_divs[i+6+6].innerHTML = html_chunk[1];
    cat_divs[i+6+6+6].innerHTML = html_chunk[1];
}


function fill_grids() {
    var grid = document.getElementById("answer-grid");
    var cells = grid.getElementsByClassName("ans-grid-content");
    for (let i=0; i<cells.length; i++) {
        cells[i].getElementsByTagName('a')[0].setAttribute(
            'href', 
            "answers.html?team1="+catdirs[i%3]+"&team2="+catdirs[Math.floor(i/3)+3]
            );
        cells[i].getElementsByClassName("ans-num")[0].innerHTML = Math.floor(Math.random() * 100)+1;
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
