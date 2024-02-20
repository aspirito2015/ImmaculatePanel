await main();

async function main() {
    const spitDiv = document.getElementById('spit-js-here');
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const categoryID_1 = urlParams.get('category1');
    const categoryID_2 = urlParams.get('category2');
    createHeading(categoryID_1, categoryID_2);
    let q = `
        SELECT name, href, image, alias
        FROM   characters
        WHERE  charid IN (SELECT charid
            FROM   edges
            WHERE  catid = ${categoryID_1}
            INTERSECT
            SELECT charid
            FROM   edges
            WHERE  catid = ${categoryID_2})
        ORDER BY appearances DESC;
        `;
    let intersection = await sqliter.query_sqlite(q);
    console.log(intersection);
    await arrToList(intersection, spitDiv);
}

async function createHeading(categoryID_1, categoryID_2) {
    let query = `SELECT catID, name, href FROM categories WHERE catID IN (${categoryID_1}, ${categoryID_2})`;
    let r = await sqliter.query_sqlite(query);
    // console.log(r);
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
        createCharacterCell(arr[i], container);
    }
}

async function createCharacterCell(charData, parent) {
    // console.log(charData);
    let html_obj = document.createElement("div");
    html_obj.setAttribute('onclick', `window.open('https://marvel.fandom.com${charData.href}','_blank').focus();`);
    html_obj.setAttribute('style', 'cursor:pointer;');
    html_obj.setAttribute('class', 'drop-box');
    let s = ``;
    if (charData.image == "" || charData.image == null) {
        s = `<img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png" style="height: 100%;object-fit: cover;">`;
    } else {
        s = `<img src = "${charData.image}">`;
    }
    s += `<div>`;
    s += `${charData.name}`;
    if (charData.alias !== null) {
        s += `<br>`;
        s += `<i>${charData.alias}</i>`;
    }
    s += `</div>`;
    html_obj.innerHTML = s;
    parent.appendChild(html_obj);
}
