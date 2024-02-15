await main();

async function main() {
    const spitDiv = document.getElementById('spit-js-here');
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const categoryID_1 = urlParams.get('category1');
    const categoryID_2 = urlParams.get('category2');
    createHeading(categoryID_1, categoryID_2);
    let q = `SELECT charID FROM edges WHERE catID=${categoryID_1} 
        INTERSECT SELECT charID from edges WHERE catID=${categoryID_2}`;
    let intersection = await sqliter.query_sqlite(q);
    await arrToList(intersection, spitDiv);
}

async function createHeading(categoryID_1, categoryID_2) {
    let query = `SELECT catID, name, href FROM categories WHERE catID IN (${categoryID_1}, ${categoryID_2})`;
    let r = await sqliter.query_sqlite(query);
    console.log(r);
    let s = `Characters who belong to both the<br>
        <a href="https://marvel.fandom.com${r[0].href}" target="_blank" 
        rel="noopener noreferrer">${r[0].name}</a> and 
        <a href="https://marvel.fandom.com${r[1].href}" target="_blank" 
        rel="noopener noreferrer">${r[1].name}</a> categories:`;
    let heading_tag = document.getElementsByTagName("h1")[0];
    heading_tag.innerHTML = s;
}

async function arrToList(arr, parent) {
    let container = document.createElement("div");
    container.setAttribute('class', "character-grid");
    parent.appendChild(container);
    for (let i = 0; i < arr.length; i++) {
        createCharacterCell(arr[i].charID, container);
    }
}

async function createCharacterCell(characterID, parent) {
    let q = `SELECT charID, name, href, image, alias 
        FROM characters 
        WHERE charID=${characterID}`;
    let result = await sqliter.query_sqlite(q);
    let data = result[0];
    let html_obj = document.createElement("div");
    html_obj.setAttribute('onclick', `window.open('https://marvel.fandom.com${data.href}','_blank').focus();`);
    html_obj.setAttribute('style', 'cursor:pointer;');
    let s = `<img src = "${data.image}">`
    s += `<div>${data.name}`;
    if (data.alias !== null) {
        s += `<br><i>${data.alias}</i>`;
    }
    s += `</div>`;
    html_obj.innerHTML = s;
    parent.appendChild(html_obj);
}
