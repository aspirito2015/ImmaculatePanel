import { sqliteQueryOLD } from "./sqliteQuerier.js";

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
    let intersection = await sqliteQueryOLD(q);
    console.log(intersection);
    await objToList(intersection, spitDiv);
}

async function createHeading(categoryID_1, categoryID_2) {
    let query = `SELECT catID, name, href FROM categories WHERE catID=${categoryID_1} or catID=${categoryID_2}`;
    let result = await sqliteQueryOLD(query);
    let catData_1 = result[categoryID_1];
    let catData_2 = result[categoryID_2];
    let s = `Characters who belong to both the<br>
        <a href="https://marvel.fandom.com${catData_1.href}" target="_blank" 
        rel="noopener noreferrer">${catData_1.name}</a> and 
        <a href="https://marvel.fandom.com${catData_2.href}" target="_blank" 
        rel="noopener noreferrer">${catData_2.name}</a> categories:`;
    let heading_tag = document.getElementsByTagName("h1")[1];
    heading_tag.innerHTML = s;
}

async function objToList(obj, parent) {
    let container = document.createElement("div");
    container.setAttribute('class', "character-grid");
    parent.appendChild(container);
    Object.keys(obj).forEach(function(k){
        console.log(obj[k].charID);
        createCharacterCell(obj[k].charID, container);
    });
}

async function createCharacterCell(characterID, parent) {
    let q = `SELECT charID, name, href, image, alias 
        FROM characters 
        WHERE charID=${characterID}`;
    let result = await sqliteQueryOLD(q);
    let data = result[characterID];
    // console.log(data);
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
