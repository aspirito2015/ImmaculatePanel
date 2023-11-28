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
var guesses = 9;
var bad_guesses = [[],[],[],[],[],[],[],[],[]];
var used_chars = [];
var sum_bools = Array(9).fill(false);

// Get json list of characters
fetch("./char_ALL.json").then( function(u){ return u.json(); } ).
    then( function(json){ import_all_chars(json); } )

function import_all_chars(json) {
    json.forEach(function(m) {
        addToList(m);
        all_chars[m.name] = m;
    });
}

function addToList(m) {
    var charlist = document.getElementById('charlist');
    var li = document.createElement("li");
    li.setAttribute('name', m.name);
    li.innerHTML += "<div>"+m.alias+"<div class='sub'>"+m.name+"</div></div><button onclick=\"srch_btn(\'"+m.name+"\')\">Select</button><div class='sub used' style='display: none;'>Already Used</div>";
    charlist.appendChild(li);
    li.style.display = "none";
}


// Get category image elements
const cat_divs = document.getElementsByName('cat');
// Get json categories & make cat btns
for (let i=0; i<catdirs.length; i++) {
    fetch("./groups"+catdirs[i]).then( function(u){ return u.json(); } ).
        then( function(json){ data_function(json, i); } )
}

function data_function(json, i) {
    cats[i] = json;
    cat_divs[i].innerHTML = '<div class="tooltip"><img src="'+cats[i].image+'" class="grid-content cat-img"><span class="tooltiptext">'+cats[i].name+'</span></div>';
}

function cat_btn(cat_name) {
    alert("CAT_BTN: "+cat_name);
}


// Handle search bar enable/disable
srch_bar.addEventListener("click", function(e) { e.stopPropagation(); } );
document.getElementById('sum').addEventListener("click", function(e) { e.stopPropagation(); } );

document.getElementById('overlay').addEventListener("click", function() {
    search_off();
    summary_off();
});

function btnPrevGrids() { search_on(); }

function search_on() {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("srch_bar").style.display = "";    
    document.getElementById("search").focus();
    body.classList.add('noscroll');
    // set all bad btns
    bad_btns = bad_guesses[btn_active_x+3*btn_active_y];
    for (var i=0; i < bad_btns.length; i++) {
        setBtnBad(bad_btns[i]);
    }
    for (var i=0; i < used_chars.length; i++) {
        setBtnUsed(used_chars[i]);
    }
}

function search_off() {
    // set all bad btns to good
    bad_btns = bad_guesses[btn_active_x+3*btn_active_y];
    if (bad_btns === undefined) return;
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


function grid_btn(x, y) {
    if (guesses <= 0) return;
    btn_active_x = x;
    btn_active_y = y;
    btn_active_html = btns_html[x+(3*y)];
    btn_active_html.classList.add('highlighted');
    search_on();
    // alert('Column: '+x+' - '+cats[x].name+'\nRow: '+y+' - '+cats[y+3].name);
}

function srch_btn(charname) {
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


// Filter list while searching
function filterFunction() {
    var input, ul, li;
    
    input = document.getElementById("search");
    const pattern = new RegExp('\\b' + input.value, 'i');
    ul = document.getElementById("charlist");
    ul.style.display = "";
    li = ul.getElementsByTagName("li");
    for (var i = 0; i < li.length; i++) {
        txtValue = li[i].textContent || li[i].innerText;
        if (pattern.test(txtValue)) {
            li[i].style.display = "";
        } else {
            li[i].style.display = "none";
        }
    }
}

function filterClear() {
    input = document.getElementById("search");
    input.value = "";
    ul = document.getElementById("charlist");
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
    guessdiv = document.getElementById("guesses");
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