var btn_tags = document.getElementsByName("btn");
var btn_active_tag;
var btn_active_x;
var btn_active_y;
var guessesLeft = 9;
var bad_guess_grid = [[], [], [], [], [], [], [], [], []];
var used_chars = [];
var summary_bools = Array(9).fill(false);
var characters = {};
var gameScore = 0;
var cat_ids = [119, 66, 24, 95, 51, 12];
// cat_ids = [92, 37, 39, 17, 38, 28]; // longest names
// cat_ids = [97, 99, 46, 11, 24, 45]; // 2nd longest names
// cat_ids = [49, 140, 2, 6, 3, 4]; // 3rd longest names

main();

async function main() {
    updateGuesses(guessesLeft);
    document.getElementById("giveup").addEventListener("click", function () {
        updateGuesses(0);
    });
}

export function getSummaryBools() { return summary_bools; }

export function getCategoryIDs() { return cat_ids; }

export function getActiveCellCoords() { return [btn_active_x, btn_active_y]; }

export function getActiveCellIndex() { return btn_active_x + 3 * btn_active_y; }

export function getGameScore() { return gameScore; }

export function getGuessesLeft() { return guessesLeft; }

export function setActiveCell(x, y) {
    // console.log(`gameManager | active cell set to ${x}, ${y}`);
    btn_active_x = x;
    btn_active_y = y;
    btn_active_tag = btn_tags[x + 3 * y];
    btn_active_tag.classList.add("highlighted");
}

export function clearActiveCell() {
    // console.log('gameManager | active cell cleared');
    btn_active_x = null;
    btn_active_y = null;
    if (btn_active_tag == null) return;
    btn_active_tag.classList.remove("highlighted");
    btn_active_tag = null;
}

export async function fillActiveCell(characterID) {
    console.log(`gameManager.fillActiveCell | started`);
    // update summary
    let index = getActiveCellIndex();
    let summaryCells = document.getElementsByClassName("sum-grid-cell");
    summaryCells[index].setAttribute("style", "background-color: #59d185;");
    summary_bools[index] = true;
    // increase score
    let charScore = Math.round(await getAnswerScore(characterID));
    gameScore += charScore;
    if (summary_bools.every(Boolean)) gameScore += 100;
    // add characterID to list of used characters
    used_chars.push(characterID);
    // update the html component(s)
    let q = `SELECT charID, name, href, image, alias, offset FROM characters WHERE charID=${characterID} LIMIT 1`;
    btn_active_tag.setAttribute("style", "background-color: #283444;");
    let result = await sqliter.query_sqlite(q);
    let characterData = result[0];
    let name_to_display = characterData.name;
    let pattern = /\..*\.$/;
    if (pattern.test(characterData.alias)) {
        name_to_display = characterData.alias;
    }
    let image_to_display = "https://upload.wikimedia.org/wikipedia/en/archive/b/b1/20210811082420%21Portrait_placeholder.png";
    if (characterData.image) { image_to_display = characterData.image; }
    let offset = 0;
    if (characterData.offset) {
        offset = characterData.offset;
    }
    offset = (1 - offset) * 50;
    btn_active_tag.innerHTML = `<img src="${image_to_display}" 
        class="grid-content grid-character"
        style="object-position: 0 ${offset}%;">
        <div class="grid-percent">${charScore} pts</div>
        <div class="grid-label">${name_to_display}</div>`;
    // replace event listener on grid button with one that opens link to wiki
    let new_btn_active = removeAllEventListeners(btn_active_tag);
    new_btn_active.addEventListener('click', function () {
        let url = `https://marvel.fandom.com${characterData.href}`;
        window.open(url, '_blank').focus();
    });
}

// Function to remove all event listeners from an element
function removeAllEventListeners(element) {
    let clone = element.cloneNode(true);
    element.parentNode.replaceChild(clone, element);
    return clone;
}



export function getBadGuesses(x, y) {
    if (arguments.length == 0) {
        x = btn_active_x;
        y = btn_active_y;
    }
    var bad_guesses = bad_guess_grid[x + 3 * y];
    if (bad_guesses === undefined) return null;
    return bad_guesses;
}

export function addBadGuess(characterID, x, y) {
    if (arguments.length < 3) {
        x = btn_active_x;
        y = btn_active_y;
    }
    let index = x + 3 * y;
    bad_guess_grid[index].push(characterID);
}



export function getUsedCharTags() { return used_chars; }

export async function getCharactersAll() {
    let start = new Date();
    console.log(`gameManager | character query started`);
    if (characters.length === undefined || characters.length < 1) {
        let q = `SELECT charID, name, alias FROM characters`;
        characters = await sqliter.query_sqlite(q);
    }
    let now = new Date();
    console.log(`gameManager | character query took ${now - start} ms`);
    return characters;
}

export async function getCharactersPage(page = 1, pageSize = 10) {
    // Calculate the offset based on page and pageSize
    const offset = (page - 1) * pageSize;
    const query = `
        SELECT charID, name, alias
        FROM characters
        LIMIT ${pageSize} OFFSET ${offset}
    `;
    const characters = await sqliter.query_sqlite(query);
    // console.log(characters);
    return characters;
}

export async function isCharacterValid(characterID) {
    var cat_id_x = cat_ids[btn_active_x];
    var cat_id_y = cat_ids[3 + btn_active_y];
    var query = `SELECT edgeID, catID FROM edges WHERE charID=${characterID} 
        AND catID IN (${cat_id_x}, ${cat_id_y})`;
    let response = await sqliter.query_sqlite(query);
    let length = response.length;
    var valid = length >= 2;
    console.log(`gameManager | ${characterID} ${valid ? "valid" : "invalid"}`);
    return valid;
}

export async function getAnswerScore(characterID) {
    var catID_x = cat_ids[btn_active_x];
    var catID_y = cat_ids[3 + btn_active_y];
    var query = `
        SELECT c.charID, c.appearances
        FROM characters c
        WHERE c.charID IN (
            SELECT e1.charID
            FROM edges e1
            INNER JOIN edges e2
            ON e1.charID = e2.charID
            WHERE e1.catID = ${catID_x} AND e2.catID = ${catID_y}
        )
        ORDER BY c.appearances DESC;`;

    let response = await sqliter.query_sqlite(query);
    let maxA = response[0].appearances;
    let minA = response[response.length - 1].appearances;
    let charAppearances = -1;
    for (let i = 0; i < response.length; i++) {
        if (response[i].charID == characterID) {
            charAppearances = response[i].appearances;
        }
    }
    if (charAppearances < 0) {
        console.log("gameManager | Something went wrong. Could not find selected character's appearances.");
        return maxA;
    }
    let maxP = 100;
    let minP = 20;
    let power = 2;
    let points = minP + (-minP + maxP) * Math.pow((Math.log(maxA / charAppearances) / Math.log(maxA / minA)), power);
    if (isNaN(points)) points = maxP;
    return points;
}


export function decrementGuesses() {
    updateGuesses(guessesLeft - 1);
}

function updateGuesses(i) {
    guessesLeft = i;
    let guessdiv = document.getElementById("guesses");
    animate_guesses(guessdiv, 0, guessesLeft, 300);
    if (guessesLeft <= 0) lose();
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

function lose() {
    let giveup_button = document.getElementById("giveup");
    giveup_button.innerHTML = "Show Summary";
    giveup_button.click();
    for (let i = 0; i < btn_tags.length; i++) {
        btn_tags[i].classList.remove("grid-item");
        btn_tags[i].classList.add("grid-item-no-hover");
    }
}
