import { getCategoryIDs, getSummaryBools, getGameScore } from "./gameManager.js";

main();

function main() {
    document.getElementById("giveup").addEventListener("click", function () {
        summary_on();
    });
    document.getElementById("x-btn").addEventListener("click", function () {
        summary_off();
    });
    document.getElementById("copy-sum").addEventListener("click", function () {
        copy_sum();
    });
    fillSummaryPanel();
}

export function summary_on() {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("sum").style.display = "";
    document.body.classList.add('noscroll');
    document.getElementById("game-score").innerHTML = getGameScore();
}

export function summary_off() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("sum").style.display = "none";
    document.body.classList.remove('noscroll');
}

async function fillSummaryPanel() {
    let answerGrid = document.getElementById("answer-grid");
    let intersection_tags = answerGrid.getElementsByClassName("ans-num");
    let hyperlink_tags = answerGrid.getElementsByTagName("a");
    let category_ids = getCategoryIDs();
    let prolificGrid = document.getElementById("percentage-grid");
    let character_tags = prolificGrid.getElementsByClassName("ans-grid-cell");
    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            let cat_1 = category_ids[x];
            let cat_2 = category_ids[y + 3];
            let q = `SELECT catID_1, intersectionSize FROM intersections WHERE 
            (catID_1=${cat_1} AND catID_2=${cat_2})`;
            let t = Date.now();
            let result = await sqliter.query_sqlite(q);
            console.log(Date.now()-t);
            let n = result[0].intersectionSize;
            let index = x + 3 * y;
            let url = `answers.html?category1=${cat_1}&category2=${cat_2}`;
            hyperlink_tags[index].href = url;
            hyperlink_tags[index].target = "_blank";
            intersection_tags[index].innerHTML = n;
        }
    }
    let q = `SELECT image, href FROM characters WHERE charID = (SELECT defaultCharID FROM intersections WHERE intersectionID = 12696)`;
    let result = await sqliter.query_sqlite(q);
    let charData = result[0];
    character_tags[0].innerHTML = 
        `<a href="https://marvel.fandom.com${charData.href}" target="_blank">
        <img src="${charData.image}" 
        class="grid-content grid-character"></a>`;
    console.log("finished filling summary panel");
}

function copy_sum() {
    let emoji_grid = "";
    let count = 0;
    let sum_bools = getSummaryBools();
    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            if (sum_bools[x + 3 * y]) {
                // Green Square: 🟩 Dec: &#129001	Hex: &#x1F7E9
                emoji_grid += "&#129001";
                count++;
            } else {
                // White Square: ⬜ Dec: &#11036    Hex:	&#x2B1C
                emoji_grid += "&#11036";
            }
        }
        emoji_grid += "\n";
    }
    // txt = "Immaculate Inning 999 " + count + "/9:\nRarity: "+getGameScore()+"\n" + txt + "Play at https://aspirito2015.github.io/ImmaculatePanel/";
    let gameScore = getGameScore();
    let txt = `Immaculate Panel #___ ${count}/9:\nRarity: ${gameScore}\n${emoji_grid}Play at https://aspirito2015.github.io/ImmaculatePanel/`;
    let copy_tmp = document.getElementById("copy-tmp");
    copy_tmp.innerHTML = txt;
    navigator.clipboard.writeText(copy_tmp.innerHTML);
    console.log("Copied to clipboard");
}
