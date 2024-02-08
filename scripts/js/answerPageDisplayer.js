import {
    getCharacterData,
    getIntersection,
    getCategoryData
} from "./sheetsImporter.js";

await main();

async function main() {
    const spitDiv = document.getElementById('spit-js-here');
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const categoryID_1 = urlParams.get('category1');
    const categoryID_2 = urlParams.get('category2');
    createHeading(categoryID_1, categoryID_2);
    let intersection = await getIntersection(categoryID_1, categoryID_2);
    await arrayToList(intersection, spitDiv);
}

async function createHeading(categoryID_1, categoryID_2) {
    let catData_1 = await getCategoryData(categoryID_1);
    let catData_2 = await getCategoryData(categoryID_2);
    let s = `Characters who belong to both the<br>`;
    s += `<a href="https://marvel.fandom.com${catData_1.href}" target="_blank" rel="noopener noreferrer">${catData_1.name}</a> and `;
    s += `<a href="https://marvel.fandom.com${catData_2.href}" target="_blank" rel="noopener noreferrer">${catData_2.name}</a> categories:`;
    let heading_tag = document.getElementsByTagName("h1")[1];
    heading_tag.innerHTML = s;
}

async function arrayToList(arr, parent) {
    let container = document.createElement("div");
    container.setAttribute('class', "character-grid");
    parent.appendChild(container);
    for(let i = 0; i < arr.length; i++) {
        await createCharacterCell(arr[i], container);
    }
}

async function createCharacterCell(characterID, parent) {
    let data = await getCharacterData(characterID);
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
