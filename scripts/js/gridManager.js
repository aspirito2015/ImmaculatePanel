import { getCategoryIDs, setActiveCell } from './gameManager.js';
import { search_on } from './searchManager.js';
import { importSheet, cleanJSON } from './sheetsImporter.js';

var cat_ids = getCategoryIDs();

main();

async function main() {
    // https://docs.google.com/spreadsheets/d/1FbVRkJ1NM3ZxvR2Ms2rincVCsGE3MYoehnIc8Vxf4NY/edit#gid=0
    var ssid = '1FbVRkJ1NM3ZxvR2Ms2rincVCsGE3MYoehnIc8Vxf4NY';
    var query = buildQuery(cat_ids);
    var json = await importSheet(ssid, "categories_export", query);
    // console.log(json);
    json = cleanJSON(json);
    buildCategories(json);
    buildGridButtons();
    console.log("gridManager.js main() done");
}

function buildQuery(category_ids) {
    var cat_qs = [];
    category_ids.forEach((id) => {
        cat_qs.push(`A='${id}'`);
    })
    var cat_q = cat_qs.join(' or ');
    var query = `select A,B,F,G where ${cat_q}`;
    return query;
}

// Set up all category headers (main grid and all locations in summary panel)
function buildCategories(data) {
    var cat_divs = document.getElementsByName('cat');
    for (let i = 0; i < cat_ids.length; i++) {
        var html_chunk = [];
        var cat_json = data[cat_ids[i]];
        if (cat_json['image'] != "") {
            html_chunk = [
                `<div class="tooltip"><img src="${cat_json['image']}" class="grid-content cat-img"><span class="tooltiptext">${cat_json['help-text']}</span></div>`,
                `<div class="tooltip ans-grid-content"><img src="${cat_json['image']}" class="cat-img"><span class="tooltiptext">${cat_json['help-text']}</span></div>`
            ];
        }
        else {
            html_chunk = [
                `<div class="tooltip"><span class="grid-content cat-text">${cat_json['name']}</span><span class="tooltiptext">${cat_json['help-text']}</span></div>`,
                `<div class="tooltip ans-grid-content"><span class="grid-content cat-text">${cat_json['name']}</span><span class="tooltiptext">${cat_json['help-text']}</span></div>`
            ];
        }
        // make cat headers for main grid
        cat_divs[i].innerHTML = html_chunk[0];
        // make cat headers for summary grids
        cat_divs[i + 6].innerHTML = html_chunk[1];
        cat_divs[i + 6 + 6].innerHTML = html_chunk[1];
        cat_divs[i + 6 + 6 + 6].innerHTML = html_chunk[1];
    }
    console.log('made category headers');
}

function buildGridButtons() {
    let grid = document.getElementById("main-grid");
    let cells = grid.querySelectorAll('[name="btn"]');
    for (let i = 0; i < cells.length; i++) {
        let x = i % 3;
        let y = Math.floor(i / 3);
        cells[i].addEventListener("click", function () {
            grid_btn(x, y);
        })
    }
    console.log('made grid buttons');
}

function grid_btn(x, y) {
    if (guesses <= 0) return;
    setActiveCell(x, y);
    search_on();
}
