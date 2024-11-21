const cellsOnPage = 50;
let chars = {};
let charChanges = {};
let curPage = 0;
let pageQuantity = 0;

await main();

async function main() {
    await buildCells();
    const spitDiv = document.getElementById('spit-js-here');
    let q = "SELECT charID, offset FROM characters WHERE offset IS NULL";
    let response = await sqliter.query_sqlite(q);
    let charQuantity = response.length;
    pageQuantity = Math.ceil(response.length / cellsOnPage);
    console.log(`${charQuantity} characters\n${pageQuantity} pages`);
    fillPage(curPage);
    chars = response.reduce((acc, { charID, offset }) => {
        acc[charID] = offset;
        return acc;
    }, {});
    buildTopRow();
}

function buildTopRow () {
    let steps = [1, 5, 10, 25, 50];
    let topRow = document.getElementById("top-row");
    for (let i = steps.length-1; i >= 0; i--) {
        buildPageBtn(-steps[i], topRow);
    }
    let tag = document.createElement("span");
    tag.innerHTML = " page ";
    topRow.appendChild(tag);

    tag = document.createElement("span");
    tag.setAttribute("id", "cur-page");
    tag.innerHTML = "1";
    topRow.appendChild(tag);
    
    tag = document.createElement("span");
    tag.innerHTML = " / ";
    topRow.appendChild(tag);

    tag = document.createElement("span");
    tag.setAttribute("id", "page-quant");
    tag.innerHTML = pageQuantity;
    topRow.appendChild(tag);

    for (let i = 0; i < steps.length; i++) {
        buildPageBtn(steps[i], topRow);
    }

    let saveBtn = document.getElementById("save");
    saveBtn.addEventListener("click", function() {
        goThroughChanges();
    });
}

function buildPageBtn (delta, parent) {
    let newBtn = document.createElement("button");
    newBtn.addEventListener("click", function () {
        incrementPage(delta);
    });
    newBtn.innerHTML = (delta >= 0 ? "+" : "") + delta;
    parent.appendChild(newBtn);
}

async function buildCells () {
    let grid = document.getElementById('spit-js-here');
    let gridString = '';
    for (let i = 0; i < cellsOnPage; i++) {
        let cellString = `
        <div style="display: flex;width: min-content;" id="cell-${i}">
            <button id="btn-${i}" class="grid-item"></button>
            <div style="display: inline;">
                <button id="up-${i}" style="display: block;width: 70px;height: 45px;margin: 2px;background-color: var(--ocean);">1</button>
                <button id="zero-${i}" style="display: block;width: 70px;height: 45px;margin: 2px;background-color: var(--ocean);">0</button>
                <button id="down-${i}" style="display: block;width: 70px;height: 45px;margin: 2px;background-color: var(--ocean);">-1</button>
            </div>
        </div>
        `;
        gridString += cellString;
    }
    grid.innerHTML = gridString;
    // let cells = grid.querySelectorAll('[name="btn"]');
    // for (let i = 0; i < cells.length; i++) {
    //     let x = i % 3;
    //     let y = Math.floor(i / 3);
    //     cells[i].addEventListener("click", function () {
    //         grid_btn(x, y);
    //     })
    // }
    for (let i = 0; i < cellsOnPage; i++) {
        document.getElementById(`up-${i}`).addEventListener("click", function () {
            updateCellOffset(i, 1);
        });
        document.getElementById(`zero-${i}`).addEventListener("click", function () {
            updateCellOffset(i, 0);
        });
        document.getElementById(`down-${i}`).addEventListener("click", function () {
            updateCellOffset(i, -1);
        });
    }

    console.log('made grid buttons');
}

function incrementPage (delta) {
    let newPage = curPage + delta;
    if (newPage < 0) newPage = 0;
    else if (newPage >= pageQuantity) newPage = pageQuantity - 1;

    if (newPage == curPage) return;

    fillPage(newPage);
    curPage = newPage;
    document.getElementById("cur-page").innerHTML = newPage + 1;
}

async function fillPage (pageNum) {
    clearPage();
    let q = `
        SELECT charID, name, image, offset
        FROM characters WHERE offset IS NULL
        LIMIT ${pageNum*cellsOnPage}, ${cellsOnPage};
        `;
    let response = await sqliter.query_sqlite(q);

    for (let i = 0; i < cellsOnPage; i++) {
        if (!response[i]) break;
        setCell(i, response[i]);
    }
}

function clearPage () {
    for (let i = 0; i < cellsOnPage; i++) {
        document.getElementById(`btn-${i}`).innerHTML = ``;
    }
}

async function setCell (cellIndex, char) {
    let btn = document.getElementById(`btn-${cellIndex}`);
    let name_to_display = char.name;
    let pattern = /\..*\.$/;
    if (pattern.test(char.alias)) {
        name_to_display = char.alias;
    }
    let image_to_display = "https://upload.wikimedia.org/wikipedia/en/archive/b/b1/20210811082420%21Portrait_placeholder.png";
    if (char.image) { image_to_display = char.image; }
    let offset = 0;
    let offsetCheck = false;
    if (char.offset != null) {
        offset = char.offset;
        offsetCheck = true;
    }
    offset = (1 - offset) * 50;

    btn.innerHTML = `<img id="img-${cellIndex}" src="${image_to_display}" 
        class="grid-content grid-character"
        style="object-position: 0 ${offset}%;">
        <div id="id-${cellIndex}" class="grid-percent">${char.charID}</div>
        <div class="grid-label">${name_to_display} <b>${offsetCheck ? "✔" : "X"}</b></div>
    `;
}

async function updateCellOffset (cellIndex, offset) {
    let id = document.getElementById(`id-${cellIndex}`).innerHTML;
    console.log(id);
    charChanges[`${id}`] = offset;
    let img = document.getElementById(`img-${cellIndex}`);
    offset = (1 - offset) * 50;
    img.setAttribute("style", `object-position: 0 ${offset}%;`);
}

function goThroughChanges () {
    let sqliteString = '';
    for (const [charID, offset] of Object.entries(charChanges)) {
        sqliteString += `UPDATE characters SET offset = ${offset} WHERE charID = ${charID};\n`;
    }
    console.log(sqliteString);
}